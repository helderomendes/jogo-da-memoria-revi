// Camada de acesso a dados do totem. Agora persiste no Supabase (Postgres +
// Storage). As assinaturas continuam iguais às da versão localStorage, então
// nenhuma tela precisou mudar. O histórico de pares (anti-repetição) continua
// local por dispositivo — é estado efêmero de gameplay, não gestão do admin.
import { supabase } from './supabaseClient'
import { readJSON, writeJSON } from './storage'
import { DEFAULT_CARDS } from '../data/cards'
import { DEFAULT_PRIZE_TIERS } from '../data/prizes'
import { DEFAULT_GAME_CONFIG } from '../data/config'
import { DEFAULT_PRIZE_ICON } from '../data/prizeIcons'
import { determinePrize } from './gameEngine'

const LOCAL_KEYS = {
  pairHistory: 'pairHistory',
}

// --- Camada offline-first --------------------------------------------------
// Leituras (cartas/config/brindes) são "rede primeiro, cache depois": quando há
// internet, busca no Supabase e guarda uma cópia local; sem internet, devolve a
// última cópia salva (ou os defaults). Escritas (partida + premiação) entram
// numa fila local quando offline e sobem quando a conexão volta (syncPending).
const CACHE_KEYS = {
  cards: 'cache:cards',
  config: 'cache:config',
  tiers: 'cache:tiers',
}
const QUEUE_KEYS = {
  logs: 'queue:logs', // linhas game_logs aguardando insert
  awards: 'queue:awards', // brindes premiados offline aguardando baixa de estoque
}

const isOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine)

// Cache em memória (por sessão) — evita reparse do localStorage e devolve leitura
// instantânea entre telas.
const memCache = new Map()

function getCache(key) {
  if (memCache.has(key)) return memCache.get(key)
  const v = readJSON(key, undefined)
  if (v !== undefined) memCache.set(key, v)
  return v
}

function setCache(key, data) {
  memCache.set(key, data)
  writeJSON(key, data)
}

// Stale-while-revalidate: se já existe cópia em cache, devolve NA HORA e
// revalida no servidor em segundo plano (não trava a transição de tela). Só
// espera a rede na primeira vez (cache vazio). `remoteFn` deve LANÇAR em erro.
async function readWithCache(cacheKey, remoteFn, fallback) {
  const cached = getCache(cacheKey)
  const hasCached = cached !== undefined && cached !== null

  const revalidate = () =>
    remoteFn()
      .then((data) => {
        setCache(cacheKey, data)
        return data
      })
      .catch((e) => {
        console.warn(`[offline] usando cache de ${cacheKey}:`, e?.message ?? e)
        return null
      })

  if (hasCached) {
    // Revalida em background sem bloquear (só quando online).
    if (isOnline()) revalidate()
    return cached
  }

  // Sem cache: primeira carga precisa esperar a rede (ou cair no fallback).
  if (isOnline()) {
    const data = await revalidate()
    if (data != null) return data
  }
  return fallback
}

function enqueue(key, item) {
  const list = readJSON(key, [])
  list.push(item)
  writeJSON(key, list)
}

// Quantidade de escritas pendentes (partidas + baixas de estoque) aguardando sync.
export function getPendingCount() {
  return readJSON(QUEUE_KEYS.logs, []).length + readJSON(QUEUE_KEYS.awards, []).length
}

// Carrega e DECODIFICA uma imagem: baixa os bytes (o SW guarda no cache) e já
// deixa o bitmap decodificado, pra o primeiro render ser instantâneo — sem
// "bugar"/aparecer vazio na primeira partida. Cai num fetch simples se o
// decode não estiver disponível.
function preloadImage(url) {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(true)
      img.onerror = () => fetch(url).then(() => resolve(true)).catch(() => resolve(false))
      img.src = url
      if (img.decode) img.decode().then(() => resolve(true)).catch(() => {})
    } catch {
      fetch(url).then(() => resolve(true)).catch(() => resolve(false))
    }
  })
}

// Pré-carrega TODAS as imagens (capas dos cards + fotos dos brindes), mesmo as
// que ainda não apareceram na tela. Ficam no cache do SW (persistente entre
// sessões, reboots e deploys) E decodificadas, então a primeira partida já
// mostra tudo na hora.
export async function prefetchAllMedia() {
  if (!isOnline()) return 0
  try {
    const [cards, tiers] = await Promise.all([getCards(), getPrizeTiers()])
    const urls = [...(cards ?? []), ...(tiers ?? [])].map((x) => x?.image).filter(Boolean)
    const unique = [...new Set(urls)]
    await Promise.allSettled(unique.map(preloadImage))
    return unique.length
  } catch {
    return 0
  }
}

// Tag de origem: todo lead do totem é marcado com ela. Sempre normalizamos para
// que 'jogo-da-memoria' fique como a ÚLTIMA tag, independente do que o admin
// adicionar manualmente.
export const SOURCE_TAG = 'jogo-da-memoria'

export function normalizeTags(tags) {
  const list = (Array.isArray(tags) ? tags : String(tags ?? '').split(','))
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.toLowerCase() !== SOURCE_TAG)
  list.push(SOURCE_TAG)
  return list
}

// --- Mapeamentos linha do banco (snake_case) <-> objeto do app (camelCase) ---
function rowToCard(row) {
  return {
    id: row.id,
    text: row.text ?? '',
    image: row.image ?? null,
    mode: row.mode ?? (row.image ? 'image' : 'text'),
  }
}

function rowToTier(row) {
  return {
    id: row.id,
    pairs: row.pairs ?? null,
    label: row.label ?? '',
    description: row.description ?? '',
    icon: row.icon ?? DEFAULT_PRIZE_ICON,
    image: row.image ?? null,
    enabled: row.enabled !== false,
    stockInitial: row.stock_initial ?? null,
    stock: row.stock ?? null,
  }
}

// --- Cartas ---
async function fetchCardsRemote() {
  const { data, error } = await supabase.from('cards').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []).map(rowToCard)
}

export async function getCards() {
  return readWithCache(
    CACHE_KEYS.cards,
    fetchCardsRemote,
    DEFAULT_CARDS.map((c) => ({ ...c, mode: c.image ? 'image' : 'text' })),
  )
}

export async function saveCards(cards) {
  const rows = cards.map((c, i) => ({
    id: c.id,
    text: c.text ?? '',
    image: c.image ?? null,
    mode: c.mode ?? 'text',
    sort_order: i,
    updated_at: new Date().toISOString(),
  }))
  // Apaga os removidos (ids que não estão mais na lista).
  const { data: existing } = await supabase.from('cards').select('id')
  const keep = new Set(rows.map((r) => r.id))
  const toDelete = (existing ?? []).filter((r) => !keep.has(r.id)).map((r) => r.id)
  if (toDelete.length) await supabase.from('cards').delete().in('id', toDelete)
  const { error } = await supabase.from('cards').upsert(rows)
  if (error) throw error
  setCache(CACHE_KEYS.cards, cards.map((c) => rowToCard({ ...c })))
  return cards
}

// Sobe imagem de capa pro Storage e devolve a URL pública.
export async function uploadCardImage(file) {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('card-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  return data.publicUrl
}

// Sobe a foto de um brinde pro Storage e devolve a URL pública.
export async function uploadPrizeImage(file) {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('prize-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('prize-images').getPublicUrl(path)
  return data.publicUrl
}

// --- Faixas de prêmio ---
async function fetchPrizeTiersRemote() {
  const { data, error } = await supabase.from('prize_tiers').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []).map(rowToTier)
}

export async function getPrizeTiers() {
  return readWithCache(CACHE_KEYS.tiers, fetchPrizeTiersRemote, DEFAULT_PRIZE_TIERS)
}

export async function savePrizeTiers(tiers) {
  const rows = tiers.map((t, i) => ({
    id: t.id,
    pairs: t.pairs ?? null,
    label: t.label ?? '',
    description: t.description ?? '',
    icon: t.icon ?? DEFAULT_PRIZE_ICON,
    image: t.image ?? null,
    enabled: t.enabled !== false,
    stock_initial: t.stockInitial ?? null,
    stock: t.stock ?? null,
    sort_order: i,
    updated_at: new Date().toISOString(),
  }))
  const { data: existing } = await supabase.from('prize_tiers').select('id')
  const keep = new Set(rows.map((r) => r.id))
  const toDelete = (existing ?? []).filter((r) => !keep.has(r.id)).map((r) => r.id)
  if (toDelete.length) await supabase.from('prize_tiers').delete().in('id', toDelete)
  const { error } = await supabase.from('prize_tiers').upsert(rows)
  if (error) throw error
  setCache(CACHE_KEYS.tiers, rows.map(rowToTier))
  return tiers
}

// Premiação. ONLINE: o banco escolhe a melhor faixa com estoque e dá baixa numa
// só transação (seguro pra múltiplos totens). OFFLINE (ou se a chamada falhar):
// decide localmente pelo snapshot de brindes em cache, dá baixa no estoque local
// e enfileira a baixa pra reconciliar no servidor quando a internet voltar.
// Retorna o tier ganho ou null.
export async function awardPrize(correctPairs) {
  if (isOnline()) {
    const { data, error } = await supabase.rpc('award_prize', { correct_pairs: correctPairs })
    if (!error) {
      if (!data || data.length === 0) return null
      const tier = rowToTier(data[0])
      // Mantém o snapshot local coerente com o servidor pra um eventual offline.
      syncTierStockCache(tier)
      return tier
    }
    console.warn('[awardPrize] falhou online, indo pro modo offline:', error.message)
  }
  return awardPrizeOffline(correctPairs)
}

// Premiação 100% local: usa o cache de brindes, aplica a mesma regra de faixa/
// estoque do servidor (determinePrize) e registra a baixa na fila de sync.
function awardPrizeOffline(correctPairs) {
  const tiers = getCache(CACHE_KEYS.tiers) ?? DEFAULT_PRIZE_TIERS
  const chosen = determinePrize(correctPairs, tiers)
  if (!chosen) return null

  const updated = tiers.map((t) =>
    t.id === chosen.id && typeof t.stock === 'number' ? { ...t, stock: Math.max(0, t.stock - 1) } : t,
  )
  setCache(CACHE_KEYS.tiers, updated)
  enqueue(QUEUE_KEYS.awards, { tierId: chosen.id, at: new Date().toISOString() })
  return chosen
}

// Reflete no cache local a baixa que o servidor acabou de fazer (premiação online).
function syncTierStockCache(tier) {
  const tiers = getCache(CACHE_KEYS.tiers)
  if (!tiers) return
  setCache(
    CACHE_KEYS.tiers,
    tiers.map((t) => (t.id === tier.id ? { ...t, stock: tier.stock } : t)),
  )
}

// Restaura o estoque atual de cada tier ao valor inicial cadastrado (uso admin).
export async function resetPrizeStock() {
  const tiers = await getPrizeTiers()
  const rows = tiers.map((t, i) => ({
    id: t.id,
    pairs: t.pairs ?? null,
    label: t.label ?? '',
    description: t.description ?? '',
    icon: t.icon ?? DEFAULT_PRIZE_ICON,
    image: t.image ?? null,
    enabled: t.enabled !== false,
    stock_initial: t.stockInitial ?? null,
    stock: t.stockInitial ?? null,
    sort_order: i,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('prize_tiers').upsert(rows)
  if (error) throw error
  const mapped = rows.map(rowToTier)
  setCache(CACHE_KEYS.tiers, mapped)
  return mapped
}

// --- Configuração do jogo ---
async function fetchGameConfigRemote() {
  const { data, error } = await supabase.from('game_config').select('data').eq('id', 1).maybeSingle()
  if (error) throw error
  return { ...DEFAULT_GAME_CONFIG, ...(data?.data ?? {}) }
}

export async function getGameConfig() {
  return readWithCache(CACHE_KEYS.config, fetchGameConfigRemote, { ...DEFAULT_GAME_CONFIG })
}

export async function saveGameConfig(config) {
  const { error } = await supabase
    .from('game_config')
    .upsert({ id: 1, data: config, updated_at: new Date().toISOString() })
  if (error) throw error
  setCache(CACHE_KEYS.config, { ...DEFAULT_GAME_CONFIG, ...config })
  return config
}

// --- Histórico de pares (anti-repetição) — local por dispositivo ---
export async function getPairHistory() {
  return readJSON(LOCAL_KEYS.pairHistory, [])
}

export async function pushPairHistory(pairIds, keepLastGames) {
  const history = await getPairHistory()
  const updated = [pairIds, ...history].slice(0, keepLastGames)
  writeJSON(LOCAL_KEYS.pairHistory, updated)
  return updated
}

// --- Logs de partida / leads ---
function rowToLog(row) {
  return {
    id: row.id,
    timestamp: row.created_at,
    name: row.name,
    phone: row.phone,
    company: row.company,
    pairsSorteados: row.pairs_sorteados ?? [],
    chancesUsadas: row.chances_usadas,
    paresCertos: row.pares_certos,
    premioGanho: row.premio_ganho,
    codigoRetirada: row.codigo_retirada,
    tags: row.tags?.length ? row.tags : [SOURCE_TAG],
  }
}

// Monta o payload snake_case pro banco. `partial` = só inclui os campos
// presentes (usado no update); tags sempre normalizadas com a origem no final.
function logToRow(log, { partial = false } = {}) {
  const row = {}
  const set = (key, has, value) => {
    if (!partial || has) row[key] = value
  }
  set('created_at', 'timestamp' in log, log.timestamp ?? new Date().toISOString())
  set('name', 'name' in log, log.name ?? null)
  set('phone', 'phone' in log, log.phone || null)
  set('company', 'company' in log, log.company || null)
  set('pairs_sorteados', 'pairsSorteados' in log, log.pairsSorteados ?? [])
  set('chances_usadas', 'chancesUsadas' in log, log.chancesUsadas ?? null)
  set('pares_certos', 'paresCertos' in log, log.paresCertos ?? null)
  set('premio_ganho', 'premioGanho' in log, log.premioGanho || null)
  set('codigo_retirada', 'codigoRetirada' in log, log.codigoRetirada || null)
  set('tags', 'tags' in log, normalizeTags(log.tags))
  return row
}

export async function getGameLogs() {
  const { data, error } = await supabase
    .from('game_logs')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[getGameLogs]', error.message)
    return []
  }
  return (data ?? []).map(rowToLog)
}

// Registro automático pelo totem no fim da partida. Offline (ou em erro), a
// linha vai pra fila local e sobe no próximo sync.
export async function appendGameLog(log) {
  const row = logToRow(log)
  if (isOnline()) {
    const { error } = await supabase.from('game_logs').insert(row)
    if (!error) return log
    console.warn('[appendGameLog] falhou online, enfileirando:', error.message)
  }
  enqueue(QUEUE_KEYS.logs, row)
  return log
}

// Sobe tudo que ficou pendente enquanto o totem esteve offline: primeiro as
// partidas (insert em game_logs), depois as baixas de estoque dos brindes
// premiados offline. Cada item só sai da fila quando confirma no servidor.
// Retorna quantos itens ainda restam pendentes.
export async function syncPending() {
  if (!isOnline()) return getPendingCount()

  // 1) Partidas pendentes — uma a uma, pra não perder o lote inteiro num erro.
  const logs = readJSON(QUEUE_KEYS.logs, [])
  if (logs.length) {
    const remaining = []
    for (const row of logs) {
      const { error } = await supabase.from('game_logs').insert(row)
      if (error) remaining.push(row)
    }
    writeJSON(QUEUE_KEYS.logs, remaining)
  }

  // 2) Baixas de estoque dos brindes premiados offline.
  const awards = readJSON(QUEUE_KEYS.awards, [])
  if (awards.length) {
    const remaining = []
    for (const a of awards) {
      const { error } = await supabase.rpc('decrement_prize_stock', { p_id: a.tierId, p_qty: 1 })
      if (error) remaining.push(a)
    }
    writeJSON(QUEUE_KEYS.awards, remaining)
    // Reatualiza o snapshot local de brindes com o estoque real do servidor.
    try {
      await fetchPrizeTiersRemote().then((t) => setCache(CACHE_KEYS.tiers, t))
    } catch {
      /* sem rede de novo: mantém o cache atual */
    }
  }

  return getPendingCount()
}

// Inserção manual pelo admin. Retorna o lead criado (com id).
export async function addGameLog(log) {
  const { data, error } = await supabase
    .from('game_logs')
    .insert(logToRow(log))
    .select()
    .single()
  if (error) throw error
  return rowToLog(data)
}

// Edição manual pelo admin. `fields` = só os campos alterados.
export async function updateGameLog(id, fields) {
  const { data, error } = await supabase
    .from('game_logs')
    .update(logToRow(fields, { partial: true }))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToLog(data)
}

// Exclusão de um lead específico.
export async function deleteGameLog(id) {
  const { error } = await supabase.from('game_logs').delete().eq('id', id)
  if (error) throw error
}

export async function clearGameLogs() {
  // delete requer um filtro; este `neq` pega todas as linhas.
  const { error } = await supabase
    .from('game_logs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
  return []
}

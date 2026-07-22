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

const LOCAL_KEYS = {
  pairHistory: 'pairHistory',
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
    enabled: row.enabled !== false,
    stockInitial: row.stock_initial ?? null,
    stock: row.stock ?? null,
  }
}

// --- Cartas ---
export async function getCards() {
  const { data, error } = await supabase.from('cards').select('*').order('sort_order')
  if (error) {
    console.error('[getCards]', error.message)
    return DEFAULT_CARDS.map((c) => ({ ...c, mode: c.image ? 'image' : 'text' }))
  }
  return (data ?? []).map(rowToCard)
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

// --- Faixas de prêmio ---
export async function getPrizeTiers() {
  const { data, error } = await supabase.from('prize_tiers').select('*').order('sort_order')
  if (error) {
    console.error('[getPrizeTiers]', error.message)
    return DEFAULT_PRIZE_TIERS
  }
  return (data ?? []).map(rowToTier)
}

export async function savePrizeTiers(tiers) {
  const rows = tiers.map((t, i) => ({
    id: t.id,
    pairs: t.pairs ?? null,
    label: t.label ?? '',
    description: t.description ?? '',
    icon: t.icon ?? DEFAULT_PRIZE_ICON,
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
  return tiers
}

// Premiação atômica: o banco escolhe a melhor faixa com estoque e dá baixa numa
// só transação (seguro pra múltiplos totens). Retorna o tier ganho ou null.
export async function awardPrize(correctPairs) {
  const { data, error } = await supabase.rpc('award_prize', { correct_pairs: correctPairs })
  if (error) {
    console.error('[awardPrize]', error.message)
    return null
  }
  if (!data || data.length === 0) return null
  return rowToTier(data[0])
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
    enabled: t.enabled !== false,
    stock_initial: t.stockInitial ?? null,
    stock: t.stockInitial ?? null,
    sort_order: i,
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('prize_tiers').upsert(rows)
  if (error) throw error
  return rows.map(rowToTier)
}

// --- Configuração do jogo ---
export async function getGameConfig() {
  const { data, error } = await supabase.from('game_config').select('data').eq('id', 1).maybeSingle()
  if (error) {
    console.error('[getGameConfig]', error.message)
    return { ...DEFAULT_GAME_CONFIG }
  }
  return { ...DEFAULT_GAME_CONFIG, ...(data?.data ?? {}) }
}

export async function saveGameConfig(config) {
  const { error } = await supabase
    .from('game_config')
    .upsert({ id: 1, data: config, updated_at: new Date().toISOString() })
  if (error) throw error
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

// Registro automático pelo totem no fim da partida.
export async function appendGameLog(log) {
  const { error } = await supabase.from('game_logs').insert(logToRow(log))
  if (error) console.error('[appendGameLog]', error.message)
  return log
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

// Camada de acesso a dados do totem. Hoje é 100% localStorage; todas as funções
// são assíncronas de propósito para que, no futuro, baste trocar o corpo de cada
// função por uma chamada de API (fetch/axios) sem alterar quem as consome.
import { readJSON, writeJSON } from './storage'
import { DEFAULT_CARDS } from '../data/cards'
import { DEFAULT_PRIZE_TIERS } from '../data/prizes'
import { DEFAULT_GAME_CONFIG } from '../data/config'

const KEYS = {
  cards: 'cards',
  prizeTiers: 'prizeTiers',
  gameConfig: 'gameConfig',
  pairHistory: 'pairHistory',
  gameLogs: 'gameLogs',
}

// --- Cartas ---
export async function getCards() {
  return readJSON(KEYS.cards, DEFAULT_CARDS)
}

export async function saveCards(cards) {
  writeJSON(KEYS.cards, cards)
  return cards
}

// --- Faixas de prêmio ---
export async function getPrizeTiers() {
  return readJSON(KEYS.prizeTiers, DEFAULT_PRIZE_TIERS)
}

export async function savePrizeTiers(tiers) {
  writeJSON(KEYS.prizeTiers, tiers)
  return tiers
}

// --- Configuração do jogo ---
export async function getGameConfig() {
  return { ...DEFAULT_GAME_CONFIG, ...readJSON(KEYS.gameConfig, {}) }
}

export async function saveGameConfig(config) {
  writeJSON(KEYS.gameConfig, config)
  return config
}

// --- Histórico de pares (anti-repetição) ---
// Guarda os ids de pares sorteados nas últimas N partidas, mais recente primeiro.
export async function getPairHistory() {
  return readJSON(KEYS.pairHistory, [])
}

export async function pushPairHistory(pairIds, keepLastGames) {
  const history = await getPairHistory()
  const updated = [pairIds, ...history].slice(0, keepLastGames)
  writeJSON(KEYS.pairHistory, updated)
  return updated
}

// --- Logs de partida ---
export async function getGameLogs() {
  return readJSON(KEYS.gameLogs, [])
}

export async function appendGameLog(log) {
  const logs = await getGameLogs()
  const updated = [...logs, log]
  writeJSON(KEYS.gameLogs, updated)
  return updated
}

export async function clearGameLogs() {
  writeJSON(KEYS.gameLogs, [])
  return []
}

// --- Reset geral (usado no admin) ---
export async function resetToDefaults() {
  writeJSON(KEYS.cards, DEFAULT_CARDS)
  writeJSON(KEYS.prizeTiers, DEFAULT_PRIZE_TIERS)
  writeJSON(KEYS.gameConfig, DEFAULT_GAME_CONFIG)
}

import { tierMode } from '../data/prizes'

const hasStock = (t) => t.stock === null || t.stock === undefined || t.stock > 0

// Brindes do modelo ESCOLHA que podem ser oferecidos agora (ativos e com estoque).
export function availableChoicePrizes(tiers) {
  return (tiers ?? []).filter((t) => tierMode(t) === 'choice' && t.enabled !== false && hasStock(t))
}

// Brindes do modelo ROLETA ativos (usados na animação da roleta).
export function wheelPrizes(tiers) {
  return (tiers ?? []).filter((t) => tierMode(t) === 'wheel' && t.enabled !== false)
}

// Menor nº de pares que dá brinde no modelo ativo.
export function minPairsToWin(config, tiers) {
  if (config?.prizeMode === 'choice') return config.choiceMinPairs ?? 1
  const eligible = wheelPrizes(tiers).filter((t) => typeof t.pairs === 'number' && t.pairs > 0)
  return eligible.length ? Math.min(...eligible.map((t) => t.pairs)) : 4
}

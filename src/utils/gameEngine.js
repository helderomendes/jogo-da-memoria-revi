import { shuffle, sampleN, generatePickupCode } from './random'

export { generatePickupCode }

// Sorteia os pares da próxima partida evitando repetir pares usados nas
// últimas `antiRepeatLastGames` partidas. Se o pool elegível ficar menor que
// o necessário, libera o pool inteiro de novo (regra explícita do totem).
export function selectPairsForNewGame(allPairs, recentPairHistory, pairsPerGame) {
  const recentlyUsedIds = new Set(recentPairHistory.flat())
  const eligible = allPairs.filter((pair) => !recentlyUsedIds.has(pair.id))

  const usedFullPool = eligible.length < pairsPerGame
  const pool = usedFullPool ? allPairs : eligible

  return {
    pairs: sampleN(pool, pairsPerGame),
    usedFullPool,
  }
}

// Monta o tabuleiro: 2 cartas por par, posições embaralhadas.
export function buildBoard(pairs) {
  const cards = pairs.flatMap((pair) => {
    const face = { pairId: pair.id, text: pair.text, image: pair.image, mode: pair.mode }
    return [
      { uid: `${pair.id}-a`, ...face },
      { uid: `${pair.id}-b`, ...face },
    ]
  })
  return shuffle(cards)
}

// Faixa de prêmio conquistada, considerando estoque e faixas habilitadas.
// Regra: entre as faixas habilitadas, com regra de pares definida, alcançáveis
// (pairs <= paresCertos) e com estoque disponível, mira a de maior `pairs`. Se
// ela estiver esgotada/desabilitada, faz downgrade automático para a melhor
// faixa abaixo que ainda tenha brinde.
//
// Quando há VÁRIOS brindes no mesmo nível de `pairs`, sorteia um — com peso
// proporcional ao estoque restante (brinde com mais estoque tem mais chance),
// pra distribuir de forma equilibrada. Estoque ilimitado (null) pesa 1.
// Retorna null quando não há nenhuma faixa disponível (0 pares, ou tudo esgotado).
export function determinePrize(correctPairs, prizeTiers) {
  const available = prizeTiers.filter(
    (tier) =>
      tier.enabled !== false &&
      typeof tier.pairs === 'number' &&
      tier.pairs > 0 &&
      tier.pairs <= correctPairs &&
      (tier.stock === null || tier.stock === undefined || tier.stock > 0),
  )
  if (available.length === 0) return null

  // Nível alvo = maior `pairs` disponível; candidatos = brindes nesse nível.
  const level = Math.max(...available.map((t) => t.pairs))
  const candidates = available.filter((t) => t.pairs === level)
  if (candidates.length === 1) return candidates[0]

  const weightOf = (t) => (t.stock === null || t.stock === undefined ? 1 : Math.max(0, t.stock))
  const total = candidates.reduce((sum, t) => sum + weightOf(t), 0)
  if (total <= 0) return candidates[0]

  let r = Math.random() * total
  for (const tier of candidates) {
    r -= weightOf(tier)
    if (r <= 0) return tier
  }
  return candidates[candidates.length - 1]
}

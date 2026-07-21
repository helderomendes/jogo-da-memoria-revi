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
// (pairs <= paresCertos) e com estoque disponível, entrega a de maior `pairs`.
// Na prática isso premia a faixa EXATA quando ela tem estoque; se ela estiver
// esgotada/desabilitada, faz downgrade automático para a melhor faixa abaixo
// que ainda tenha brinde. Retorna null quando não há nenhuma faixa disponível
// (0 pares certos, ou tudo esgotado).
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
  return available.reduce((best, tier) => (tier.pairs > best.pairs ? tier : best))
}

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
  const cards = pairs.flatMap((pair) => [
    { uid: `${pair.id}-a`, pairId: pair.id, text: pair.text, image: pair.image },
    { uid: `${pair.id}-b`, pairId: pair.id, text: pair.text, image: pair.image },
  ])
  return shuffle(cards)
}

// Faixa de prêmio pela quantidade EXATA de pares certos (0 a totalChances).
// 0 pares certos não tem faixa — é derrota, sem prêmio.
export function determinePrize(correctPairs, prizeTiers) {
  return prizeTiers.find((tier) => tier.pairs === correctPairs) ?? null
}

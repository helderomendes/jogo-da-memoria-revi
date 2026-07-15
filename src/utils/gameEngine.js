import { shuffle, sampleN, generatePickupCode } from './random'
import { PRIZE_RULES } from '../data/prizes'

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

// Define a faixa de prêmio a partir do histórico de tentativas da partida.
// attempts: [{ matchesFound: number }], uma entrada por rodada jogada.
export function determinePrize({ attempts, totalPairs, prizeTiers, standardPrizeMinPairs }) {
  const fullClearIndex = attempts.findIndex((attempt) => attempt.matchesFound === totalPairs)
  const bestMatches = Math.max(...attempts.map((attempt) => attempt.matchesFound))

  let rule
  if (fullClearIndex === 0) {
    rule = PRIZE_RULES.FULL_FIRST_ATTEMPT
  } else if (fullClearIndex > 0) {
    rule = PRIZE_RULES.FULL_LATER_ATTEMPT
  } else if (bestMatches >= standardPrizeMinPairs) {
    rule = PRIZE_RULES.PARTIAL_STANDARD
  } else {
    rule = PRIZE_RULES.BASIC
  }

  const tier = prizeTiers.find((t) => t.rule === rule) ?? prizeTiers[prizeTiers.length - 1]

  return {
    tier,
    bestMatches,
    bestAttemptIndex: bestMatches === totalPairs ? fullClearIndex : indexOfBest(attempts),
  }
}

function indexOfBest(attempts) {
  let bestIndex = 0
  let bestValue = -1
  attempts.forEach((attempt, index) => {
    if (attempt.matchesFound > bestValue) {
      bestValue = attempt.matchesFound
      bestIndex = index
    }
  })
  return bestIndex
}

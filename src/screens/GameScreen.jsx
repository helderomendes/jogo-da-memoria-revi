import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { buildBoard, determinePrize, generatePickupCode } from '../utils/gameEngine'
import { getGameConfig, getPrizeTiers, appendGameLog } from '../utils/dataStore'
import Board from '../components/Board'

const COMPARE_DELAY_MS = 700

export default function GameScreen() {
  const { session, finishGame } = useKiosk()
  const [config, setConfig] = useState(null)
  const [prizeTiers, setPrizeTiers] = useState(null)

  const [roundIndex, setRoundIndex] = useState(0)
  const [board, setBoard] = useState([])
  const [phase, setPhase] = useState('memorize') // 'memorize' | 'playing' | 'locked'
  const [countdown, setCountdown] = useState(null)
  const [flippedUids, setFlippedUids] = useState([])
  const [matchedPairIds, setMatchedPairIds] = useState([])
  const [movesUsed, setMovesUsed] = useState(0)
  const [attempts, setAttempts] = useState([])

  const totalPairs = session.pairs.length

  useEffect(() => {
    Promise.all([getGameConfig(), getPrizeTiers()]).then(([cfg, tiers]) => {
      setConfig(cfg)
      setPrizeTiers(tiers)
    })
  }, [])

  // Início de cada rodada: monta tabuleiro novo e entra em fase de memorização.
  useEffect(() => {
    if (!config) return
    setBoard(buildBoard(session.pairs))
    setFlippedUids([])
    setMatchedPairIds([])
    setMovesUsed(0)
    setPhase('memorize')
    setCountdown(config.memorizeSeconds)
  }, [roundIndex, config])

  useEffect(() => {
    if (phase !== 'memorize' || !config || countdown === null) return
    if (countdown <= 0) {
      setPhase('playing')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown, config])

  const finalizeGame = async (finishedAttempts) => {
    const { tier, bestMatches } = determinePrize({
      attempts: finishedAttempts,
      totalPairs,
      prizeTiers,
      standardPrizeMinPairs: config.standardPrizeMinPairs,
    })
    const pickupCode = generatePickupCode()

    await appendGameLog({
      name: session.name,
      phone: session.phone || null,
      timestamp: new Date().toISOString(),
      pairsSorteados: session.pairs.map((p) => p.id),
      tentativasUsadas: finishedAttempts.length,
      paresCertosPorTentativa: finishedAttempts.map((a) => a.matchesFound),
      premioGanho: tier.label,
      codigoRetirada: pickupCode,
    })

    finishGame({
      attempts: finishedAttempts,
      bestMatches,
      totalPairs,
      prizeTier: tier,
      pickupCode,
    })
  }

  const endRound = (finalMatchedPairIds) => {
    const attempt = { matchesFound: finalMatchedPairIds.length }
    const updatedAttempts = [...attempts, attempt]
    setAttempts(updatedAttempts)

    const fullyCleared = finalMatchedPairIds.length === totalPairs
    const isLastRound = roundIndex + 1 >= config.maxAttempts

    if (fullyCleared || isLastRound) {
      finalizeGame(updatedAttempts)
    } else {
      setRoundIndex((r) => r + 1)
    }
  }

  const handleCardClick = (card) => {
    if (phase !== 'playing') return
    if (flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId)) return
    if (flippedUids.length >= 2) return

    const nextFlipped = [...flippedUids, card.uid]
    setFlippedUids(nextFlipped)

    if (nextFlipped.length < 2) return

    setPhase('locked')
    const [firstUid, secondUid] = nextFlipped
    const firstCard = board.find((c) => c.uid === firstUid)
    const secondCard = board.find((c) => c.uid === secondUid)
    const isMatch = firstCard.pairId === secondCard.pairId

    setTimeout(() => {
      const newMatched = isMatch ? [...matchedPairIds, firstCard.pairId] : matchedPairIds
      const newMovesUsed = movesUsed + 1

      setMatchedPairIds(newMatched)
      setMovesUsed(newMovesUsed)
      setFlippedUids([])

      const roundOver = newMatched.length === totalPairs || newMovesUsed >= config.movesPerRound
      if (roundOver) {
        endRound(newMatched)
      } else {
        setPhase('playing')
      }
    }, COMPARE_DELAY_MS)
  }

  if (!config || !prizeTiers || board.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-revi-gradient text-white text-2xl">
        Carregando...
      </div>
    )
  }

  const movesLeft = config.movesPerRound - movesUsed

  return (
    <div className="flex h-full w-full flex-col items-center bg-revi-gradient px-3 py-5 text-white">
      <div className="mb-2 flex w-full max-w-3xl shrink-0 items-center justify-between px-2 text-lg font-semibold">
        <span>
          Tentativa <span className="text-sky-400">{roundIndex + 1}</span>/{config.maxAttempts}
        </span>
        <span>
          Pares: <span className="text-lime-400">{matchedPairIds.length}</span>/{totalPairs}
        </span>
        {phase !== 'memorize' && <span>Jogadas: {movesLeft}</span>}
      </div>

      {phase === 'memorize' ? (
        <div className="mb-2 shrink-0 text-2xl font-bold text-lime-400">Memorize! {countdown}s</div>
      ) : (
        <div className="mb-2 h-8 shrink-0" />
      )}

      <div className="min-h-0 w-full max-w-4xl flex-1">
        <Board
          cards={board}
          cols={config.boardCols}
          rows={config.boardRows}
          flippedUids={phase === 'memorize' ? board.map((c) => c.uid) : flippedUids}
          matchedPairIds={matchedPairIds}
          disabled={phase !== 'playing'}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  )
}

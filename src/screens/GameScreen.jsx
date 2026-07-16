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

  const [board, setBoard] = useState([])
  const [phase, setPhase] = useState('memorize') // 'memorize' | 'playing' | 'locked'
  const [countdown, setCountdown] = useState(null)
  const [chancesLeft, setChancesLeft] = useState(null)
  const [flippedUids, setFlippedUids] = useState([])
  const [matchedPairIds, setMatchedPairIds] = useState([])
  const [wrongFlash, setWrongFlash] = useState([])

  const totalPairs = session.pairs.length

  useEffect(() => {
    Promise.all([getGameConfig(), getPrizeTiers()]).then(([cfg, tiers]) => {
      setConfig(cfg)
      setPrizeTiers(tiers)
      setChancesLeft(cfg.totalChances)
      setBoard(buildBoard(session.pairs))
      setCountdown(cfg.memorizeSeconds)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'memorize' || !config || countdown === null) return
    if (countdown <= 0) {
      setPhase('playing')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown, config])

  const finalizeGame = async (correctPairs) => {
    const isWin = correctPairs > 0
    const tier = isWin ? determinePrize(correctPairs, prizeTiers) : null
    const pickupCode = isWin ? generatePickupCode() : null

    await appendGameLog({
      name: session.name,
      phone: session.phone || null,
      company: session.company || null,
      timestamp: new Date().toISOString(),
      pairsSorteados: session.pairs.map((p) => p.id),
      chancesUsadas: config.totalChances,
      paresCertos: correctPairs,
      premioGanho: tier?.label ?? 'Nenhum (0 pares)',
      codigoRetirada: pickupCode,
    })

    finishGame({
      correctPairs,
      totalPairs,
      isWin,
      prizeTier: tier,
      pickupCode,
    })
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
      const newChancesLeft = chancesLeft - 1

      if (!isMatch) setWrongFlash(nextFlipped)
      setMatchedPairIds(newMatched)
      setChancesLeft(newChancesLeft)
      setFlippedUids([])

      const gameOver = newChancesLeft <= 0 || newMatched.length === totalPairs
      if (gameOver) {
        finalizeGame(newMatched.length)
      } else {
        setPhase('playing')
      }
      setTimeout(() => setWrongFlash([]), 400)
    }, COMPARE_DELAY_MS)
  }

  if (!config || !prizeTiers || board.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-revi-gradient text-white text-2xl">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-revi-gradient px-3 py-5 text-white">
      <div className="mb-2 flex w-full max-w-3xl shrink-0 items-center justify-between px-2 text-lg font-semibold">
        <span>
          Chances: <span className="text-sky-400">{chancesLeft}</span>/{config.totalChances}
        </span>
        <span>
          Pares: <span className="text-lime-400">{matchedPairIds.length}</span>/{totalPairs}
        </span>
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
          wrongUids={wrongFlash}
          disabled={phase !== 'playing'}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  )
}

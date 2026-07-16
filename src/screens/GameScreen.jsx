import { useEffect, useRef, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { buildBoard, determinePrize, generatePickupCode } from '../utils/gameEngine'
import { getGameConfig, getPrizeTiers, appendGameLog } from '../utils/dataStore'
import Board from '../components/Board'
import Mascot from '../components/Mascot'
import BackgroundGlow from '../components/BackgroundGlow'

const COMPARE_DELAY_MS = 700
const STEP_DELAY_MS = 700

export default function GameScreen() {
  const { session, finishGame } = useKiosk()
  const [config, setConfig] = useState(null)
  const [prizeTiers, setPrizeTiers] = useState(null)

  const [board, setBoard] = useState([])
  const [phase, setPhase] = useState('countdown') // 'countdown' | 'memorize' | 'playing' | 'locked'
  const [readyIndex, setReadyIndex] = useState(0)
  const [memorizeCountdown, setMemorizeCountdown] = useState(null)
  const [guessCountdown, setGuessCountdown] = useState(null)
  const [chancesLeft, setChancesLeft] = useState(null)
  const [flippedUids, setFlippedUids] = useState([])
  const [matchedPairIds, setMatchedPairIds] = useState([])
  const [wrongFlash, setWrongFlash] = useState([])

  const gameOverRef = useRef(false)
  const totalPairs = session.pairs.length

  useEffect(() => {
    Promise.all([getGameConfig(), getPrizeTiers()]).then(([cfg, tiers]) => {
      setConfig(cfg)
      setPrizeTiers(tiers)
      setChancesLeft(cfg.totalChances)
      setBoard(buildBoard(session.pairs))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const readySteps = config ? ['PENSE', ...Array.from({ length: config.getReadySeconds }, (_, i) => config.getReadySeconds - i)] : []

  // "PENSE, 3, 2, 1" — depois entra na memorização.
  useEffect(() => {
    if (phase !== 'countdown' || !config) return
    const isLastStep = readyIndex >= readySteps.length - 1
    const t = setTimeout(() => {
      if (isLastStep) {
        setPhase('memorize')
        setMemorizeCountdown(config.memorizeSeconds)
      } else {
        setReadyIndex((i) => i + 1)
      }
    }, STEP_DELAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, readyIndex, config])

  // Memorização: board virado por N segundos, depois começa a jogar (e o
  // cronômetro de 40s liga nesse exato momento).
  useEffect(() => {
    if (phase !== 'memorize' || !config || memorizeCountdown === null) return
    if (memorizeCountdown <= 0) {
      setPhase('playing')
      setGuessCountdown(config.guessSeconds)
      return
    }
    const t = setTimeout(() => setMemorizeCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, memorizeCountdown, config])

  // Cronômetro de jogo: corre em paralelo com as chances. O que acabar
  // primeiro (tempo ou chances) encerra a partida.
  useEffect(() => {
    if ((phase !== 'playing' && phase !== 'locked') || guessCountdown === null) return
    if (guessCountdown <= 0) {
      finalizeGame(matchedPairIds.length)
      return
    }
    const t = setTimeout(() => setGuessCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, guessCountdown])

  const finalizeGame = async (correctPairs) => {
    if (gameOverRef.current) return
    gameOverRef.current = true

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
    if (phase !== 'playing' || gameOverRef.current) return
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
      if (gameOverRef.current) return

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

  if (phase === 'countdown') {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-10 overflow-hidden bg-revi-gradient text-white">
        <BackgroundGlow />
        <Mascot className="h-36 w-36" floaty />
        <div
          key={readyIndex}
          className="animate-[pop_0.4s_ease-out_backwards] text-8xl font-extrabold tracking-tight text-lime-400"
        >
          {readySteps[readyIndex]}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-revi-gradient px-3 py-5 text-white">
      <div className="mb-2 flex w-full max-w-3xl shrink-0 items-center justify-between px-2 text-lg font-semibold">
        <span>
          Chances: <span className="text-sky-400">{chancesLeft}</span>/{config.totalChances}
        </span>
        {phase !== 'memorize' && (
          <span>
            Tempo: <span className="text-warning">{guessCountdown}s</span>
          </span>
        )}
        <span>
          Pares: <span className="text-lime-400">{matchedPairIds.length}</span>/{totalPairs}
        </span>
      </div>

      {phase === 'memorize' ? (
        <div className="mb-2 shrink-0 text-2xl font-bold text-lime-400">
          Memorize! {memorizeCountdown}s
        </div>
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

import { useEffect, useRef, useState } from 'react'
import { Grid3x3, Target, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import { buildBoard, generatePickupCode } from '../utils/gameEngine'
import { getGameConfig, appendGameLog, awardPrize } from '../utils/dataStore'
import Board from '../components/Board'
import Logo from '../components/Logo'
import BackgroundGlow from '../components/BackgroundGlow'
import Chip from '../components/Chip'

const COMPARE_DELAY_MS = 700
const STEP_DELAY_MS = 700

export default function GameScreen() {
  const { session, finishGame } = useKiosk()
  const [config, setConfig] = useState(null)

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
    getGameConfig().then((cfg) => {
      setConfig(cfg)
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

    const madePairs = correctPairs > 0
    // awardPrize escolhe a faixa e dá baixa no estoque atomicamente no banco.
    const tier = madePairs ? await awardPrize(correctPairs) : null
    // Venceu de fato só quando há um brinde disponível pra entregar. Se fez
    // pares mas tudo está esgotado, tratamos como "sem prêmio".
    const isWin = !!tier
    const pickupCode = isWin ? generatePickupCode() : null

    await appendGameLog({
      name: session.name,
      phone: session.phone || null,
      company: session.company || null,
      timestamp: new Date().toISOString(),
      pairsSorteados: session.pairs.map((p) => p.id),
      chancesUsadas: config.totalChances,
      paresCertos: correctPairs,
      premioGanho: tier?.label ?? (madePairs ? 'Sem estoque' : 'Nenhum (0 pares)'),
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

  if (!config || board.length === 0) {
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
        <Logo className="h-10 absolute top-10" />
        <div
          key={readyIndex}
          className="animate-[pop_0.4s_ease-out_backwards] text-8xl sm:text-9xl font-extrabold tracking-tight text-lime-400"
        >
          {readySteps[readyIndex]}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-revi-gradient px-3 py-5 text-white">
      <div className="mb-2 flex w-full max-w-3xl shrink-0 flex-wrap items-center justify-center gap-2">
        <Chip icon={Target} label="chances" value={`${chancesLeft}/${config.totalChances}`} tone="sky" />
        {phase !== 'memorize' && (
          <Chip icon={Timer} label="tempo" value={`${guessCountdown}s`} tone="sky" />
        )}
        <Chip icon={Grid3x3} label="pares" value={`${matchedPairIds.length}/${totalPairs}`} tone="lime" />
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

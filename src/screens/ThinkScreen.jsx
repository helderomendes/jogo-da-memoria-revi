import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getCards, getGameConfig, getPairHistory, pushPairHistory } from '../utils/dataStore'
import { selectPairsForNewGame } from '../utils/gameEngine'
import Mascot from '../components/Mascot'
import Button from '../components/Button'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'

// Tela "pense antes" — dá um tempo pro jogador se preparar mentalmente antes
// do tabuleiro aparecer. Termina no timer ou no toque em "Estou pronto".
export default function ThinkScreen() {
  const { startGame } = useKiosk()
  const [config, setConfig] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    getGameConfig().then((cfg) => {
      setConfig(cfg)
      setCountdown(cfg.thinkSeconds)
    })
  }, [])

  const handleReady = async () => {
    if (starting) return
    setStarting(true)
    const [cards, gameConfig, history] = await Promise.all([
      getCards(),
      getGameConfig(),
      getPairHistory(),
    ])

    const { pairs, usedFullPool } = selectPairsForNewGame(cards, history, gameConfig.pairsPerGame)
    await pushPairHistory(pairs.map((p) => p.id), gameConfig.antiRepeatLastGames)

    startGame({ pairs, totalPairs: pairs.length, usedFullPool })
  }

  useEffect(() => {
    if (countdown === null || starting) return
    if (countdown <= 0) {
      handleReady()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, starting])

  if (!config) return null

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-14 text-center text-white">
      <BackgroundGlow />
      <h1 className="text-4xl font-bold tracking-tight">
        Pensa <span className="text-lime-400">na estratégia</span>
      </h1>

      <div className="flex flex-col items-center gap-8">
        <Mascot className="h-40 w-40" floaty />
        <p className="max-w-sm text-xl text-ink-100">
          {config.pairsPerGame} pares vão aparecer no tabuleiro. Você só tem{' '}
          <strong className="text-sky-400">{config.totalChances} chances</strong> pra formar pares
          certos. Respira e foca.
        </p>
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#65f24b"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - countdown / config.thinkSeconds)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <span className="text-5xl font-extrabold tabular-nums">{countdown}</span>
        </div>
      </div>

      <Button onClick={handleReady} disabled={starting} className="w-full max-w-md">
        {starting ? 'Preparando...' : 'Estou pronto!'}
      </Button>
    </ScreenTransition>
  )
}

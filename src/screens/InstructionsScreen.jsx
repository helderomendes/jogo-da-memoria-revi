import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getCards, getGameConfig, getPairHistory, pushPairHistory } from '../utils/dataStore'
import { selectPairsForNewGame } from '../utils/gameEngine'
import Button from '../components/Button'
import Mascot from '../components/Mascot'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'

export default function InstructionsScreen() {
  const { session, startGame } = useKiosk()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getGameConfig().then(setConfig)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    const [cards, gameConfig, history] = await Promise.all([
      getCards(),
      getGameConfig(),
      getPairHistory(),
    ])

    const { pairs, usedFullPool } = selectPairsForNewGame(cards, history, gameConfig.pairsPerGame)
    await pushPairHistory(pairs.map((p) => p.id), gameConfig.antiRepeatLastGames)

    startGame({ pairs, totalPairs: pairs.length, usedFullPool })
  }

  if (!config) return null

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-12 text-center text-white">
      <BackgroundGlow />
      <h1 className="text-4xl font-bold tracking-tight">
        Oi, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-40 w-40" />
        <div className="space-y-4 text-xl text-ink-100 max-w-md">
          <p>
            O tabuleiro vai aparecer com todas as cartas viradas por{' '}
            <strong className="text-lime-400">{config.memorizeSeconds} segundos</strong>. Preste
            atenção nas posições.
          </p>
          <p>Depois as cartas viram pra baixo e você toca pra formar os pares.</p>
          <p>
            Você tem só{' '}
            <strong className="text-sky-400">{config.totalChances} chances no total</strong> e{' '}
            <strong className="text-sky-400">{config.guessSeconds} segundos</strong> de relógio —
            o que acabar primeiro encerra o jogo.
          </p>
        </div>
      </div>

      <Button onClick={handleStart} disabled={loading} className="w-full max-w-md">
        {loading ? 'Preparando...' : 'Entendi, vamos lá'}
      </Button>
    </ScreenTransition>
  )
}

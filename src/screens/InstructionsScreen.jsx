import { useEffect, useState } from 'react'
import { Eye, Target, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import { getCards, getGameConfig, getPairHistory, pushPairHistory } from '../utils/dataStore'
import { selectPairsForNewGame } from '../utils/gameEngine'
import Button from '../components/Button'
import Mascot from '../components/Mascot'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'
import RuleCard from '../components/RuleCard'

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
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-6 py-12 text-center text-white">
      <BackgroundGlow />
      <h1 className="text-4xl font-bold tracking-tight">
        Oi, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <Mascot className="h-32 w-32" />

        <div className="w-full space-y-3">
          <RuleCard
            icon={Eye}
            tone="limeSoft"
            overline="Memorize"
            title={`${config.memorizeSeconds} segundos com as cartas viradas`}
          />
          <RuleCard
            icon={Target}
            tone="sky"
            overline="Chances"
            title={`${config.totalChances} tentativas pra formar pares`}
          />
          <RuleCard
            icon={Timer}
            tone="sky"
            overline="Cronômetro"
            title={`${config.guessSeconds} segundos de relógio — o que acabar primeiro encerra`}
          />
        </div>
      </div>

      <Button onClick={handleStart} disabled={loading} className="w-full max-w-md">
        {loading ? 'Preparando...' : 'Entendi, vamos lá'}
      </Button>
    </ScreenTransition>
  )
}

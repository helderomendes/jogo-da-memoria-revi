import { useEffect, useState } from 'react'
import { Eye, Gift, Target, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import { getCards, getGameConfig, getPairHistory, pushPairHistory, getPrizeTiers } from '../utils/dataStore'
import { selectPairsForNewGame } from '../utils/gameEngine'
import Button from '../components/Button'
import KioskScreen from '../components/KioskScreen'
import RuleCard from '../components/RuleCard'

export default function InstructionsScreen() {
  const { session, startGame } = useKiosk()
  const [config, setConfig] = useState(null)
  const [minWinPairs, setMinWinPairs] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getGameConfig().then(setConfig)
    // Menor número de pares que dá brinde (menor `pairs` entre as faixas ativas).
    getPrizeTiers().then((tiers) => {
      const enabled = tiers.filter((t) => t.enabled !== false && typeof t.pairs === 'number' && t.pairs > 0)
      if (enabled.length) setMinWinPairs(Math.min(...enabled.map((t) => t.pairs)))
    })
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
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Oi, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

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
        <RuleCard
          icon={Gift}
          tone="limeSoft"
          overline="Prêmio"
          title={`Feche ${minWinPairs ?? 4} pares ou mais e ganhe um brinde surpresa!`}
        />
      </div>

      <Button onClick={handleStart} disabled={loading} className="w-full">
        {loading ? 'Preparando...' : 'Entendi, vamos lá'}
      </Button>
    </KioskScreen>
  )
}

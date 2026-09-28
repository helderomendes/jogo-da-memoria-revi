import { useEffect, useState } from 'react'
import { Eye, Gift, Target, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import { getCards, getGameConfig, getPairHistory, pushPairHistory, getPrizeTiers } from '../utils/dataStore'
import { selectPairsForNewGame } from '../utils/gameEngine'
import { availableChoicePrizes, minPairsToWin } from '../utils/prizeModes'
import Button from '../components/Button'
import KioskScreen, { LandscapeAside, LandscapeLead } from '../components/KioskScreen'
import RuleCard from '../components/RuleCard'

export default function InstructionsScreen() {
  const { session, startGame, isLandscape } = useKiosk()
  const [config, setConfig] = useState(null)
  const [tiers, setTiers] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getGameConfig().then(setConfig)
    getPrizeTiers().then(setTiers)
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

  const minWin = minPairsToWin(config, tiers ?? [])
  const choiceLabels = availableChoicePrizes(tiers).map((t) => t.label)
  const prizeTitle =
    config.prizeMode === 'choice'
      ? `Feche ${minWin} pares ou mais e escolha seu prêmio${
          choiceLabels.length ? `: ${formatList(choiceLabels)}` : ''
        }!`
      : `Feche ${minWin} pares ou mais e ganhe um brinde surpresa!`

  const rules = (
    <>
      <RuleCard
        icon={Eye}
        tone="limeSoft"
        overline="Memorize"
        title={`${config.memorizeSeconds} segundos com as cartas viradas`}
        large={isLandscape}
      />
      <RuleCard
        icon={Target}
        tone="sky"
        overline="Chances"
        title={`${config.totalChances} tentativas pra formar pares`}
        large={isLandscape}
      />
      <RuleCard
        icon={Timer}
        tone="sky"
        overline="Cronômetro"
        title={`${config.guessSeconds} segundos de relógio — o que acabar primeiro encerra`}
        large={isLandscape}
      />
      <RuleCard icon={Gift} tone="limeSoft" overline="Prêmio" title={prizeTitle} large={isLandscape} />
    </>
  )

  const button = (
    <Button onClick={handleStart} disabled={loading} className="w-full">
      {loading ? 'Preparando...' : 'Entendi, vamos lá'}
    </Button>
  )

  if (isLandscape) {
    return (
      <KioskScreen>
        <LandscapeLead className="max-w-[36%]">
          <h1 className="text-[clamp(3rem,5.4vw,6.4rem)] font-extrabold leading-[0.95] tracking-tight">
            Oi, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-[clamp(1.3rem,2vw,2.4rem)] font-bold leading-tight text-ink-100">
            Olha as regras e bora jogar.
          </p>
          {button}
        </LandscapeLead>
        <LandscapeAside>
          <div className="grid grid-cols-2 gap-[2vh]">{rules}</div>
        </LandscapeAside>
      </KioskScreen>
    )
  }

  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Oi, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="w-full space-y-3">{rules}</div>

      {button}
    </KioskScreen>
  )
}

function formatList(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ou ${items[items.length - 1]}`
}

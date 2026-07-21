import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getPrizeTiers } from '../utils/dataStore'
import { resolvePrizeIcon } from '../data/prizeIcons'
import Button from '../components/Button'
import KioskScreen from '../components/KioskScreen'
import GlassPanel from '../components/GlassPanel'
import IconBadge from '../components/IconBadge'

export default function PrizeScreen() {
  const { session, goToThanks } = useKiosk()
  const { prizeTier, pickupCode } = session
  const [tiers, setTiers] = useState([])
  const WonIcon = resolvePrizeIcon(prizeTier?.icon)

  useEffect(() => {
    getPrizeTiers().then((all) => setTiers(all.filter((t) => t.enabled !== false)))
  }, [])

  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Parabéns, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      {/* Fileira de prêmios — o conquistado aparece maior, elevado e com glow */}
      <div className="flex items-end justify-center gap-3">
        {tiers.map((tier) => {
          const isWon = tier.id === prizeTier?.id
          return (
            <IconBadge
              key={tier.id}
              icon={resolvePrizeIcon(tier.icon)}
              tone={isWon ? 'lime' : 'neutral'}
              size={isWon ? 72 : 48}
              className={isWon ? '-translate-y-2 animate-[pop_0.5s_ease-out_backwards]' : 'opacity-40'}
            />
          )
        })}
      </div>

      <GlassPanel className="flex w-full flex-col items-center gap-2 px-8 py-6 animate-[pop_0.5s_ease-out_backwards]">
        <IconBadge icon={WonIcon} tone="lime" size={56} />
        <p className="mt-2 text-2xl font-bold text-lime-400">{prizeTier?.label}</p>
        <p className="max-w-sm text-lg text-ink-100">{prizeTier?.description}</p>
      </GlassPanel>

      <div className="space-y-2">
        <p className="text-lg text-ink-300">Apresente esse código no balcão</p>
        <p className="text-6xl font-extrabold tracking-widest text-sky-400">{pickupCode}</p>
      </div>

      <Button onClick={goToThanks} className="w-full">
        Concluir
      </Button>
    </KioskScreen>
  )
}

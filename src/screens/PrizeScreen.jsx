import { Candy, CreditCard, CupSoda, ShoppingBag } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import Button from '../components/Button'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'
import GlassPanel from '../components/GlassPanel'
import IconBadge from '../components/IconBadge'

const PRIZE_ICONS = {
  chocolate: Candy,
  sacola: ShoppingBag,
  giftcard: CreditCard,
  bottle: CupSoda,
}

export default function PrizeScreen() {
  const { session, goToThanks } = useKiosk()
  const { prizeTier, pickupCode } = session
  const WonIcon = PRIZE_ICONS[prizeTier?.id] ?? Candy

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-14 text-center text-white">
      <BackgroundGlow />
      <h1 className="text-4xl font-bold tracking-tight">
        Parabéns, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      {/* Fileira de prêmios — o conquistado aparece maior, elevado e com glow */}
      <div className="flex items-end justify-center gap-3">
        {Object.entries(PRIZE_ICONS).map(([id, Icon]) => {
          const isWon = id === prizeTier?.id
          return (
            <IconBadge
              key={id}
              icon={Icon}
              tone={isWon ? 'lime' : 'neutral'}
              size={isWon ? 72 : 48}
              className={isWon ? '-translate-y-2 animate-[pop_0.5s_ease-out_backwards]' : 'opacity-40'}
            />
          )
        })}
      </div>

      <GlassPanel className="flex flex-col items-center gap-2 px-8 py-6 animate-[pop_0.5s_ease-out_backwards]">
        <IconBadge icon={WonIcon} tone="lime" size={56} />
        <p className="mt-2 text-2xl font-bold text-lime-400">{prizeTier?.label}</p>
        <p className="max-w-sm text-lg text-ink-100">{prizeTier?.description}</p>
      </GlassPanel>

      <div className="space-y-2">
        <p className="text-lg text-ink-300">Apresente esse código no balcão</p>
        <p className="text-6xl font-extrabold tracking-widest text-sky-400">{pickupCode}</p>
      </div>

      <Button onClick={goToThanks} className="w-full max-w-md">
        Concluir
      </Button>
    </ScreenTransition>
  )
}

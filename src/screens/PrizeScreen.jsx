import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getPrizeTiers } from '../utils/dataStore'
import Button from '../components/Button'
import KioskScreen from '../components/KioskScreen'
import GlassPanel from '../components/GlassPanel'
import PrizeMedia from '../components/PrizeMedia'
import PrizeWheel from '../components/PrizeWheel'

export default function PrizeScreen() {
  const { session, goToThanks } = useKiosk()
  const { prizeTier, pickupCode } = session
  const [tiers, setTiers] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    getPrizeTiers().then((all) => setTiers(all.filter((t) => t.enabled !== false)))
  }, [])

  const firstName = session.name.split(' ')[0]

  // Fase 1 — mistério: a roleta gira as fotos até parar no brinde sorteado.
  if (!revealed) {
    return (
      <KioskScreen>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Sorteando seu <span className="text-lime-400">brinde</span>...
        </h1>
        <p className="text-lg text-ink-300">Boa sorte, {firstName}!</p>

        {tiers ? (
          <PrizeWheel
            pool={tiers}
            target={prizeTier}
            onDone={() => setRevealed(true)}
          />
        ) : (
          <p className="text-ink-300">Preparando a roleta...</p>
        )}
      </KioskScreen>
    )
  }

  // Fase 2 — revelação: o brinde ganho num crop circular grande, com glow.
  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Parabéns, <span className="text-lime-400">{firstName}</span>!
      </h1>

      <GlassPanel className="flex w-full flex-col items-center gap-3 px-8 py-8">
        <div className="animate-[pop_0.5s_ease-out_backwards]">
          <PrizeMedia
            tier={prizeTier}
            size={168}
            className="animate-[pulseGlow_2.2s_ease-in-out_infinite]"
          />
        </div>
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

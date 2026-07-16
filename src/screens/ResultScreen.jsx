import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import { useCountUp } from '../utils/useCountUp'
import Button from '../components/Button'
import Mascot from '../components/Mascot'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'
import GlassPanel from '../components/GlassPanel'

export default function ResultScreen() {
  const { session, goToPrize, resetToIdle } = useKiosk()
  const { correctPairs, isWin } = session
  const [totalChances, setTotalChances] = useState(null)
  const displayedCount = useCountUp(correctPairs)

  useEffect(() => {
    getGameConfig().then((cfg) => setTotalChances(cfg.totalChances))
  }, [])

  if (!isWin) {
    return (
      <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-14 text-center text-white">
        <BackgroundGlow />
        <h1 className="text-4xl font-bold tracking-tight">
          Quase, <span className="text-sky-400">{session.name.split(' ')[0]}</span>!
        </h1>

        <GlassPanel className="flex w-full max-w-sm flex-col items-center gap-5 px-8 py-10">
          <Mascot className="h-32 w-32" />
          <p className="text-xl text-ink-100">
            Você usou suas {totalChances ?? 3} chances e não fechou nenhum par dessa vez.
          </p>
          <p className="text-lg text-ink-300">Bora tentar de novo?</p>
        </GlassPanel>

        <Button onClick={resetToIdle} className="w-full max-w-md">
          Tentar de novo
        </Button>
      </ScreenTransition>
    )
  }

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-14 text-center text-white">
      <BackgroundGlow />
      <h1 className="text-4xl font-bold tracking-tight">
        Resultado de <span className="text-lime-400">{session.name.split(' ')[0]}</span>
      </h1>

      <GlassPanel className="flex w-full max-w-sm flex-col items-center gap-4 px-10 py-10">
        <Mascot className="h-28 w-28" />

        <div className="text-8xl font-extrabold tracking-tight animate-[pop_0.5s_ease-out_backwards]">
          <span className="text-lime-400">{displayedCount}</span>
          <span className="text-ink-300"> / {totalChances ?? '-'}</span>
        </div>
        <p className="text-xl text-ink-100">pares certos</p>
      </GlassPanel>

      <Button onClick={goToPrize} className="w-full max-w-md">
        Ver meu prêmio
      </Button>
    </ScreenTransition>
  )
}

import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import { useCountUp } from '../utils/useCountUp'
import Button from '../components/Button'
import Mascot from '../components/Mascot'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'

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

        <div className="flex flex-col items-center gap-6">
          <Mascot className="h-36 w-36" />
          <p className="max-w-sm text-xl text-ink-100">
            Você usou suas {totalChances ?? 3} chances e não fechou nenhum par dessa vez.
          </p>
          <p className="text-lg text-ink-300">Bora tentar de novo?</p>
        </div>

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

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-36 w-36" />

        <div className="text-7xl font-extrabold tracking-tight animate-[pop_0.5s_ease-out_backwards]">
          <span className="text-lime-400">{displayedCount}</span>
          <span className="text-ink-300"> / {totalChances ?? '-'}</span>
        </div>
        <p className="text-xl text-ink-100">pares certos</p>
      </div>

      <Button onClick={goToPrize} className="w-full max-w-md">
        Ver meu prêmio
      </Button>
    </ScreenTransition>
  )
}

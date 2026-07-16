import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import { useCountUp } from '../utils/useCountUp'
import Button from '../components/Button'
import KioskScreen from '../components/KioskScreen'
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
      <KioskScreen>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Quase, <span className="text-sky-400">{session.name.split(' ')[0]}</span>!
        </h1>

        <GlassPanel className="flex w-full flex-col items-center gap-5 px-8 py-10">
          <p className="text-xl text-ink-100">
            Você usou suas {totalChances ?? 3} chances e não fechou nenhum par dessa vez.
          </p>
          <p className="text-lg text-ink-300">Bora tentar de novo?</p>
        </GlassPanel>

        <Button onClick={resetToIdle} className="w-full">
          Tentar de novo
        </Button>
      </KioskScreen>
    )
  }

  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Resultado de <span className="text-lime-400">{session.name.split(' ')[0]}</span>
      </h1>

      <GlassPanel className="flex w-full flex-col items-center gap-4 px-10 py-10">
        <div className="text-8xl font-extrabold tracking-tight animate-[pop_0.5s_ease-out_backwards]">
          <span className="text-lime-400">{displayedCount}</span>
          <span className="text-ink-300"> / {totalChances ?? '-'}</span>
        </div>
        <p className="text-xl text-ink-100">pares certos</p>
      </GlassPanel>

      <Button onClick={goToPrize} className="w-full">
        Ver meu prêmio
      </Button>
    </KioskScreen>
  )
}

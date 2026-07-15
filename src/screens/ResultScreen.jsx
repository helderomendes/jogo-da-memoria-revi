import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import Button from '../components/Button'
import Mascot from '../components/Mascot'

export default function ResultScreen() {
  const { session, goToPrize } = useKiosk()
  const { bestMatches, totalPairs, attempts } = session
  const [maxAttempts, setMaxAttempts] = useState(null)

  useEffect(() => {
    getGameConfig().then((cfg) => setMaxAttempts(cfg.maxAttempts))
  }, [])

  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-revi-gradient px-8 py-14 text-center text-white">
      <h1 className="text-4xl font-bold tracking-tight">
        Resultado de <span className="text-lime-400">{session.name.split(' ')[0]}</span>
      </h1>

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-36 w-36" />

        <div className="text-7xl font-extrabold tracking-tight">
          <span className="text-lime-400">{bestMatches}</span>
          <span className="text-ink-300"> / {totalPairs}</span>
        </div>
        <p className="text-xl text-ink-100">pares encontrados</p>

        <p className="text-lg text-ink-300">
          Tentativas usadas: <strong className="text-sky-400">{attempts.length}</strong> de{' '}
          {maxAttempts ?? '-'}
        </p>
      </div>

      <Button onClick={() => goToPrize({})} className="w-full max-w-md">
        Ver meu prêmio
      </Button>
    </div>
  )
}

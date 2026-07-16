import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import Button from '../components/Button'
import Mascot from '../components/Mascot'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'

export default function InstructionsScreen() {
  const { session, goToThink } = useKiosk()
  const [config, setConfig] = useState(null)

  useEffect(() => {
    getGameConfig().then(setConfig)
  }, [])

  if (!config) return null

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-12 text-center text-white">
      <BackgroundGlow />
      <h1 className="text-4xl font-bold tracking-tight">
        Oi, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-40 w-40" />
        <div className="space-y-4 text-xl text-ink-100 max-w-md">
          <p>
            O tabuleiro vai aparecer com todas as cartas viradas por{' '}
            <strong className="text-lime-400">{config.memorizeSeconds} segundos</strong>. Preste
            atenção nas posições.
          </p>
          <p>Depois as cartas viram pra baixo e você toca pra formar os pares.</p>
          <p>
            Você tem só{' '}
            <strong className="text-sky-400">{config.totalChances} chances no total</strong> — cada
            jogada, certa ou errada, gasta uma. Acabaram as chances, acabou o jogo.
          </p>
        </div>
      </div>

      <Button onClick={goToThink} className="w-full max-w-md">
        Entendi, vamos lá
      </Button>
    </ScreenTransition>
  )
}

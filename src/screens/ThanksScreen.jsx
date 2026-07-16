import { useEffect } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import Mascot from '../components/Mascot'
import Logo from '../components/Logo'
import ScreenTransition from '../components/ScreenTransition'
import BackgroundGlow from '../components/BackgroundGlow'
import GlassPanel from '../components/GlassPanel'

export default function ThanksScreen() {
  const { resetToIdle } = useKiosk()

  useEffect(() => {
    let timer
    getGameConfig().then((cfg) => {
      timer = setTimeout(resetToIdle, cfg.thanksScreenMs)
    })
    return () => clearTimeout(timer)
  }, [resetToIdle])

  return (
    <ScreenTransition className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-revi-gradient px-8 text-center text-white">
      <BackgroundGlow />
      <GlassPanel className="flex flex-col items-center gap-6 px-10 py-12">
        <Mascot className="h-40 w-40" floaty />
        <h1 className="text-4xl font-bold tracking-tight">
          Valeu por jogar com a <span className="text-lime-400">Revi</span>!
        </h1>
        <p className="text-xl text-ink-200">Até a próxima.</p>
        <Logo className="h-7 mt-2" />
      </GlassPanel>
    </ScreenTransition>
  )
}

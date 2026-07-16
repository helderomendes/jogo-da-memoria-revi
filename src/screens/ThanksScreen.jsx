import { useEffect } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import KioskScreen from '../components/KioskScreen'
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
    <KioskScreen>
      <GlassPanel className="flex w-full flex-col items-center gap-4 px-10 py-12 animate-[pop_0.5s_ease-out_backwards]">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Valeu por jogar com a <span className="text-lime-400">Revi</span>!
        </h1>
        <p className="text-xl text-ink-200">Até a próxima.</p>
      </GlassPanel>
    </KioskScreen>
  )
}

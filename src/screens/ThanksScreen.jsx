import { useEffect } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getGameConfig } from '../utils/dataStore'
import Mascot from '../components/Mascot'
import Logo from '../components/Logo'

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
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-navy px-8 text-center text-white">
      <Mascot className="h-40 w-40" />
      <h1 className="font-headline text-4xl">
        Valeu por jogar com a <span className="text-electric">Revi</span>!
      </h1>
      <p className="text-xl text-white/70">Até a próxima.</p>
      <Logo className="text-2xl mt-4" />
    </div>
  )
}

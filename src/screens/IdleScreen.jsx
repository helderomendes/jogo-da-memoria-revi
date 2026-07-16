import { Gift, Grid3x3, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import Mascot from '../components/Mascot'
import Logo from '../components/Logo'
import BackgroundGlow from '../components/BackgroundGlow'
import GlassPanel from '../components/GlassPanel'
import Chip from '../components/Chip'

export default function IdleScreen() {
  const { startRegistration } = useKiosk()

  return (
    <button
      type="button"
      onClick={startRegistration}
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-6 py-12 text-center"
    >
      <BackgroundGlow />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 w-full">
        <GlassPanel className="flex w-full max-w-md flex-col items-center gap-5 px-8 py-10">
          <Mascot className="h-56 w-56" floaty />
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Jogo da <span className="text-lime-400">Memória</span>
          </h1>
          <p className="max-w-sm text-lg text-ink-200">
            Encontre os pares e desbloqueie seu prêmio Revi.
          </p>
        </GlassPanel>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Chip icon={Grid3x3} label="pares" value="8" />
          <Chip icon={Timer} label="tempo" value="40s" tone="sky" />
          <Chip icon={Gift} label="prêmios" value="4" tone="lime" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full bg-lime-400 px-14 py-6 text-3xl font-bold text-navy-950 animate-[pulseGlow_2.2s_ease-in-out_infinite]">
          Toque para jogar
        </div>
        <Logo className="h-6 opacity-70" />
      </div>
    </button>
  )
}

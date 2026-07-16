import { Gift, Grid3x3, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
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
      className="relative flex min-h-full w-full flex-col items-center overflow-hidden bg-revi-gradient px-6 py-12 text-center"
    >
      <BackgroundGlow />

      <Logo className="h-12 shrink-0 mb-10 sm:h-14" />

      <div className="flex w-full max-w-[440px] flex-1 flex-col items-center justify-center gap-8">
        <GlassPanel className="flex w-full flex-col items-center gap-4 px-8 py-10">
          <h1 className="text-6xl sm:text-7xl font-extrabold uppercase leading-[0.95] tracking-tight text-white">
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

        <div className="rounded-full bg-lime-400 px-14 py-6 text-3xl font-bold text-navy-950 animate-[pulseGlow_2.2s_ease-in-out_infinite]">
          Toque para jogar
        </div>
      </div>
    </button>
  )
}

import { useKiosk } from '../context/KioskContext'
import Mascot from '../components/Mascot'
import Logo from '../components/Logo'
import BackgroundGlow from '../components/BackgroundGlow'

export default function IdleScreen() {
  const { startRegistration } = useKiosk()

  return (
    <button
      type="button"
      onClick={startRegistration}
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-revi-gradient px-8 py-14 text-center"
    >
      <BackgroundGlow />

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Mascot className="h-72 w-72" floaty />
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Jogo da <span className="text-lime-400">Memória</span>
        </h1>
        <p className="max-w-md text-xl text-ink-200">
          Encontre os pares e desbloqueie seu prêmio Revi.
        </p>
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

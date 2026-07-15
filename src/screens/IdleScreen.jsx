import { useKiosk } from '../context/KioskContext'
import Mascot from '../components/Mascot'
import Logo from '../components/Logo'

export default function IdleScreen() {
  const { startRegistration } = useKiosk()

  return (
    <button
      type="button"
      onClick={startRegistration}
      className="flex h-full w-full flex-col items-center justify-between bg-revi-gradient px-8 py-16 text-center"
    >
      <Logo className="h-9" />

      <div className="flex flex-col items-center gap-8">
        <Mascot className="h-64 w-64" floaty />
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Jogo da <span className="text-lime-400">Memória</span>
        </h1>
        <p className="max-w-md text-xl text-ink-200">
          Encontre os pares e desbloqueie seu prêmio Revi.
        </p>
      </div>

      <div className="rounded-full bg-lime-400 px-14 py-6 text-3xl font-bold text-navy-950 shadow-glow-lime animate-bounce">
        Toque para jogar
      </div>
    </button>
  )
}

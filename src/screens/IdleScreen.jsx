import { useKiosk } from '../context/KioskContext'
import Mascot from '../components/Mascot'
import Logo from '../components/Logo'

export default function IdleScreen() {
  const { startRegistration } = useKiosk()

  return (
    <button
      type="button"
      onClick={startRegistration}
      className="flex h-full w-full flex-col items-center justify-between bg-navy px-8 py-16 text-center"
    >
      <Logo className="text-4xl" />

      <div className="flex flex-col items-center gap-8">
        <Mascot className="h-64 w-64 animate-[pulse_2.4s_ease-in-out_infinite]" />
        <h1 className="font-headline text-5xl text-white">
          Jogo da <span className="text-electric">Memória</span>
        </h1>
        <p className="max-w-md text-xl text-white/70">
          Encontre os pares e desbloqueie seu prêmio Revi.
        </p>
      </div>

      <div className="rounded-full bg-electric px-14 py-6 text-3xl font-bold text-navy animate-bounce">
        Toque para jogar
      </div>
    </button>
  )
}

import { useKiosk } from '../context/KioskContext'
import Logo from '../components/Logo'
import BackgroundGlow from '../components/BackgroundGlow'
import LongPressHotspot from '../components/LongPressHotspot'

// Tela de pausa do totem: só o logo da Revi e "Voltamos mais tarde". Ativada/
// desativada por toque longo no canto (atalho de operador). Sem interação pro
// cliente.
export default function PauseScreen() {
  const { setPaused } = useKiosk()

  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden bg-revi-gradient px-6 text-center text-white">
      <BackgroundGlow />

      <Logo className="h-[clamp(3rem,7vw,6rem)]" />
      <p className="mt-8 text-[clamp(1.4rem,3.4vw,2.6rem)] font-bold text-ink-100">
        Voltamos mais tarde
      </p>

      {/* Toque longo no canto pra retomar o totem. */}
      <LongPressHotspot onTrigger={() => setPaused(false)} />
    </div>
  )
}

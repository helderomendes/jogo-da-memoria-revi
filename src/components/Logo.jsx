import logoUrl from '../assets/logo-revi-dark.svg'
import { useKiosk } from '../context/KioskContext'

// `linkToHome` liga a logo de volta ao início do totem (SCREENS.IDLE) — usado
// em toda tela, exceto a própria Idle (já é o início) e a tela do jogo (não
// pode deixar o jogador sair sem querer no meio de uma partida em andamento).
export default function Logo({ className = 'h-8', linkToHome = false }) {
  const img = <img src={logoUrl} alt="Revi" className={`w-auto ${className}`} />

  if (!linkToHome) return img

  return <LogoLink>{img}</LogoLink>
}

function LogoLink({ children }) {
  const { resetToIdle } = useKiosk()
  return (
    <button
      type="button"
      onClick={resetToIdle}
      className="shrink-0 opacity-90 transition-opacity active:opacity-70"
      aria-label="Voltar ao início"
    >
      {children}
    </button>
  )
}

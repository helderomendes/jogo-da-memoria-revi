import ScreenTransition from './ScreenTransition'
import BackgroundGlow from './BackgroundGlow'
import Logo from './Logo'
import { useKiosk } from '../context/KioskContext'

// Casco padrão das telas do totem. Clicar no logo volta ao início.
//
// Vertical (totem): logo no topo e conteúdo numa coluna central estreita.
// Horizontal (TV): logo no canto superior esquerdo e o conteúdo ocupa a largura
// toda — cada tela organiza suas colunas (texto à esquerda, ação à direita).
export default function KioskScreen({ children, showLogo = true, contentClassName = '' }) {
  const { resetToIdle, isLandscape } = useKiosk()

  if (isLandscape) {
    return (
      <ScreenTransition className="relative flex h-full min-h-full w-full flex-col overflow-hidden bg-revi-gradient text-white">
        <BackgroundGlow />
        {showLogo && (
          <div className="absolute left-[4vw] top-[5vh] z-10">
            <Logo className="h-[clamp(2rem,3.2vw,3.2rem)]" onClick={resetToIdle} />
          </div>
        )}
        <div
          className={`relative mx-auto flex w-full max-w-[1760px] flex-1 items-center gap-[4vw] px-[4vw] pb-[5vh] pt-[14vh] ${contentClassName}`}
        >
          {children}
        </div>
      </ScreenTransition>
    )
  }

  return (
    <ScreenTransition className="relative flex min-h-full w-full flex-col items-center overflow-hidden bg-revi-gradient text-white">
      <BackgroundGlow />
      <div className="relative flex w-full flex-1 flex-col items-center px-6 py-10">
        {showLogo && <Logo className="h-8 shrink-0 mb-8 sm:h-10" onClick={resetToIdle} />}
        <div className={`flex w-full max-w-[440px] flex-1 flex-col items-center justify-center gap-8 text-center ${contentClassName}`}>
          {children}
        </div>
      </div>
    </ScreenTransition>
  )
}

// Coluna de texto do layout horizontal (título/subtítulo alinhados à esquerda).
export function LandscapeLead({ children, className = '' }) {
  return <div className={`flex min-w-0 flex-1 flex-col items-start gap-[3vh] text-left ${className}`}>{children}</div>
}

// Coluna de ação do layout horizontal (painel, botões, opções).
export function LandscapeAside({ children, className = '' }) {
  return <div className={`flex min-w-0 flex-1 flex-col items-stretch gap-[3vh] ${className}`}>{children}</div>
}

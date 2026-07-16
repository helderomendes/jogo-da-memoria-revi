import ScreenTransition from './ScreenTransition'
import BackgroundGlow from './BackgroundGlow'
import Logo from './Logo'

// Casco padrão das telas do totem: logo Revi grande no topo, conteúdo
// centralizado numa coluna de largura máxima (não esticado pela tela toda) e
// scrollável se não couber — funciona tanto no retrato do totem quanto em
// qualquer janela de desktop.
export default function KioskScreen({ children, showLogo = true, contentClassName = '' }) {
  return (
    <ScreenTransition className="relative flex min-h-full w-full flex-col items-center overflow-hidden bg-revi-gradient text-white">
      <BackgroundGlow />
      <div className="relative flex w-full flex-1 flex-col items-center px-6 py-10">
        {showLogo && <Logo className="h-8 shrink-0 mb-8 sm:h-10" linkToHome />}
        <div className={`flex w-full max-w-[440px] flex-1 flex-col items-center justify-center gap-8 text-center ${contentClassName}`}>
          {children}
        </div>
      </div>
    </ScreenTransition>
  )
}

import logoUrl from '../assets/logo-revi-dark.svg'

// Quando recebe `onClick`, o logo vira um botão (ex: "voltar ao início" no
// totem). Sem `onClick`, é só a imagem — usado onde o clique não deve resetar
// (tela do jogo e admin).
export default function Logo({ className = 'h-8', onClick }) {
  const img = <img src={logoUrl} alt="Revi" className={`w-auto ${className}`} />

  if (!onClick) return img

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voltar ao início"
      className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
    >
      {img}
    </button>
  )
}

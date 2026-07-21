import faviconUrl from '../assets/favicon.svg'

export default function Card({ card, index = 0, isFlipped, isMatched, isWrong, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
      className="h-full w-full [perspective:1000px] disabled:cursor-default animate-[cardIn_0.45s_ease-out_backwards]"
    >
      <div
        className={`h-full w-full ${
          isWrong ? 'animate-[shake_0.4s_ease-in-out]' : isMatched ? 'animate-[matchPop_0.5s_ease-out]' : ''
        }`}
      >
        <div
          className={`relative h-full w-full transition-transform duration-400 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Verso — glassmorfismo: vidro translúcido com blur e brilho no topo */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/8 shadow-card backdrop-blur-md [backface-visibility:hidden]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/18 to-transparent" />
            <img src={faviconUrl} alt="" className="relative h-[28%] w-[28%] opacity-45" />
          </div>

          {/* Frente — glass tingido conforme o estado (acerto / erro / neutro) */}
          <div
            className={`absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border p-2 text-center backdrop-blur-md [backface-visibility:hidden] [transform:rotateY(180deg)] transition-colors duration-200 ${
              isMatched
                ? 'border-lime-400/70 bg-lime-400/15 animate-[flashLime_0.9s_ease-out]'
                : isWrong
                  ? 'border-danger/70 bg-danger/20 animate-[flashDanger_0.8s_ease-out]'
                  : 'border-white/14 bg-white/10 shadow-card'
            }`}
          >
            {/* brilho superior */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/16 to-transparent" />

            {card.mode === 'image' && card.image ? (
              <img src={card.image} alt={card.text} className="relative h-full w-full rounded-md object-cover" />
            ) : (
              <p
                className={`relative font-sans font-semibold leading-tight text-[clamp(0.7rem,2.4vw,1.15rem)] ${
                  isMatched ? 'text-lime-200' : 'text-white'
                }`}
              >
                {card.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

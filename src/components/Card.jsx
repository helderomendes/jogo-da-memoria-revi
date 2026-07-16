import logoUrl from '../assets/logo-revi-dark.svg'

export default function Card({ card, index = 0, isFlipped, isMatched, isWrong, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
      className="h-full w-full [perspective:1200px] disabled:cursor-default animate-[cardIn_0.45s_ease-out_backwards]"
    >
      <div className={`h-full w-full ${isWrong ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <div
          className={`relative h-full w-full transition-transform duration-400 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          } ${!disabled ? 'active:scale-[0.96] active:duration-75' : ''}`}
        >
          {/* Verso */}
          <div className="card-depth card-back-face absolute inset-0 flex items-center justify-center rounded-xl border border-white/15 p-2 [backface-visibility:hidden]">
            <div className="pointer-events-none absolute inset-1 rounded-lg border border-white/10" />
            <img
              src={logoUrl}
              alt=""
              className="h-[34%] w-[34%] object-contain opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Frente */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-xl border p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] transition-colors duration-200 ${
              isMatched
                ? 'card-depth-lime card-front-face-matched border-lime-400/50'
                : isWrong
                  ? 'card-depth-danger card-front-face-wrong border-danger/50'
                  : 'card-depth card-front-face border-white/15'
            }`}
          >
            <div className="pointer-events-none absolute inset-1 rounded-lg border border-white/10" />
            {card.image ? (
              <img src={card.image} alt={card.text} className="h-full w-full object-cover rounded-md" />
            ) : (
              <p
                className={`font-sans font-semibold leading-tight text-[clamp(0.7rem,2.4vw,1.15rem)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${
                  isMatched ? 'text-lime-300' : 'text-white'
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

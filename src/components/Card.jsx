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
      <div className={`h-full w-full ${isWrong ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <div
          className={`relative h-full w-full transition-transform duration-400 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Verso */}
          <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-white/8 bg-navy-700 shadow-card [backface-visibility:hidden]">
            <img src={faviconUrl} alt="" className="h-[28%] w-[28%] opacity-40" />
          </div>

          {/* Frente */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-lg border p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] transition-colors duration-200 ${
              isMatched
                ? 'border-lime-400/60 bg-navy-700 shadow-glow-lime'
                : isWrong
                  ? 'border-danger/60 bg-navy-700'
                  : 'border-white/8 bg-navy-800 shadow-card'
            }`}
          >
            {card.image ? (
              <img src={card.image} alt={card.text} className="h-full w-full object-cover rounded-md" />
            ) : (
              <p
                className={`font-sans font-semibold leading-tight text-[clamp(0.7rem,2.4vw,1.15rem)] ${
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

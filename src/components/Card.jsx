export default function Card({ card, isFlipped, isMatched, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="aspect-[3/4] w-full [perspective:1000px] disabled:cursor-default"
    >
      <div
        className={`relative h-full w-full transition-transform duration-400 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Verso */}
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-crayola [backface-visibility:hidden]">
          <span className="font-sora text-lg font-extrabold text-white">
            rev<span className="text-electric">i</span>
          </span>
        </div>

        {/* Frente */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-lg bg-white p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
            isMatched ? 'ring-4 ring-electric' : ''
          }`}
        >
          {card.image ? (
            <img src={card.image} alt={card.text} className="h-full w-full object-cover rounded-md" />
          ) : (
            <p className="font-sora text-[0.7rem] sm:text-sm font-semibold leading-tight text-navy">
              {card.text}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

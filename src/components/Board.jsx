import Card from './Card'

export default function Board({ cards, flippedUids, matchedPairIds, onCardClick, disabled, cols }) {
  return (
    <div
      className="grid w-full max-w-2xl mx-auto gap-2 sm:gap-3 px-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cards.map((card) => (
        <Card
          key={card.uid}
          card={card}
          isFlipped={flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId)}
          isMatched={matchedPairIds.includes(card.pairId)}
          disabled={disabled || matchedPairIds.includes(card.pairId)}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  )
}

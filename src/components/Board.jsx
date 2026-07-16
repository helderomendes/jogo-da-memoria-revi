import Card from './Card'

export default function Board({
  cards,
  flippedUids,
  matchedPairIds,
  wrongUids = [],
  onCardClick,
  disabled,
  cols,
  rows,
}) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="grid w-full gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          aspectRatio: `${cols} / ${rows}`,
          maxHeight: '100%',
        }}
      >
        {cards.map((card, i) => (
          <Card
            key={card.uid}
            card={card}
            index={i}
            isFlipped={flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId)}
            isMatched={matchedPairIds.includes(card.pairId)}
            isWrong={wrongUids.includes(card.uid)}
            disabled={disabled || matchedPairIds.includes(card.pairId)}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>
    </div>
  )
}

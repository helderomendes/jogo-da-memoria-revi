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
  // Proporção total do tabuleiro para cada célula ficar 4:5 (capinhas).
  const boardRatio = (cols * 4) / (rows * 5)
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ containerType: 'size' }}
    >
      <div
        className="grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          aspectRatio: `${cols * 4} / ${rows * 5}`,
          // Maior tabuleiro que cabe respeitando largura E altura (contain):
          // limita a largura à menor entre a largura do container e a largura
          // que a altura permite (100cqh * proporção). A altura vem do aspect.
          width: `min(100cqw, ${(boardRatio * 100).toFixed(3)}cqh)`,
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

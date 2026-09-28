import Card from './Card'

// Proporção de cada célula (largura:altura). Cartas levemente "em pé" (5:8)
// deixam o tabuleiro 4x4 mais alto — assim ele preenche a altura de um totem
// retrato 9:16 em vez de sobrar faixa vazia em cima e embaixo.
// No layout horizontal (TV) as cartas ficam "deitadas" (8:5).
const RATIOS = {
  portrait: [5, 8],
  landscape: [8, 5],
}

export default function Board({
  cards,
  flippedUids,
  matchedPairIds,
  wrongUids = [],
  onCardClick,
  disabled,
  cols,
  rows,
  orientation = 'portrait',
}) {
  const [CARD_W, CARD_H] = RATIOS[orientation] ?? RATIOS.portrait
  const boardRatio = (cols * CARD_W) / (rows * CARD_H)
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ containerType: 'size' }}
    >
      <div
        className={orientation === 'landscape' ? 'grid gap-[1.2vh]' : 'grid gap-2 sm:gap-3'}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          aspectRatio: `${cols * CARD_W} / ${rows * CARD_H}`,
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
            large={orientation === 'landscape'}
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

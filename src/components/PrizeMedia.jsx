import { resolvePrizeIcon } from '../data/prizeIcons'

// Mídia do brinde num crop CIRCULAR. Mostra a foto cadastrada (object-cover,
// então qualquer proporção vira um círculo perfeito); sem foto, cai no ícone.
// Compartilhado entre a roleta de brinde e a revelação do prêmio.
export default function PrizeMedia({ tier, size = 96, tone = 'lime', className = '', ring = true }) {
  const Icon = resolvePrizeIcon(tier?.icon)
  const ringClass = ring
    ? tone === 'lime'
      ? 'ring-2 ring-lime-400/70'
      : 'ring-2 ring-white/15'
    : ''

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-800 ${ringClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {tier?.image ? (
        <img src={tier.image} alt={tier.label ?? ''} decoding="async" className="h-full w-full object-cover" />
      ) : (
        // `size` pode ser número (px) ou CSS (ex.: clamp()); o ícone acompanha em %.
        <Icon strokeWidth={1.75} className="h-[46%] w-[46%] text-lime-400" />
      )}
    </div>
  )
}

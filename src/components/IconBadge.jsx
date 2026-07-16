const TONES = {
  neutral: 'bg-white/8 text-white',
  lime: 'bg-lime-400 text-navy-950 shadow-glow-lime',
  limeSoft: 'bg-lime-400/15 text-lime-300 border border-lime-400/30',
  sky: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
}

// Tile de ícone arredondado — badge decorativo usado em cards de regra,
// prêmios e chips de destaque (referência: ícones em tile da Adnur/planner).
export default function IconBadge({ icon: Icon, tone = 'neutral', size = 48, className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl ${TONES[tone]} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} strokeWidth={1.75} />
    </div>
  )
}

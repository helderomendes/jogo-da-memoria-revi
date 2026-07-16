// Pill de estatística — inspirado no chip "YOUR BALANCE" da referência
// fintech: ícone + label + valor em destaque, dentro de uma pílula translúcida.
export default function Chip({ icon: Icon, label, value, tone = 'default', className = '' }) {
  const valueColor = tone === 'lime' ? 'text-lime-400' : tone === 'sky' ? 'text-sky-400' : 'text-white'

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-sm ${className}`}
    >
      {Icon && <Icon size={15} className="text-ink-300" />}
      <span className="text-xs font-medium text-ink-300">{label}</span>
      <span className={`text-sm font-bold ${valueColor}`}>{value}</span>
    </div>
  )
}

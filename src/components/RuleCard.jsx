import IconBadge from './IconBadge'

// Card de regra — mesmo padrão das referências (activity planner: "Today's
// Goal" / "Tomorrow's Goal"): ícone em tile + overline + título forte.
export default function RuleCard({ icon, overline, title, tone = 'neutral' }) {
  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-left">
      <IconBadge icon={icon} tone={tone} size={44} />
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-300">{overline}</p>
        <p className="text-lg font-bold text-white leading-tight">{title}</p>
      </div>
    </div>
  )
}

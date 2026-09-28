import IconBadge from './IconBadge'

// Card de regra — mesmo padrão das referências (activity planner: "Today's
// Goal" / "Tomorrow's Goal"): ícone em tile + overline + título forte.
// `large`: versão pra TV (layout horizontal), legível à distância.
export default function RuleCard({ icon, overline, title, tone = 'neutral', large = false }) {
  if (large) {
    return (
      <div className="flex h-full w-full flex-col items-start gap-[2vh] rounded-3xl border border-white/10 bg-white/6 p-[clamp(1.2rem,1.8vw,2.4rem)] text-left">
        <IconBadge icon={icon} tone={tone} size={64} />
        <div>
          <p className="text-[clamp(0.85rem,1vw,1.2rem)] uppercase tracking-wide text-ink-300">{overline}</p>
          <p className="text-[clamp(1.3rem,1.8vw,2.2rem)] font-bold leading-tight text-white">{title}</p>
        </div>
      </div>
    )
  }
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

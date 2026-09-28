import { useEffect, useMemo, useState } from 'react'
import { Users, Gamepad2, Trophy, Package, Tv, MonitorSmartphone, Dices, Hand, Tag } from 'lucide-react'
import { getGameLogs, getPrizeTiers, getCards, getGameConfig, leadKey } from '../utils/dataStore'
import { PRIZE_MODES } from '../data/config'
import { tierMode } from '../data/prizes'
import { resolvePrizeIcon } from '../data/prizeIcons'

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-line-light bg-card-light p-5">
      <div className="mb-2 flex items-center gap-2 text-ink-dim">
        <Icon size={18} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-ink-strong">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-dim">{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [logs, setLogs] = useState(null)
  const [tiers, setTiers] = useState(null)
  const [cards, setCards] = useState(null)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    getGameConfig().then(setConfig)
    getGameLogs().then(setLogs)
    getPrizeTiers().then(setTiers)
    getCards().then(setCards)
  }, [])

  const stats = useMemo(() => {
    if (!logs) return null
    const totalGames = logs.length
    const uniqueLeads = new Set(logs.map(leadKey).filter(Boolean)).size
    const winners = logs.filter((l) => l.codigoRetirada).length
    const winRate = totalGames > 0 ? Math.round((winners / totalGames) * 100) : 0

    const prizeCounts = {}
    logs.forEach((l) => {
      if (!l.codigoRetirada) return
      prizeCounts[l.premioGanho] = (prizeCounts[l.premioGanho] || 0) + 1
    })
    return { totalGames, uniqueLeads, winners, winRate, prizeCounts }
  }, [logs])

  if (!logs || !tiers || !cards || !stats || !config) return <p>Carregando...</p>

  const activeMode = PRIZE_MODES.find((m) => m.id === config.prizeMode) ?? PRIZE_MODES[0]
  const activeTiers = tiers.filter((t) => tierMode(t) === activeMode.id)
  const eventLeads = config.eventTag
    ? new Set(logs.filter((l) => (l.tags ?? []).includes(config.eventTag)).map(leadKey).filter(Boolean)).size
    : 0

  const totalStockInitial = activeTiers.reduce((s, t) => s + (t.stockInitial || 0), 0)
  const totalStockLeft = activeTiers.reduce(
    (s, t) => s + (typeof t.stock === 'number' ? t.stock : 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Setup ativo no totem: evento, formato e modelo de premiação */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={Tag}
          label="Evento atual"
          value={config.eventName || '—'}
          hint={config.eventTag ? `${eventLeads} leads únicos com a tag ${config.eventTag}` : 'sem tag de evento'}
        />
        <StatCard
          icon={config.layout === 'portrait' ? MonitorSmartphone : Tv}
          label="Formato da tela"
          value={config.layout === 'portrait' ? 'Vertical' : 'Horizontal'}
          hint={config.layout === 'portrait' ? 'totem em pé' : 'TV / monitor deitado'}
        />
        <StatCard
          icon={activeMode.id === 'choice' ? Hand : Dices}
          label="Modelo de premiação"
          value={activeMode.label}
          hint={
            activeMode.id === 'choice'
              ? `${config.choiceMinPairs ?? 4}+ pares escolhem: ${activeTiers.filter((t) => t.enabled !== false).map((t) => t.label).join(', ')}`
              : 'brinde sorteado por faixa de acertos'
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Gamepad2} label="Partidas jogadas" value={stats.totalGames} />
        <StatCard icon={Users} label="Leads únicos" value={stats.uniqueLeads} hint="por telefone/nome" />
        <StatCard
          icon={Trophy}
          label="Taxa de prêmio"
          value={`${stats.winRate}%`}
          hint={`${stats.winners} brindes entregues`}
        />
        <StatCard
          icon={Package}
          label="Estoque restante"
          value={totalStockLeft}
          hint={`de ${totalStockInitial} cadastrados (modelo ativo)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Estoque por brinde */}
        <div className="rounded-xl border border-line-light bg-card-light p-5">
          <h3 className="mb-4 text-base font-bold">Estoque por brinde · {activeMode.label}</h3>
          <div className="space-y-4">
            {activeTiers.map((tier) => {
              const Icon = resolvePrizeIcon(tier.icon)
              const initial = tier.stockInitial || 0
              const isUnlimited = typeof tier.stock !== 'number'
              const pct = initial > 0 ? Math.round((tier.stock / initial) * 100) : 0
              const out = !isUnlimited && tier.stock <= 0
              return (
                <div key={tier.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-lime-400">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold">
                        {tier.label}
                        {tier.enabled === false && (
                          <span className="ml-2 text-xs font-normal text-ink-dim">(inativo)</span>
                        )}
                      </span>
                      <span className={out ? 'font-semibold text-red-500' : 'text-ink-dim'}>
                        {isUnlimited ? 'Ilimitado' : out ? 'Esgotado' : `${tier.stock}/${initial}`}
                      </span>
                    </div>
                    {!isUnlimited && (
                      <div className="h-2 w-full overflow-hidden rounded-full bg-chip-light">
                        <div
                          className={`h-full rounded-full ${out ? 'bg-red-400' : 'bg-lime-400'}`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Prêmios entregues */}
        <div className="rounded-xl border border-line-light bg-card-light p-5">
          <h3 className="mb-4 text-base font-bold">Prêmios entregues</h3>
          {Object.keys(stats.prizeCounts).length === 0 ? (
            <p className="text-sm text-ink-dim">Nenhum prêmio entregue ainda.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.prizeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{label}</span>
                    <span className="rounded-full bg-chip-light px-3 py-1 text-xs font-bold">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
          <div className="mt-6 border-t border-line-light pt-4 text-sm text-ink-dim">
            {cards.length} pares de cartas cadastrados ·{' '}
            {cards.filter((c) => c.mode === 'image').length} com imagem ·{' '}
            {cards.filter((c) => c.mode !== 'image').length} com título
          </div>
        </div>
      </div>
    </div>
  )
}

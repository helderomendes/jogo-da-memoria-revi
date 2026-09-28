import { useEffect, useMemo, useState } from 'react'
import { Search, Download, Trash2, Plus, Pencil, X, Users, Gamepad2, Trophy, Tag } from 'lucide-react'
import {
  getGameLogs,
  clearGameLogs,
  addGameLog,
  updateGameLog,
  deleteGameLog,
  normalizeTags,
  leadKey,
  normalizePhone,
  getGameConfig,
  SOURCE_TAG,
} from '../utils/dataStore'

const COLUMNS = [
  { key: 'timestamp', label: 'Data/hora' },
  { key: 'name', label: 'Nome' },
  { key: 'phone', label: 'Telefone' },
  { key: 'company', label: 'Empresa/site' },
  { key: 'evento', label: 'Evento' },
  { key: 'chancesUsadas', label: 'Chances usadas' },
  { key: 'paresCertos', label: 'Pares certos' },
  { key: 'premioGanho', label: 'Prêmio' },
  { key: 'codigoRetirada', label: 'Código' },
  { key: 'tags', label: 'Tags' },
]

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function logsToCSV(logs) {
  const header = COLUMNS.map((c) => c.label).join(',')
  const rows = logs.map((log) =>
    COLUMNS.map((c) => {
      const value = log[c.key]
      return csvEscape(Array.isArray(value) ? value.join('|') : value)
    }).join(','),
  )
  return [header, ...rows].join('\n')
}

// Evento de origem do lead: tags que não são a tag fixa do jogo. A tag do evento
// configurado vira o nome bonito (ex.: d2c-summit → "D2C Summit").
function eventTagsOf(log) {
  return (log.tags ?? []).filter((t) => t !== SOURCE_TAG)
}

function eventLabel(tag, config) {
  if (config?.eventTag && tag === config.eventTag) return config.eventName || tag
  return tag
}

function withEvent(log, config) {
  const tags = eventTagsOf(log)
  const evTag = config?.eventTag && tags.includes(config.eventTag) ? config.eventTag : tags[0]
  return { ...log, evento: evTag ? eventLabel(evTag, config) : '' }
}

// CSV pronto pro import de contatos do HubSpot: nome separado, telefone em
// E.164 (+55...) e as colunas de origem. No import, mapeie "Evento de origem"
// pra uma propriedade de contato (ex.: uma propriedade "Evento de origem") e/ou
// adicione os contatos a uma lista do evento.
const HUBSPOT_COLUMNS = [
  'First Name',
  'Last Name',
  'Phone Number',
  'Company Name',
  'Evento de origem',
  'Origem do lead',
  'Tags',
  'Prêmio',
  'Código de retirada',
  'Data da partida',
]

function logsToHubSpotCSV(logs) {
  const rows = logs.map((log) => {
    const [first, ...rest] = String(log.name ?? '').trim().split(/\s+/)
    const digits = normalizePhone(log.phone)
    return [
      first ?? '',
      rest.join(' '),
      digits ? `+55${digits}` : '',
      log.company ?? '',
      log.evento ?? '',
      log.evento ? `Evento presencial — ${log.evento} (Jogo da Memória Revi)` : 'Jogo da Memória Revi',
      (log.tags ?? []).join(';'),
      log.premioGanho ?? '',
      log.codigoRetirada ?? '',
      log.timestamp ? new Date(log.timestamp).toISOString() : '',
    ]
      .map(csvEscape)
      .join(',')
  })
  // BOM: acentos corretos no Excel e no importador do HubSpot.
  return '\uFEFF' + [HUBSPOT_COLUMNS.join(','), ...rows].join('\n')
}

function KpiCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line-light bg-card-light px-5 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chip-light text-brand-navy">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim">{label}</p>
        <p className="text-2xl font-extrabold leading-tight text-ink-strong">{value}</p>
        {hint && <p className="truncate text-xs text-ink-dim">{hint}</p>}
      </div>
    </div>
  )
}

// Um registro por lead único. Recebe a lista já ordenada (mais recente primeiro)
// e mantém a primeira ocorrência de cada chave = a partida mais recente da pessoa.
function uniqueLeads(logs) {
  const seen = new Map()
  for (const log of logs) {
    const key = leadKey(log)
    if (key && !seen.has(key)) seen.set(key, log)
  }
  return [...seen.values()]
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// datetime-local espera 'YYYY-MM-DDTHH:mm' no horário local.
function toDatetimeLocal(iso) {
  const d = iso ? new Date(iso) : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const EMPTY_FORM = {
  timestamp: '',
  name: '',
  phone: '',
  company: '',
  chancesUsadas: '',
  paresCertos: '',
  premioGanho: '',
  codigoRetirada: '',
  tags: '',
}

function TagPills({ tags }) {
  return (
    <div className="flex flex-wrap gap-1">
      {(tags ?? []).map((t) => (
        <span
          key={t}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            t === SOURCE_TAG ? 'bg-brand-navy/10 text-brand-navy' : 'bg-chip-light text-ink-medium'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

function LeadModal({ initial, onClose, onSave }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          timestamp: toDatetimeLocal(initial.timestamp),
          name: initial.name ?? '',
          phone: initial.phone ?? '',
          company: initial.company ?? '',
          chancesUsadas: initial.chancesUsadas ?? '',
          paresCertos: initial.paresCertos ?? '',
          premioGanho: initial.premioGanho ?? '',
          codigoRetirada: initial.codigoRetirada ?? '',
          // Mostra as tags editáveis SEM a de origem — ela é reaplicada ao salvar.
          tags: (initial.tags ?? []).filter((t) => t !== SOURCE_TAG).join(', '),
        }
      : { ...EMPTY_FORM, timestamp: toDatetimeLocal(), tags: (initial?.tags ?? []).join(', ') },
  )
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const previewTags = normalizeTags(form.tags)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        timestamp: new Date(form.timestamp).toISOString(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        chancesUsadas: form.chancesUsadas === '' ? null : Number(form.chancesUsadas),
        paresCertos: form.paresCertos === '' ? null : Number(form.paresCertos),
        premioGanho: form.premioGanho.trim(),
        codigoRetirada: form.codigoRetirada.trim(),
        tags: form.tags,
      }
      const saved = isEdit ? await updateGameLog(initial.id, payload) : await addGameLog(payload)
      onSave(saved, isEdit)
    } catch (err) {
      console.error(err)
      window.alert('Não foi possível salvar o lead. Tente novamente.')
      setSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-lg border border-line-light bg-card-light px-3 py-2 text-sm outline-none focus:border-brand-navy'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-card-light p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{isEdit ? 'Editar lead' : 'Novo lead'}</h3>
          <button type="button" onClick={onClose} className="text-ink-dim hover:text-ink-strong">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-dim">Nome *</label>
            <input value={form.name} onChange={set('name')} className={inputCls} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-dim">Telefone</label>
              <input value={form.phone} onChange={set('phone')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-dim">Empresa/site</label>
              <input value={form.company} onChange={set('company')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-dim">Chances usadas</label>
              <input type="number" min="0" value={form.chancesUsadas} onChange={set('chancesUsadas')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-dim">Pares certos</label>
              <input type="number" min="0" value={form.paresCertos} onChange={set('paresCertos')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-dim">Prêmio</label>
              <input value={form.premioGanho} onChange={set('premioGanho')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-dim">Código de retirada</label>
              <input value={form.codigoRetirada} onChange={set('codigoRetirada')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-dim">Data/hora</label>
            <input type="datetime-local" value={form.timestamp} onChange={set('timestamp')} className={inputCls} required />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-dim">
              Tags adicionais (separadas por vírgula)
            </label>
            <input value={form.tags} onChange={set('tags')} placeholder="ex.: feira-2026, vip" className={inputCls} />
            <div className="mt-2">
              <TagPills tags={previewTags} />
              <p className="mt-1 text-xs text-ink-dim">
                A tag <b>{SOURCE_TAG}</b> é sempre mantida no final.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line-light px-4 py-2 text-sm font-semibold hover:bg-chip-light"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LogsTable() {
  const [logs, setLogs] = useState(null)
  const [config, setConfig] = useState(null)
  const [query, setQuery] = useState('')
  const [eventFilter, setEventFilter] = useState('all') // 'all' | tag | '__none__'
  const [editing, setEditing] = useState(null) // {} = novo, {id,...} = edição, null = fechado

  useEffect(() => {
    getGameLogs().then((data) => setLogs([...data].reverse()))
    getGameConfig().then(setConfig)
  }, [])

  const enriched = useMemo(() => (logs ?? []).map((l) => withEvent(l, config)), [logs, config])

  // Eventos presentes na base (tags de origem), com contagem — viram filtros.
  const events = useMemo(() => {
    const counts = new Map()
    let none = 0
    for (const log of enriched) {
      const tags = eventTagsOf(log)
      if (!tags.length) none += 1
      for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    const list = [...counts.entries()].sort((a, b) => {
      if (a[0] === config?.eventTag) return -1
      if (b[0] === config?.eventTag) return 1
      return b[1] - a[1]
    })
    return { list, none }
  }, [enriched, config])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched.filter((log) => {
      if (eventFilter === '__none__' && eventTagsOf(log).length) return false
      if (eventFilter !== 'all' && eventFilter !== '__none__' && !(log.tags ?? []).includes(eventFilter)) return false
      if (!q) return true
      return [log.name, log.phone, log.company, log.premioGanho, log.codigoRetirada, log.evento, ...(log.tags ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [enriched, query, eventFilter])

  const uniques = useMemo(() => uniqueLeads(filtered), [filtered])

  if (!logs) return <p>Carregando...</p>

  const today = new Date().toISOString().slice(0, 10)
  const scope = eventFilter === 'all' ? 'todos' : eventFilter === '__none__' ? 'sem-evento' : eventFilter
  const winners = filtered.filter((l) => l.codigoRetirada).length

  const handleExport = () => {
    downloadCSV(logsToCSV(filtered), `revi-memoria-partidas-${scope}-${today}.csv`)
  }

  const handleExportUnique = () => {
    downloadCSV(logsToCSV(uniques), `revi-memoria-leads-unicos-${scope}-${today}.csv`)
  }

  const handleExportHubSpot = () => {
    downloadCSV(logsToHubSpotCSV(uniques), `hubspot-leads-${scope}-${today}.csv`)
  }

  const handleClear = async () => {
    if (!window.confirm('Apagar TODOS os leads/partidas registrados? Essa ação não pode ser desfeita.')) return
    await clearGameLogs()
    setLogs([])
  }

  const handleDelete = async (log) => {
    if (!window.confirm(`Excluir o lead de "${log.name}"? Essa ação não pode ser desfeita.`)) return
    await deleteGameLog(log.id)
    setLogs((prev) => prev.filter((l) => l.id !== log.id))
  }

  const handleSaved = (saved, isEdit) => {
    setLogs((prev) => {
      const next = isEdit ? prev.map((l) => (l.id === saved.id ? saved : l)) : [saved, ...prev]
      // Mantém ordenado por data desc (edição pode ter mudado a data).
      return [...next].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })
    setEditing(null)
  }

  const chipCls = (active) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
      active ? 'bg-brand-navy text-white' : 'border border-line-light bg-card-light text-ink-medium hover:bg-chip-light'
    }`

  const scopeLabel =
    eventFilter === 'all' ? 'todos os eventos' : eventFilter === '__none__' ? 'sem evento' : eventLabel(eventFilter, config)

  return (
    <div className="space-y-5">
      {/* KPIs do recorte atual — lado a lado */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard icon={Gamepad2} label="Partidas" value={filtered.length} hint={scopeLabel} />
        <KpiCard icon={Users} label="Leads únicos" value={uniques.length} hint="por telefone/nome" />
        <KpiCard icon={Trophy} label="Com prêmio" value={winners} hint="com código de retirada" />
        <KpiCard
          icon={Tag}
          label="Evento atual"
          value={config?.eventName || '—'}
          hint={config?.eventTag ? `tag: ${config.eventTag}` : 'sem tag configurada'}
        />
      </div>

      {/* Filtros à esquerda, ações à direita */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line-light bg-card-light p-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative mr-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nome, telefone, prêmio, tag..."
              className="w-72 rounded-full border border-line-light bg-page-light py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Evento:</span>
          <button type="button" onClick={() => setEventFilter('all')} className={chipCls(eventFilter === 'all')}>
            Todos ({logs.length})
          </button>
          {events.list.map(([tag, count]) => (
            <button key={tag} type="button" onClick={() => setEventFilter(tag)} className={chipCls(eventFilter === tag)}>
              {eventLabel(tag, config)} ({count})
            </button>
          ))}
          {events.none > 0 && (
            <button
              type="button"
              onClick={() => setEventFilter('__none__')}
              className={chipCls(eventFilter === '__none__')}
            >
              Sem evento ({events.none})
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light px-4 py-2 text-sm font-semibold hover:bg-chip-light"
          >
            <Plus size={15} /> Novo lead
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light px-4 py-2 text-sm font-semibold hover:bg-chip-light disabled:opacity-40"
            title="Todas as partidas do recorte (uma linha por jogo)"
          >
            <Download size={15} /> Partidas
          </button>
          <button
            type="button"
            onClick={handleExportUnique}
            disabled={uniques.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light px-4 py-2 text-sm font-semibold hover:bg-chip-light disabled:opacity-40"
            title="Uma linha por lead único (dedup por telefone/nome)"
          >
            <Download size={15} /> Leads únicos ({uniques.length})
          </button>
          <button
            type="button"
            onClick={handleExportHubSpot}
            disabled={uniques.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ff7a59] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"
            title="CSV de contatos pro import do HubSpot, com a coluna Evento de origem"
          >
            <Download size={15} /> Exportar p/ HubSpot
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 size={15} /> Limpar
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-line-light bg-card-light">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-chip-light text-left text-ink-dim">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-t border-line-light hover:bg-page-light">
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-2 font-semibold">{log.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{log.phone ?? '-'}</td>
                <td className="px-4 py-2">{log.company ?? '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{log.evento || '-'}</td>
                <td className="px-4 py-2 text-center">{log.chancesUsadas ?? '-'}</td>
                <td className="px-4 py-2 text-center">{log.paresCertos ?? '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{log.premioGanho ?? '-'}</td>
                <td className="px-4 py-2 font-mono">{log.codigoRetirada ?? '-'}</td>
                <td className="px-4 py-2">
                  <TagPills tags={log.tags} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(log)}
                      title="Editar"
                      className="rounded-lg p-1.5 text-ink-dim hover:bg-chip-light hover:text-brand-navy"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(log)}
                      title="Excluir"
                      className="rounded-lg p-1.5 text-ink-dim hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-6 text-center text-ink-dim">
                  {logs.length === 0 ? 'Nenhuma partida registrada ainda.' : 'Nenhum resultado para o filtro.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <LeadModal
          initial={editing.id ? editing : { tags: config?.eventTag ? [config.eventTag] : [] }}
          onClose={() => setEditing(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  )
}

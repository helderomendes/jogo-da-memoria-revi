import { useEffect, useMemo, useState } from 'react'
import { Search, Download, Trash2, Plus, Pencil, X } from 'lucide-react'
import {
  getGameLogs,
  clearGameLogs,
  addGameLog,
  updateGameLog,
  deleteGameLog,
  normalizeTags,
  SOURCE_TAG,
} from '../utils/dataStore'

const COLUMNS = [
  { key: 'timestamp', label: 'Data/hora' },
  { key: 'name', label: 'Nome' },
  { key: 'phone', label: 'Telefone' },
  { key: 'company', label: 'Empresa/site' },
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
      : { ...EMPTY_FORM, timestamp: toDatetimeLocal() },
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
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // {} = novo, {id,...} = edição, null = fechado

  useEffect(() => {
    getGameLogs().then((data) => setLogs([...data].reverse()))
  }, [])

  const filtered = useMemo(() => {
    if (!logs) return []
    const q = query.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((log) =>
      [log.name, log.phone, log.company, log.premioGanho, log.codigoRetirada, ...(log.tags ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [logs, query])

  if (!logs) return <p>Carregando...</p>

  const handleExport = () => {
    const csv = logsToCSV(filtered)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `revi-memoria-leads-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          Leads &amp; partidas ({filtered.length}
          {query ? ` de ${logs.length}` : ''})
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nome, telefone, prêmio, tag..."
              className="w-64 rounded-full border border-line-light bg-card-light py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus size={15} /> Novo lead
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-light px-4 py-2 text-sm font-semibold hover:bg-chip-light disabled:opacity-40"
          >
            <Download size={15} /> Exportar CSV
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

      <div className="overflow-auto rounded-lg border border-line-light bg-card-light">
        <table className="w-full text-sm">
          <thead className="bg-chip-light text-left text-ink-dim">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-2">
                  {c.label}
                </th>
              ))}
              <th className="whitespace-nowrap px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-t border-line-light">
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-2">{log.name}</td>
                <td className="px-4 py-2">{log.phone ?? '-'}</td>
                <td className="px-4 py-2">{log.company ?? '-'}</td>
                <td className="px-4 py-2">{log.chancesUsadas ?? '-'}</td>
                <td className="px-4 py-2">{log.paresCertos ?? '-'}</td>
                <td className="px-4 py-2">{log.premioGanho ?? '-'}</td>
                <td className="px-4 py-2">{log.codigoRetirada ?? '-'}</td>
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
                  {logs.length === 0 ? 'Nenhuma partida registrada ainda.' : 'Nenhum resultado para a busca.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <LeadModal initial={editing} onClose={() => setEditing(null)} onSave={handleSaved} />
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Search, Download, Trash2 } from 'lucide-react'
import { getGameLogs, clearGameLogs } from '../utils/dataStore'

const COLUMNS = [
  { key: 'timestamp', label: 'Data/hora' },
  { key: 'name', label: 'Nome' },
  { key: 'phone', label: 'Telefone' },
  { key: 'company', label: 'Empresa/site' },
  { key: 'chancesUsadas', label: 'Chances usadas' },
  { key: 'paresCertos', label: 'Pares certos' },
  { key: 'premioGanho', label: 'Prêmio' },
  { key: 'codigoRetirada', label: 'Código' },
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

export default function LogsTable() {
  const [logs, setLogs] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getGameLogs().then((data) => setLogs([...data].reverse()))
  }, [])

  const filtered = useMemo(() => {
    if (!logs) return []
    const q = query.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((log) =>
      [log.name, log.phone, log.company, log.premioGanho, log.codigoRetirada]
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
    link.download = `revi-memoria-leads-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = async () => {
    if (!window.confirm('Apagar TODOS os leads/partidas registrados? Essa ação não pode ser desfeita.')) return
    await clearGameLogs()
    setLogs([])
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          Leads &amp; partidas ({filtered.length}
          {query ? ` de ${logs.length}` : ''})
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nome, telefone, prêmio..."
              className="w-64 rounded-full border border-line-light bg-card-light py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={i} className="border-t border-line-light">
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-2">{log.name}</td>
                <td className="px-4 py-2">{log.phone ?? '-'}</td>
                <td className="px-4 py-2">{log.company ?? '-'}</td>
                <td className="px-4 py-2">{log.chancesUsadas}</td>
                <td className="px-4 py-2">{log.paresCertos}</td>
                <td className="px-4 py-2">{log.premioGanho}</td>
                <td className="px-4 py-2">{log.codigoRetirada ?? '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-ink-dim">
                  {logs.length === 0 ? 'Nenhuma partida registrada ainda.' : 'Nenhum resultado para a busca.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

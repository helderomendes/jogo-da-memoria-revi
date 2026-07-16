import { useEffect, useState } from 'react'
import { getGameLogs } from '../utils/dataStore'

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

  useEffect(() => {
    getGameLogs().then((data) => setLogs([...data].reverse()))
  }, [])

  if (!logs) return <p>Carregando...</p>

  const handleExport = () => {
    const csv = logsToCSV(logs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `revi-memoria-log-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Log de partidas ({logs.length})</h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={logs.length === 0}
          className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40"
        >
          Exportar CSV
        </button>
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
            {logs.map((log, i) => (
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
            {logs.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-ink-dim">
                  Nenhuma partida registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

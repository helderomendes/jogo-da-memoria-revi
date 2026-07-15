import { useState } from 'react'
import { Link } from 'react-router-dom'
import CardsEditor from './CardsEditor'
import PrizesEditor from './PrizesEditor'
import ConfigEditor from './ConfigEditor'
import LogsTable from './LogsTable'

const TABS = [
  { id: 'cards', label: 'Cartas' },
  { id: 'prizes', label: 'Prêmios' },
  { id: 'config', label: 'Configurações' },
  { id: 'logs', label: 'Log de partidas' },
]

export default function AdminApp() {
  const [tab, setTab] = useState('cards')

  return (
    <div className="min-h-screen bg-slate-100 font-sora text-navy">
      <header className="flex items-center justify-between bg-navy px-6 py-4 text-white">
        <h1 className="text-xl font-bold">
          rev<span className="text-electric">i</span> · Admin do Totem
        </h1>
        <Link to="/" className="text-sm text-electric underline">
          Voltar ao totem
        </Link>
      </header>

      <nav className="flex gap-2 border-b border-slate-200 bg-white px-6 py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-crayola text-white' : 'text-navy/70 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-5xl p-6">
        {tab === 'cards' && <CardsEditor />}
        {tab === 'prizes' && <PrizesEditor />}
        {tab === 'config' && <ConfigEditor />}
        {tab === 'logs' && <LogsTable />}
      </main>
    </div>
  )
}

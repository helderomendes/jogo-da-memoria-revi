import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
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
    <div className="min-h-screen bg-page-light font-sans text-ink-strong">
      <header className="flex items-center justify-between bg-navy-900 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <Logo className="h-6" />
          <span className="text-white/40">·</span>
          <h1 className="text-lg font-semibold">Admin do Totem</h1>
        </div>
        <Link to="/" className="text-sm font-semibold text-lime-400 underline">
          Voltar ao totem
        </Link>
      </header>

      <nav className="flex gap-2 border-b border-line-light bg-card-light px-6 py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-brand-navy text-white' : 'text-ink-medium hover:bg-chip-light'
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

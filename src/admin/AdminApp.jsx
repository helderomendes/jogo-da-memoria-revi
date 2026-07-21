import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import Logo from '../components/Logo'
import LoginScreen from './LoginScreen'
import Dashboard from './Dashboard'
import CardsEditor from './CardsEditor'
import PrizesEditor from './PrizesEditor'
import ConfigEditor from './ConfigEditor'
import LogsTable from './LogsTable'

const TABS = [
  { id: 'dashboard', label: 'Visão geral' },
  { id: 'cards', label: 'Cartas' },
  { id: 'prizes', label: 'Brindes & estoque' },
  { id: 'config', label: 'Configurações' },
  { id: 'leads', label: 'Leads' },
]

export default function AdminApp() {
  const [tab, setTab] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light text-ink-medium">
        Carregando...
      </div>
    )
  }

  if (!session) return <LoginScreen />

  return (
    <div className="min-h-screen bg-page-light font-sans text-ink-strong">
      <header className="flex items-center justify-between bg-navy-900 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <Logo className="h-6" />
          <span className="text-white/40">·</span>
          <h1 className="text-lg font-semibold">Admin do Totem</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-white/50 sm:inline">{session.user?.email}</span>
          <Link to="/" className="font-semibold text-lime-400 underline">
            Ver totem
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-1.5 font-semibold text-white/70 hover:text-white"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
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
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'cards' && <CardsEditor />}
        {tab === 'prizes' && <PrizesEditor />}
        {tab === 'config' && <ConfigEditor />}
        {tab === 'leads' && <LogsTable />}
      </main>
    </div>
  )
}

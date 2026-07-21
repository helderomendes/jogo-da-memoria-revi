import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'
import Logo from '../components/Logo'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError('Email ou senha inválidos.')
    // Sucesso: onAuthStateChange no AdminApp troca a tela automaticamente.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-revi-gradient px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo className="h-8" />
          <h1 className="text-xl font-bold text-white">Painel do Totem</h1>
          <p className="text-sm text-ink-300">Entre para gerenciar cartas, brindes e leads.</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
            Supabase não configurado. Preencha o arquivo .env com as chaves do projeto.
          </p>
        )}

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-ink-300 focus:border-lime-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-ink-300 focus:border-lime-400"
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 font-bold text-navy-900 transition hover:brightness-105 disabled:opacity-50"
        >
          <LogIn size={18} />
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

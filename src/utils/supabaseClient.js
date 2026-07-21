import { createClient } from '@supabase/supabase-js'

// Chaves ficam em variáveis de ambiente (arquivo .env — veja .env.example).
// A anon key é pública por design (roda no front-end); a proteção real vem das
// políticas de RLS no banco.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Erro visível no console pra facilitar o diagnóstico em produção/totem.
  console.error(
    '[Supabase] VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não definidas. ' +
      'Copie .env.example para .env e preencha as chaves do projeto.',
  )
}

// Placeholders evitam que createClient lance erro quando o .env ainda não foi
// preenchido — assim a tela de login consegue exibir o aviso de "não configurado"
// em vez de uma tela branca.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)

export const isSupabaseConfigured = Boolean(url && anonKey)

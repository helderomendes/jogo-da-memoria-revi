import { CloudOff, RefreshCw } from 'lucide-react'

// Selo discreto no canto: aparece só quando está offline ou há partidas na fila
// aguardando sincronização. Some sozinho quando tudo sobe pro servidor.
export default function OfflineBadge({ online, pending }) {
  if (online && pending === 0) return null

  return (
    <div className="fixed left-3 top-3 z-50 flex items-center gap-1.5 rounded-full border border-white/15 bg-navy-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-card backdrop-blur">
      {online ? (
        <>
          <RefreshCw size={13} className="animate-spin text-sky-400" />
          Sincronizando {pending}...
        </>
      ) : (
        <>
          <CloudOff size={13} className="text-warning" />
          Offline{pending > 0 ? ` · ${pending} p/ enviar` : ''}
        </>
      )}
    </div>
  )
}

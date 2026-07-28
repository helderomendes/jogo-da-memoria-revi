/* global __APP_VERSION__, __BUILD_TIME__ */
// Selo minúsculo no canto: mostra o commit no ar + quando foi o build. Serve de
// prova visual de que a atualização subiu (muda a cada deploy). Injetado pelo
// Vite (define) — ver vite.config.js.
const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const BUILT_AT = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : ''

function shortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// Texto do selo, reutilizável (ex.: cabeçalho do admin).
export const versionLabel = `v${VERSION}${BUILT_AT ? ` · ${shortDate(BUILT_AT)}` : ''}`

export default function VersionBadge() {
  return (
    <div className="pointer-events-none fixed bottom-1.5 right-2 z-50 select-none font-mono text-[10px] leading-none text-white/25">
      v{VERSION}
      {BUILT_AT ? ` · ${shortDate(BUILT_AT)}` : ''}
    </div>
  )
}

// Card glassmorphic — painel principal "hero" usado nas telas do totem,
// inspirado nas referências (fintech card, activity planner): fundo
// translúcido com blur, borda clara sutil, radius generoso.
export default function GlassPanel({ children, className = '' }) {
  return (
    <div
      className={`rounded-[32px] border border-white/12 bg-white/6 shadow-card backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}

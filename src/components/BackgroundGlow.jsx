// Halos radiais no fundo, à la referências (fintech card, activity planner):
// dão profundidade sem pesar — puramente decorativo, position:absolute atrás do conteúdo.
export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-1/4 top-[-10%] h-[55%] w-[85%] rounded-full opacity-40 blur-3xl animate-[blobDrift_9s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #1e86e6 0%, transparent 70%)' }}
      />
      <div
        className="absolute -right-1/4 bottom-[-10%] h-[50%] w-[80%] rounded-full opacity-30 blur-3xl animate-[blobDrift_11s_ease-in-out_infinite_reverse]"
        style={{ background: 'radial-gradient(circle, #32c700 0%, transparent 70%)' }}
      />
    </div>
  )
}

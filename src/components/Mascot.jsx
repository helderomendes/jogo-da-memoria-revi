// ROI, o mascote 3D azul-e-verde da Revi.
// Nota: o render oficial (assets/mascot-roi.png no Design System) veio truncado
// ao ser lido (arquivo > limite de 256KB da ferramenta de leitura). Até
// conseguirmos o PNG completo, usamos esta versão vetorial nas cores oficiais
// (navy/sky/lime) — mesmo halo e proporções, fácil de trocar depois.
export default function Mascot({ className = '', floaty = false }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="absolute inset-[-25%] -z-10"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 50%, rgba(63,168,255,0.35) 0%, rgba(10,16,48,0) 70%)',
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className={`h-full w-full drop-shadow-[0_16px_24px_rgba(0,0,0,0.45)] ${
          floaty ? 'animate-[float_4s_ease-in-out_infinite]' : ''
        }`}
        role="img"
        aria-label="ROI, o mascote da Revi"
      >
        <defs>
          <linearGradient id="roiBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#56bbee" />
            <stop offset="100%" stopColor="#65f24b" />
          </linearGradient>
        </defs>
        <path d="M42 72 L72 18 L92 66 Z" fill="url(#roiBody)" />
        <path d="M158 72 L128 18 L108 66 Z" fill="url(#roiBody)" />
        <circle cx="100" cy="108" r="70" fill="url(#roiBody)" />
        <path d="M68 156 L100 192 L132 156 Z" fill="#05091f" opacity="0.85" />
        <circle cx="76" cy="102" r="10" fill="#05091f" />
        <circle cx="124" cy="102" r="10" fill="#05091f" />
        <path d="M90 132 Q100 141 110 132" stroke="#05091f" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

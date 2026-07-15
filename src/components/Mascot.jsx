// Placeholder do mascote ROE. Trocar por artwork final quando disponível —
// manter o mesmo componente/props pra não precisar tocar nas telas.
export default function Mascot({ className = '', pose = 'default' }) {
  return (
    <div className={`select-none ${className}`} data-pose={pose}>
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="ROE, a raposa mascote da Revi">
        <defs>
          <linearGradient id="roeBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1C7AFD" />
            <stop offset="100%" stopColor="#5EF750" />
          </linearGradient>
        </defs>
        <path d="M40 70 L70 20 L90 65 Z" fill="url(#roeBody)" />
        <path d="M160 70 L130 20 L110 65 Z" fill="url(#roeBody)" />
        <circle cx="100" cy="105" r="68" fill="url(#roeBody)" />
        <path d="M70 150 L100 185 L130 150 Z" fill="white" />
        <circle cx="78" cy="100" r="10" fill="#001149" />
        <circle cx="122" cy="100" r="10" fill="#001149" />
        <path d="M92 130 Q100 138 108 130" stroke="#001149" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

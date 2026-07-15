const VARIANTS = {
  primary: 'bg-lime-400 text-navy-950 shadow-glow-lime hover:brightness-105 active:brightness-95',
  secondary: 'bg-sky-500 text-white hover:brightness-105 active:brightness-95',
  outline: 'bg-transparent text-white border-[1.5px] border-white/20 hover:bg-white/6',
  ghost: 'bg-white/6 text-white hover:bg-white/10',
}

const SIZES = {
  md: 'px-7 py-4 text-xl',
  lg: 'px-10 py-5 text-2xl',
  kiosk: 'px-12 py-7 text-3xl',
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'kiosk',
  className = '',
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full font-sans font-semibold tracking-tight
        transition-all duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${SIZES[size]} ${VARIANTS[variant]} ${className}
      `}
    >
      {children}
    </button>
  )
}

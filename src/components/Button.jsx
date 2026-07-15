const VARIANTS = {
  primary: 'bg-electric text-navy hover:brightness-95 active:brightness-90',
  secondary: 'bg-crayola text-white hover:brightness-95 active:brightness-90',
  ghost: 'bg-transparent text-white border-2 border-white/40 hover:border-white',
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
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
        rounded-2xl px-10 py-6 text-3xl font-semibold font-sora
        transition-all duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-[0.97]
        ${VARIANTS[variant]} ${className}
      `}
    >
      {children}
    </button>
  )
}

import { useEffect, useState } from 'react'

// Fade + slide sutil de entrada (8-16px), no espírito do motion da Revi:
// suave, sem bounce, ease-out.
export default function ScreenTransition({ children, className = '' }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${className}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
    >
      {children}
    </div>
  )
}

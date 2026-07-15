import { useEffect, useRef } from 'react'

// Reinicia um timeout a cada toque/tecla; dispara `onIdle` quando o totem
// fica sem interação por `timeoutMs`. Desligado quando `enabled` é false.
export function useIdleTimer({ enabled, timeoutMs, onIdle }) {
  const timerRef = useRef(null)
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  useEffect(() => {
    if (!enabled) return undefined

    const reset = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onIdleRef.current(), timeoutMs)
    }

    const events = ['pointerdown', 'touchstart', 'keydown']
    events.forEach((evt) => window.addEventListener(evt, reset))
    reset()

    return () => {
      clearTimeout(timerRef.current)
      events.forEach((evt) => window.removeEventListener(evt, reset))
    }
  }, [enabled, timeoutMs])
}

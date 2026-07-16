import { useEffect, useState } from 'react'

// Anima um número inteiro subindo de 0 até `target` — usado nos números de
// resultado pra dar uma sensação mais viva/premium (spec: "métricas contam
// pra cima ao aparecer").
export function useCountUp(target, durationMs = 700) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / durationMs, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

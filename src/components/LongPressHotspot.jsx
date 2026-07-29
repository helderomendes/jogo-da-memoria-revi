import { useRef } from 'react'

// Área invisível de toque longo, usada como "atalho de operador" no totem
// (cliente não descobre). Segure pelo tempo definido pra disparar. Fixada num
// canto por padrão. Não interfere no toque normal (só reage a pressão longa).
export default function LongPressHotspot({
  onTrigger,
  holdMs = 1500,
  className = 'fixed right-0 top-0 h-24 w-24',
}) {
  const timer = useRef(null)

  const start = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(onTrigger, holdMs)
  }
  const cancel = () => clearTimeout(timer.current)

  return (
    <div
      aria-hidden
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      className={`z-[60] ${className}`}
      style={{ touchAction: 'none' }}
    />
  )
}

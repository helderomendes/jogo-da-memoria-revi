import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import PrizeMedia from './PrizeMedia'

// Roleta de brinde estilo "case opening": uma fita horizontal de fotos que
// rola rápido da direita pra esquerda e desacelera até parar com o brinde
// sorteado centralizado no crop circular do ponteiro.
const SLOT = 150 // largura de cada célula da fita (px)
const ITEM = 128 // diâmetro do círculo de cada foto (px)
const REEL_LEN = 44 // total de itens na fita
const TARGET_INDEX = 38 // posição do brinde ganho (perto do fim, deixa espaço pra frear)
const SPIN_MS = 4200 // duração do giro

export default function PrizeWheel({ pool, target, onDone }) {
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const [offset, setOffset] = useState(0)

  // Fita: itens aleatórios do pool com o brinde ganho fixo em TARGET_INDEX.
  const reel = useMemo(() => {
    const source = pool.length ? pool : [target]
    return Array.from({ length: REEL_LEN }, (_, i) => {
      if (i === TARGET_INDEX) return target
      return source[Math.floor(Math.random() * source.length)]
    })
  }, [pool, target])

  // Calcula o deslocamento final que centraliza o alvo sob o ponteiro e dispara
  // a transição no próximo frame (garante que o browser anime do 0 até lá).
  useLayoutEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth ?? 0
    const targetCenter = TARGET_INDEX * SLOT + SLOT / 2
    const finalX = containerWidth / 2 - targetCenter
    const raf = requestAnimationFrame(() => setOffset(finalX))
    const done = setTimeout(onDone, SPIN_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl overflow-hidden py-6">
      {/* Máscara de esmaecimento nas bordas pra dar sensação de profundidade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-navy-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-navy-900 to-transparent" />

      {/* Ponteiro central: anel circular que emoldura o brinde selecionado */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-lime-400 shadow-glow-lime"
        style={{ width: ITEM + 16, height: ITEM + 16 }}
      />

      <div
        ref={trackRef}
        className="flex items-center will-change-transform"
        style={{
          transform: `translateX(${offset}px)`,
          transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.16, 1)`,
        }}
      >
        {reel.map((tier, i) => (
          <div key={i} className="flex shrink-0 items-center justify-center" style={{ width: SLOT }}>
            <PrizeMedia tier={tier} size={ITEM} tone="neutral" ring={false} className="opacity-90" />
          </div>
        ))}
      </div>
    </div>
  )
}

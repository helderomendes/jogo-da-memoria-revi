import { useEffect, useState } from 'react'
import { Gift, Grid3x3, Sparkles, Timer } from 'lucide-react'
import { useKiosk } from '../context/KioskContext'
import { DEFAULT_CARDS } from '../data/cards'
import { getCards, getPrizeTiers } from '../utils/dataStore'
import { availableChoicePrizes, wheelPrizes } from '../utils/prizeModes'
import Logo from '../components/Logo'
import Chip from '../components/Chip'
import faviconUrl from '../assets/favicon.svg'

// Cartas presas na roda e o tempo de uma volta completa. O raio (--r) define o
// tamanho do círculo; o centro fica logo abaixo do rodapé, então só o arco de
// cima aparece — os cards entram por um lado, cruzam o topo e descem no outro.
const DECK_SIZE = 12
const SPIN_SECONDS = 40
const WHEEL_RADIUS = 'clamp(260px, 30vh, 520px)'
// Horizontal (TV): roda maior, com o centro fora da tela à direita — só o arco
// da esquerda aparece e as cartas descem de cima pra baixo pela metade direita.
const WHEEL_RADIUS_LANDSCAPE = 'clamp(340px, 46vh, 640px)'
// Menos cartas na roda horizontal: o arco visível é vertical e mais curto.
const DECK_SIZE_LANDSCAPE = 8

// Partículas fixas (sem random em runtime) — brilham em loop.
const SPARKLES = [
  { top: '12%', left: '14%', size: 5, delay: '0s', dur: '3.4s' },
  { top: '22%', left: '82%', size: 4, delay: '0.8s', dur: '4.1s' },
  { top: '38%', left: '8%', size: 3, delay: '1.5s', dur: '3.8s' },
  { top: '9%', left: '58%', size: 3, delay: '0.4s', dur: '4.6s' },
  { top: '30%', left: '92%', size: 5, delay: '2.1s', dur: '3.2s' },
  { top: '46%', left: '72%', size: 3, delay: '1.1s', dur: '4.3s' },
  { top: '18%', left: '38%', size: 4, delay: '2.6s', dur: '3.9s' },
]

// Spotlights borrados espalhados pelo fundo — derivam sozinhos, sem interação.
// Poucos e grandes: blur-3xl animado é caro em GPU de tablet, então mantemos
// só 3 pra dar o clima sem travar.
const SPOTLIGHTS = [
  { top: '-6%', left: '8%', size: '46vh', color: 'rgba(30,134,230,0.45)', dur: '13s', delay: '0s' },
  { top: '4%', left: '64%', size: '40vh', color: 'rgba(86,187,238,0.38)', dur: '16s', delay: '1.5s' },
  { top: '46%', left: '34%', size: '44vh', color: 'rgba(30,134,230,0.30)', dur: '14s', delay: '1s' },
]

// Tons de card — todos no azul da marca, com acentos sky/lime.
const CARD_TINTS = [
  'linear-gradient(155deg, #1b2566 0%, #1e86e6 130%)',
  'linear-gradient(155deg, #121a46 0%, #2a3687 120%)',
  'linear-gradient(155deg, #1b2566 0%, #32c700 150%)',
  'linear-gradient(155deg, #0a1030 0%, #56bbee 140%)',
  'linear-gradient(155deg, #1b2566 0%, #3e4bb0 120%)',
]

// Uma carta fixada no aro da roda. `rotate(slot)` a posiciona na circunferência
// e a alinha radialmente; a rotação contínua da roda leva todas ao redor. O
// wrapper interno pulsa escala/opacidade em sincronia com o giro (profundidade),
// com o pico no ângulo `peakAngle` (0 = topo, 270 = ponto mais à esquerda).
// `upright`: contra-gira a carta pra ela ficar sempre em pé (layout horizontal).
function WheelCard({ card, tint, index, radius, peakAngle = 0, upright = false, sizeClass, deckSize = DECK_SIZE }) {
  const slot = index * (360 / deckSize)
  const phase = (((slot - peakAngle) % 360) + 360) % 360
  const depthDelay = `-${((phase / 360) * SPIN_SECONDS).toFixed(2)}s`
  // Contra-giro: começa em -slot e gira -360° por volta, cancelando a roda.
  const counterDelay = `-${((slot / 360) * SPIN_SECONDS).toFixed(2)}s`
  const hasImage = card.mode === 'image' && card.image
  const face = (
    <div
      style={hasImage ? undefined : { backgroundImage: tint }}
      className={`relative flex flex-col items-center justify-between overflow-hidden rounded-[clamp(16px,2.2vw,30px)] border border-white/12 text-center shadow-card aspect-[4/5] ${sizeClass}`}
    >
      {hasImage ? (
        <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-between p-[clamp(8px,1.2vw,16px)]">
          <img src={faviconUrl} alt="" className="relative w-[26%] opacity-75" />
          <p className="relative font-semibold leading-tight text-[clamp(0.62rem,1.7vw,1.05rem)] text-ink-100">
            {card.text}
          </p>
        </div>
      )}
      {/* brilho superior (glassmorfismo) — por cima da capa também */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/18 to-transparent" />
    </div>
  )
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{ transform: `translate(-50%, -50%) rotate(${slot}deg) translateY(calc(-1 * ${radius}))` }}
    >
      <div
        className="animate-[depthPulse_linear_infinite]"
        style={{ animationDuration: `${SPIN_SECONDS}s`, animationDelay: depthDelay }}
      >
        {upright ? (
          <div
            className="animate-[counterSpin_linear_infinite]"
            style={{ animationDuration: `${SPIN_SECONDS}s`, animationDelay: counterDelay }}
          >
            {face}
          </div>
        ) : (
          face
        )}
      </div>
    </div>
  )
}

// Roda decorativa na faixa inferior (os ~40% que não recebem interação).
function WheelDeck({ deck }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[52vh] overflow-hidden">
      {/* "holofote" atrás do topo — destaca a carta que passa no ponto mais alto */}
      <div
        className="absolute left-1/2 h-[24vh] w-[40vh] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ bottom: '18vh', background: 'radial-gradient(circle, rgba(101,242,75,0.4) 0%, transparent 70%)' }}
      />
      <div
        className="absolute left-1/2 animate-[wheelSpin_linear_infinite]"
        style={{
          width: `calc(2 * ${WHEEL_RADIUS})`,
          height: `calc(2 * ${WHEEL_RADIUS})`,
          bottom: `calc(-12vh - ${WHEEL_RADIUS})`,
          transformOrigin: '50% 50%',
          animationDuration: `${SPIN_SECONDS}s`,
        }}
      >
        {Array.from({ length: DECK_SIZE }, (_, i) => (
          <WheelCard
            key={i}
            index={i}
            radius={WHEEL_RADIUS}
            sizeClass="w-[clamp(160px,20vw,300px)]"
            card={deck[i % deck.length]}
            tint={CARD_TINTS[i % CARD_TINTS.length]}
          />
        ))}
      </div>
    </div>
  )
}

// Horizontal (TV): roda na metade direita. O centro fica à direita, perto da
// borda, e as cartas passam pelo arco esquerdo — sempre em pé — com o pico de
// profundidade no ponto mais à esquerda (o mais próximo do título).
function WheelDeckLandscape({ deck }) {
  const R = WHEEL_RADIUS_LANDSCAPE
  // Máscaras (em vez de overlay escuro): esmaecem só as cartas, sem "recortar"
  // o fundo — em cima/embaixo e na borda direita.
  const fadeY = 'linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)'
  const fadeX = 'linear-gradient(to right, black 60%, transparent 100%)'
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[54vw] overflow-hidden"
      style={{ maskImage: fadeY, WebkitMaskImage: fadeY }}
    >
      <div className="absolute inset-0" style={{ maskImage: fadeX, WebkitMaskImage: fadeX }}>
        <div
          className="absolute top-1/2 h-[46vh] w-[36vh] -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            right: `calc(${R} - 2vw)`,
            background: 'radial-gradient(circle, rgba(101,242,75,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 animate-[wheelSpinY_linear_infinite]"
          style={{
            width: `calc(2 * ${R})`,
            height: `calc(2 * ${R})`,
            right: `calc(-1 * ${R} + 14vw)`,
            transformOrigin: '50% 50%',
            animationDuration: `${SPIN_SECONDS}s`,
          }}
        >
          {Array.from({ length: DECK_SIZE_LANDSCAPE }, (_, i) => (
            <WheelCard
              key={i}
              index={i}
              deckSize={DECK_SIZE_LANDSCAPE}
              radius={R}
              peakAngle={270}
              upright
              sizeClass="w-[clamp(170px,13vw,280px)]"
              card={deck[i % deck.length]}
              tint={CARD_TINTS[i % CARD_TINTS.length]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Camadas de fundo (spotlights, grade de pontos, brilhos). `vignette` escurece
// a faixa inferior — o "horizonte" da roda no layout vertical.
function BackgroundLayers({ vignette = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {/* spotlights borrados espalhados, derivando devagar */}
      {SPOTLIGHTS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl animate-[blobDrift_ease-in-out_infinite]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
            animationDuration: s.dur,
            animationDelay: s.delay,
            animationDirection: i % 2 ? 'reverse' : 'normal',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-dot-grid opacity-70" />
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-sky-400 animate-[twinkle_ease-in-out_infinite]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: s.dur,
            animationDelay: s.delay,
            boxShadow: '0 0 8px 1px rgba(124,198,255,0.8)',
          }}
        />
      ))}
      {/* vinheta inferior — o "horizonte" onde as cartas se põem */}
      {vignette && (
        <div
          className="absolute inset-x-0 bottom-0 h-[48%]"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, #070c22 72%, #05091f 100%)' }}
        />
      )}
    </div>
  )
}

export default function IdleScreen() {
  const { startRegistration, isLandscape, config } = useKiosk()
  const [cards, setCards] = useState(DEFAULT_CARDS)
  const [tiers, setTiers] = useState(null)

  useEffect(() => {
    getCards().then((data) => {
      if (data?.length) setCards(data)
    })
    getPrizeTiers().then(setTiers)
  }, [])

  const isChoice = config.prizeMode === 'choice'
  const choiceOptions = availableChoicePrizes(tiers)
  const prizeCount = isChoice ? choiceOptions.length || 3 : wheelPrizes(tiers).length || 3

  // Baralho da roda: prioriza cards com capa (pra as imagens aparecerem),
  // depois completa com os demais. Cai no DEFAULT_CARDS enquanto carrega.
  const withImage = cards.filter((c) => c.mode === 'image' && c.image)
  const withoutImage = cards.filter((c) => !(c.mode === 'image' && c.image))
  const deck = [...withImage, ...withoutImage]

  const chips = (
    <>
      <Chip icon={Grid3x3} label="pares" value={String(config.pairsPerGame)} />
      <Chip icon={Timer} label="tempo" value={`${config.guessSeconds}s`} tone="sky" />
      <Chip icon={Gift} label={isChoice ? 'prêmios à escolha' : 'prêmios'} value={String(prizeCount)} tone="lime" />
    </>
  )

  const subtitle = isChoice ? (
    <>
      Encontre os pares e <span className="text-lime-400">escolha seu prêmio</span>!
    </>
  ) : (
    <>
      Encontre os pares e <span className="text-lime-400">ganhe brindes</span> na hora!
    </>
  )

  if (isLandscape) {
    return (
      <button
        type="button"
        onClick={startRegistration}
        className="relative flex h-full min-h-full w-full overflow-hidden bg-revi-gradient text-left"
      >
        <BackgroundLayers />
        <WheelDeckLandscape deck={deck} />

        {/* Conteúdo à esquerda (~50% da largura), alinhado à esquerda */}
        <div className="relative z-10 flex h-full w-[54vw] flex-col px-[5vw] py-[6vh]">
          <Logo className="h-[clamp(2.4rem,3.6vw,4rem)] shrink-0 self-start" />

          <div className="flex flex-1 flex-col items-start justify-center gap-[clamp(1rem,3vh,2.2rem)]">
            <span className="flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-[clamp(0.75rem,0.9vw,1rem)] font-semibold uppercase tracking-[0.2em] text-lime-300 backdrop-blur-sm">
              <Sparkles size={14} /> apresenta{config.eventName ? ` · ${config.eventName}` : ''}
            </span>

            <h1 className="text-[clamp(4rem,8.4vw,10rem)] font-extrabold uppercase leading-[0.88] tracking-tight">
              <span className="block text-white">Jogo da</span>
              <span
                className="block bg-gradient-to-r from-lime-300 via-lime-400 to-sky-400 bg-clip-text text-transparent animate-[titleShine_5s_ease-in-out_infinite]"
                style={{ backgroundSize: '200% 100%' }}
              >
                Memória
              </span>
            </h1>

            <p className="max-w-[40vw] text-[clamp(1.4rem,2.3vw,2.8rem)] font-bold leading-tight text-white">
              {subtitle}
            </p>

            {isChoice && choiceOptions.length > 0 && (
              <p className="text-[clamp(1rem,1.4vw,1.6rem)] font-semibold text-ink-200">
                {choiceOptions.map((t) => t.label).join(' · ')}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">{chips}</div>

            <div className="mt-1 rounded-full bg-lime-400 px-[clamp(2.5rem,4vw,4.5rem)] py-[clamp(1rem,2.2vh,1.8rem)] text-[clamp(1.3rem,1.9vw,2.4rem)] font-bold text-navy-950 animate-[pulseGlow_2.2s_ease-in-out_infinite]">
              Toque para jogar
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={startRegistration}
      className="relative flex min-h-full w-full flex-col items-center overflow-hidden bg-revi-gradient text-center"
    >
      <BackgroundLayers vignette />

      {/* roda giratória na faixa inferior (atrás do conteúdo) */}
      <WheelDeck deck={deck} />

      {/* --- Conteúdo: concentrado nos ~58% superiores --- */}
      <div className="relative z-10 flex h-[58vh] min-h-[480px] w-full flex-col items-center px-6 pt-[4vh]">
        <Logo className="h-[clamp(2.6rem,5vw,4rem)] shrink-0" />

        <div className="flex flex-1 flex-col items-center justify-center gap-[clamp(0.8rem,2.4vh,1.8rem)]">
          <span className="flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300 backdrop-blur-sm">
            <Sparkles size={13} /> apresenta
          </span>

          <h1 className="text-[clamp(3.4rem,11vw,8rem)] font-extrabold uppercase leading-[0.9] tracking-tight">
            <span className="block text-white">Jogo da</span>
            <span
              className="block bg-gradient-to-r from-lime-300 via-lime-400 to-sky-400 bg-clip-text text-transparent animate-[titleShine_5s_ease-in-out_infinite]"
              style={{ backgroundSize: '200% 100%' }}
            >
              Memória
            </span>
          </h1>

          <p className="max-w-2xl text-[clamp(1.3rem,3vw,2.4rem)] font-bold leading-tight text-white">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {chips}
          </div>

          <div className="mt-1 rounded-full bg-lime-400 px-[clamp(2.5rem,6vw,4rem)] py-[clamp(1rem,2vh,1.6rem)] text-[clamp(1.3rem,2.6vw,2rem)] font-bold text-navy-950 animate-[pulseGlow_2.2s_ease-in-out_infinite]">
            Toque para jogar
          </div>
        </div>
      </div>
    </button>
  )
}

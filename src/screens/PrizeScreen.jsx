import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { claimChoicePrize, getPrizeTiers } from '../utils/dataStore'
import { availableChoicePrizes, wheelPrizes } from '../utils/prizeModes'
import { generatePickupCode } from '../utils/gameEngine'
import Button from '../components/Button'
import KioskScreen, { LandscapeAside, LandscapeLead } from '../components/KioskScreen'
import GlassPanel from '../components/GlassPanel'
import PrizeMedia from '../components/PrizeMedia'
import PrizeWheel from '../components/PrizeWheel'

// Tela de prêmio. Dois modelos de premiação (game_config.prizeMode):
//   'wheel'  → roleta sorteia o brinde da faixa (já decidido no fim do jogo).
//   'choice' → o jogador escolhe 1 entre as opções disponíveis.
export default function PrizeScreen() {
  const { session } = useKiosk()
  return session.prizeMode === 'choice' ? <ChoicePrize /> : <WheelPrize />
}

function WheelPrize() {
  const { session, isLandscape } = useKiosk()
  const { prizeTier } = session
  const [tiers, setTiers] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    getPrizeTiers().then((all) => setTiers(wheelPrizes(all)))
  }, [])

  const firstName = session.name.split(' ')[0]

  // Fase 1 — mistério: a roleta gira as fotos até parar no brinde sorteado.
  if (!revealed) {
    return (
      <KioskScreen contentClassName={isLandscape ? 'flex-col justify-center !gap-[4vh]' : ''}>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
          Sorteando seu <span className="text-lime-400">brinde</span>...
        </h1>
        <p className="text-lg lg:text-2xl text-ink-300">Boa sorte, {firstName}!</p>

        {tiers ? (
          <PrizeWheel pool={tiers} target={prizeTier} onDone={() => setRevealed(true)} />
        ) : (
          <p className="text-ink-300">Preparando a roleta...</p>
        )}
      </KioskScreen>
    )
  }

  return <PrizeReveal tier={prizeTier} />
}

function ChoicePrize() {
  const { session, confirmChoice, isLandscape } = useKiosk()
  const [options, setOptions] = useState(null)
  const [claiming, setClaiming] = useState(null)

  useEffect(() => {
    getPrizeTiers().then((all) => setOptions(availableChoicePrizes(all)))
  }, [])

  const firstName = session.name.split(' ')[0]

  // Já escolheu → revelação com o código de retirada.
  if (session.prizeTier) return <PrizeReveal tier={session.prizeTier} />

  const handlePick = async (tier) => {
    if (claiming) return
    setClaiming(tier.id)
    const claimed = await claimChoicePrize(tier)
    confirmChoice(claimed ?? tier, generatePickupCode())
  }

  const grid = options ? (
    options.length ? (
      <div
        className={`grid w-full gap-[clamp(1rem,2vw,2.5rem)] ${
          isLandscape ? '' : 'grid-cols-1'
        }`}
        style={isLandscape ? { gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` } : undefined}
      >
        {options.map((tier, i) => (
          <button
            key={tier.id}
            type="button"
            onClick={() => handlePick(tier)}
            disabled={!!claiming}
            style={{ animationDelay: `${i * 90}ms` }}
            className={`group flex items-center rounded-[32px] border text-left transition-all duration-150 active:scale-[0.97] disabled:opacity-60 animate-[cardIn_0.45s_ease-out_backwards] ${
              claiming === tier.id
                ? 'border-lime-400 bg-lime-400/15 shadow-glow-lime'
                : 'border-white/12 bg-white/6 hover:border-lime-400/60'
            } ${isLandscape ? 'flex-col gap-[3vh] px-[2vw] py-[5vh] text-center' : 'gap-5 px-5 py-4'}`}
          >
            <PrizeMedia tier={tier} size={isLandscape ? 'clamp(140px, 13vw, 260px)' : 88} />
            <div className={isLandscape ? 'flex flex-col items-center gap-2' : ''}>
              <p
                className={`font-extrabold tracking-tight text-white ${
                  isLandscape ? 'text-[clamp(1.8rem,2.8vw,3.4rem)]' : 'text-2xl'
                }`}
              >
                {tier.label}
              </p>
              {tier.description && (
                <p className={`text-ink-200 ${isLandscape ? 'text-[clamp(1rem,1.3vw,1.6rem)]' : 'text-base'}`}>
                  {tier.description}
                </p>
              )}
            </div>
            {isLandscape && (
              <span className="mt-auto rounded-full bg-lime-400 px-8 py-3 text-[clamp(1rem,1.4vw,1.6rem)] font-bold text-navy-950">
                {claiming === tier.id ? 'Confirmando...' : 'Quero esse'}
              </span>
            )}
          </button>
        ))}
      </div>
    ) : (
      <p className="text-xl text-ink-300">Os brindes acabaram — procure a equipe da Revi.</p>
    )
  ) : (
    <p className="text-ink-300">Carregando opções...</p>
  )

  if (isLandscape) {
    return (
      <KioskScreen contentClassName="flex-col justify-center !gap-[5vh]">
        <div className="w-full text-left">
          <h1 className="text-[clamp(2.6rem,4.6vw,5.6rem)] font-extrabold leading-[0.95] tracking-tight">
            Escolha seu <span className="text-lime-400">prêmio</span>, {firstName}!
          </h1>
          <p className="mt-[1.5vh] text-[clamp(1.2rem,1.8vw,2.2rem)] text-ink-200">Toque em uma das opções.</p>
        </div>
        {grid}
      </KioskScreen>
    )
  }

  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Escolha seu <span className="text-lime-400">prêmio</span>!
      </h1>
      <p className="text-lg text-ink-300">Toque em uma das opções, {firstName}.</p>
      {grid}
    </KioskScreen>
  )
}

// Revelação: o brinde ganho num crop circular grande, com glow, + código.
function PrizeReveal({ tier }) {
  const { session, goToThanks, isLandscape } = useKiosk()
  const { pickupCode } = session
  const firstName = session.name.split(' ')[0]

  const media = (size) => (
    <div className="animate-[pop_0.5s_ease-out_backwards]">
      <PrizeMedia tier={tier} size={size} className="animate-[pulseGlow_2.2s_ease-in-out_infinite]" />
    </div>
  )

  const button = (
    <Button onClick={goToThanks} className="w-full">
      Concluir
    </Button>
  )

  if (isLandscape) {
    return (
      <KioskScreen>
        <LandscapeLead>
          <h1 className="text-[clamp(3rem,5.4vw,6.4rem)] font-extrabold leading-[0.95] tracking-tight">
            Parabéns, <span className="text-lime-400">{firstName}</span>!
          </h1>
          <div className="flex items-center gap-[2.5vw]">
            {media('clamp(160px, 14vw, 280px)')}
            <div>
              <p className="text-[clamp(2rem,3.4vw,4rem)] font-extrabold leading-tight text-lime-400">{tier?.label}</p>
              <p className="max-w-[28vw] text-[clamp(1.1rem,1.5vw,1.8rem)] text-ink-100">{tier?.description}</p>
            </div>
          </div>
        </LandscapeLead>
        <LandscapeAside className="max-w-[38%]">
          <GlassPanel className="flex flex-col items-center gap-[2vh] px-8 py-[5vh] text-center">
            <p className="text-[clamp(1.1rem,1.6vw,2rem)] text-ink-300">Apresente esse código no balcão</p>
            <p className="text-[clamp(3rem,5.2vw,6.5rem)] font-extrabold leading-none tracking-widest text-sky-400">
              {pickupCode}
            </p>
          </GlassPanel>
          {button}
        </LandscapeAside>
      </KioskScreen>
    )
  }

  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Parabéns, <span className="text-lime-400">{firstName}</span>!
      </h1>

      <GlassPanel className="flex w-full flex-col items-center gap-3 px-8 py-8">
        {media(168)}
        <p className="mt-2 text-2xl font-bold text-lime-400">{tier?.label}</p>
        <p className="max-w-sm text-lg text-ink-100">{tier?.description}</p>
      </GlassPanel>

      <div className="space-y-2">
        <p className="text-lg text-ink-300">Apresente esse código no balcão</p>
        <p className="text-6xl font-extrabold tracking-widest text-sky-400">{pickupCode}</p>
      </div>

      {button}
    </KioskScreen>
  )
}

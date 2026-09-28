import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getPrizeTiers } from '../utils/dataStore'
import { minPairsToWin } from '../utils/prizeModes'
import { useCountUp } from '../utils/useCountUp'
import Button from '../components/Button'
import KioskScreen, { LandscapeAside, LandscapeLead } from '../components/KioskScreen'
import GlassPanel from '../components/GlassPanel'

export default function ResultScreen() {
  const { session, config, goToPrize, resetToIdle, isLandscape } = useKiosk()
  const { correctPairs, isWin } = session
  const [tiers, setTiers] = useState([])
  const displayedCount = useCountUp(correctPairs)
  const totalChances = config.totalChances
  const isChoice = session.prizeMode === 'choice'

  useEffect(() => {
    getPrizeTiers().then(setTiers)
  }, [])

  const minWinPairs = minPairsToWin(config, tiers)
  const firstName = session.name.split(' ')[0]

  if (!isWin) {
    const message =
      correctPairs > 0
        ? `Você fechou ${correctPairs} ${correctPairs === 1 ? 'par' : 'pares'}. Feche ${minWinPairs} ${minWinPairs === 1 ? 'par' : 'pares'} ou mais pra ${
            isChoice ? 'escolher seu prêmio' : 'ganhar um brinde surpresa'
          }!`
        : `Você usou suas ${totalChances ?? 6} chances e não fechou nenhum par dessa vez.`
    const title = (
      <>
        Quase, <span className="text-sky-400">{firstName}</span>!
      </>
    )
    const button = (
      <Button onClick={resetToIdle} className="w-full">
        Tentar de novo
      </Button>
    )

    if (isLandscape) {
      return (
        <KioskScreen>
          <LandscapeLead>
            <h1 className="text-[clamp(3rem,5.4vw,6.4rem)] font-extrabold leading-[0.95] tracking-tight">{title}</h1>
            <p className="text-[clamp(1.4rem,2.2vw,2.6rem)] font-bold leading-tight text-ink-100">{message}</p>
            <p className="text-[clamp(1.1rem,1.6vw,2rem)] text-ink-300">Bora tentar de novo?</p>
          </LandscapeLead>
          <LandscapeAside className="max-w-[40%]">
            <ScorePanel count={displayedCount} total={totalChances} tone="sky" />
            {button}
          </LandscapeAside>
        </KioskScreen>
      )
    }

    return (
      <KioskScreen>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{title}</h1>

        <GlassPanel className="flex w-full flex-col items-center gap-5 px-8 py-10">
          <p className="text-xl text-ink-100">{message}</p>
          <p className="text-lg text-ink-300">Bora tentar de novo?</p>
        </GlassPanel>

        {button}
      </KioskScreen>
    )
  }

  const winButton = (
    <Button onClick={goToPrize} className="w-full">
      {isChoice ? 'Escolher meu prêmio' : 'Ver meu prêmio'}
    </Button>
  )

  if (isLandscape) {
    return (
      <KioskScreen>
        <LandscapeLead>
          <h1 className="text-[clamp(3rem,5.4vw,6.4rem)] font-extrabold leading-[0.95] tracking-tight">
            Mandou bem, <span className="text-lime-400">{firstName}</span>!
          </h1>
          <p className="text-[clamp(1.4rem,2.2vw,2.6rem)] font-bold leading-tight text-ink-100">
            {isChoice ? 'Você garantiu um prêmio. Agora é só escolher!' : 'Você garantiu um brinde!'}
          </p>
        </LandscapeLead>
        <LandscapeAside className="max-w-[40%]">
          <ScorePanel count={displayedCount} total={totalChances} tone="lime" />
          {winButton}
        </LandscapeAside>
      </KioskScreen>
    )
  }

  return (
    <KioskScreen>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Resultado de <span className="text-lime-400">{firstName}</span>
      </h1>

      <GlassPanel className="flex w-full flex-col items-center gap-4 px-10 py-10">
        <div className="text-8xl font-extrabold tracking-tight animate-[pop_0.5s_ease-out_backwards]">
          <span className="text-lime-400">{displayedCount}</span>
          <span className="text-ink-300"> / {totalChances ?? '-'}</span>
        </div>
        <p className="text-xl text-ink-100">pares certos</p>
      </GlassPanel>

      {winButton}
    </KioskScreen>
  )
}

function ScorePanel({ count, total, tone }) {
  return (
    <GlassPanel className="flex w-full flex-col items-center gap-3 px-10 py-[5vh]">
      <div className="text-[clamp(5rem,10vw,12rem)] font-extrabold leading-none tracking-tight animate-[pop_0.5s_ease-out_backwards]">
        <span className={tone === 'lime' ? 'text-lime-400' : 'text-sky-400'}>{count}</span>
        <span className="text-ink-300"> / {total ?? '-'}</span>
      </div>
      <p className="text-[clamp(1.2rem,1.8vw,2.2rem)] text-ink-100">pares certos</p>
    </GlassPanel>
  )
}

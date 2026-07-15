import { useEffect, useState } from 'react'
import { useKiosk } from '../context/KioskContext'
import { getCards, getGameConfig, getPairHistory, pushPairHistory } from '../utils/dataStore'
import { selectPairsForNewGame } from '../utils/gameEngine'
import Button from '../components/Button'
import Mascot from '../components/Mascot'

export default function InstructionsScreen() {
  const { session, startGame } = useKiosk()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getGameConfig().then(setConfig)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    const [cards, gameConfig, history] = await Promise.all([
      getCards(),
      getGameConfig(),
      getPairHistory(),
    ])

    const { pairs, usedFullPool } = selectPairsForNewGame(cards, history, gameConfig.pairsPerGame)
    await pushPairHistory(pairs.map((p) => p.id), gameConfig.antiRepeatLastGames)

    startGame({ pairs, totalPairs: pairs.length, usedFullPool })
  }

  if (!config) return null

  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-navy px-8 py-12 text-center text-white">
      <h1 className="font-headline text-4xl">
        Oi, <span className="text-electric">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-40 w-40" />
        <div className="space-y-4 text-xl text-white/85 max-w-md">
          <p>
            O tabuleiro vai aparecer com todas as cartas viradas por{' '}
            <strong className="text-electric">{config.memorizeSeconds} segundos</strong>. Preste
            atenção nas posições.
          </p>
          <p>Depois as cartas viram pra baixo e você toca pra formar os pares.</p>
          <p>
            Você tem até <strong className="text-crayola">{config.maxAttempts} tentativas</strong>{' '}
            pra fechar todos os pares.
          </p>
        </div>
      </div>

      <Button onClick={handleStart} disabled={loading} className="w-full max-w-md">
        {loading ? 'Preparando...' : 'Começar jogo'}
      </Button>
    </div>
  )
}

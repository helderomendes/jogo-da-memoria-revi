import { useKiosk } from '../context/KioskContext'
import Button from '../components/Button'
import Mascot from '../components/Mascot'

export default function PrizeScreen() {
  const { session, goToThanks } = useKiosk()
  const { prizeTier, pickupCode } = session

  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-revi-gradient px-8 py-14 text-center text-white">
      <h1 className="text-4xl font-bold tracking-tight">
        Parabéns, <span className="text-lime-400">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-40 w-40" />
        <div className="rounded-[28px] border border-white/8 bg-white/4 px-8 py-6 shadow-card">
          <p className="text-2xl font-bold text-lime-400">{prizeTier?.label}</p>
          <p className="mt-2 max-w-sm text-lg text-ink-100">{prizeTier?.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-lg text-ink-300">Apresente esse código no balcão</p>
          <p className="text-6xl font-extrabold tracking-widest text-sky-400">{pickupCode}</p>
        </div>
      </div>

      <Button onClick={goToThanks} className="w-full max-w-md">
        Concluir
      </Button>
    </div>
  )
}

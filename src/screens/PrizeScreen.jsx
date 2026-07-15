import { useKiosk } from '../context/KioskContext'
import Button from '../components/Button'
import Mascot from '../components/Mascot'

export default function PrizeScreen() {
  const { session, goToThanks } = useKiosk()
  const { prizeTier, pickupCode } = session

  return (
    <div className="flex h-full w-full flex-col items-center justify-between bg-navy px-8 py-14 text-center text-white">
      <h1 className="font-headline text-4xl">
        Parabéns, <span className="text-electric">{session.name.split(' ')[0]}</span>!
      </h1>

      <div className="flex flex-col items-center gap-6">
        <Mascot className="h-40 w-40" />
        <div className="rounded-2xl bg-white/10 px-8 py-6">
          <p className="text-2xl font-bold text-electric">{prizeTier?.label}</p>
          <p className="mt-2 max-w-sm text-lg text-white/75">{prizeTier?.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-lg text-white/70">Apresente esse código no balcão</p>
          <p className="text-6xl font-extrabold tracking-widest text-crayola">{pickupCode}</p>
        </div>
      </div>

      <Button onClick={goToThanks} className="w-full max-w-md">
        Concluir
      </Button>
    </div>
  )
}

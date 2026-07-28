import { useCallback, useEffect, useState } from 'react'
import { getCards, getGameConfig, getPrizeTiers, getPendingCount, syncPending } from './dataStore'

// Orquestra o modo offline do totem:
//  - aquece o cache (cartas/config/brindes) no boot, pra sobreviver a uma queda;
//  - sincroniza a fila pendente ao abrir e sempre que a internet volta;
//  - expõe {online, pending} pra UI mostrar o status.
export function useOfflineSync() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [pending, setPending] = useState(() => getPendingCount())

  const runSync = useCallback(async () => {
    const left = await syncPending()
    setPending(left)
  }, [])

  useEffect(() => {
    // Aquece o cache local — se a internet cair depois, o jogo segue rodando.
    Promise.allSettled([getCards(), getGameConfig(), getPrizeTiers()])
    runSync()

    const handleOnline = () => {
      setOnline(true)
      runSync()
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // A fila cresce fora do React (ao fim de partidas offline); reflete no badge.
    const poll = setInterval(() => setPending(getPendingCount()), 4000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(poll)
    }
  }, [runSync])

  return { online, pending }
}

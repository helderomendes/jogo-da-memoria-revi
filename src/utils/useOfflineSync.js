import { useCallback, useEffect, useState } from 'react'
import {
  getCards,
  getGameConfig,
  getPrizeTiers,
  getPendingCount,
  syncPending,
  prefetchAllMedia,
} from './dataStore'

// Pré-baixa as imagens só depois que o Service Worker controla a página — antes
// disso o fetch não passaria pelo SW e não entraria no cache persistente.
async function prefetchMediaWhenSWReady() {
  try {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready
      // Em primeiríssima visita o SW pode ainda não controlar esta página;
      // nesse caso o prefetch da próxima carga (já controlada) resolve.
    }
    // Pede armazenamento persistente pra o cache não ser despejado pelo navegador.
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {})
    await prefetchAllMedia()
  } catch {
    /* sem SW/rede: ignora, tenta de novo no próximo boot */
  }
}

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
    // Pré-baixa TODAS as imagens (cards + brindes) pro cache persistente do SW.
    prefetchMediaWhenSWReady()
    runSync()

    const handleOnline = () => {
      setOnline(true)
      runSync()
      // Reconectou: garante que qualquer imagem nova também entre no cache.
      prefetchMediaWhenSWReady()
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

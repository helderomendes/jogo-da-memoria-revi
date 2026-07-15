import { createContext, useCallback, useContext, useState } from 'react'

export const SCREENS = {
  IDLE: 'idle',
  REGISTER: 'register',
  INSTRUCTIONS: 'instructions',
  GAME: 'game',
  RESULT: 'result',
  PRIZE: 'prize',
  THANKS: 'thanks',
}

const KioskContext = createContext(null)

const emptySession = () => ({
  name: '',
  phone: '',
  startedAt: null,
  pairs: [],
  usedFullPool: false,
  attempts: [],
  bestMatches: 0,
  totalPairs: 0,
  prizeTier: null,
  pickupCode: null,
})

export function KioskProvider({ children }) {
  const [screen, setScreen] = useState(SCREENS.IDLE)
  const [session, setSession] = useState(emptySession)

  const resetToIdle = useCallback(() => {
    setSession(emptySession())
    setScreen(SCREENS.IDLE)
  }, [])

  const startRegistration = useCallback(() => {
    setSession(emptySession())
    setScreen(SCREENS.REGISTER)
  }, [])

  const submitRegistration = useCallback(({ name, phone }) => {
    setSession((prev) => ({ ...prev, name, phone, startedAt: Date.now() }))
    setScreen(SCREENS.INSTRUCTIONS)
  }, [])

  const startGame = useCallback((gameSetup) => {
    setSession((prev) => ({ ...prev, ...gameSetup, attempts: [] }))
    setScreen(SCREENS.GAME)
  }, [])

  const finishGame = useCallback((gameResult) => {
    setSession((prev) => ({ ...prev, ...gameResult }))
    setScreen(SCREENS.RESULT)
  }, [])

  const goToPrize = useCallback((prizeInfo) => {
    setSession((prev) => ({ ...prev, ...prizeInfo }))
    setScreen(SCREENS.PRIZE)
  }, [])

  const goToThanks = useCallback(() => setScreen(SCREENS.THANKS), [])

  const value = {
    screen,
    session,
    resetToIdle,
    startRegistration,
    submitRegistration,
    startGame,
    finishGame,
    goToPrize,
    goToThanks,
  }

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>
}

export function useKiosk() {
  const ctx = useContext(KioskContext)
  if (!ctx) throw new Error('useKiosk deve ser usado dentro de KioskProvider')
  return ctx
}

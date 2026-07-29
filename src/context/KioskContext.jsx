import { createContext, useCallback, useContext, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'

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
  company: '',
  startedAt: null,
  pairs: [],
  usedFullPool: false,
  totalPairs: 0,
  correctPairs: 0,
  isWin: false,
  prizeTier: null,
  pickupCode: null,
})

export function KioskProvider({ children }) {
  const [screen, setScreen] = useState(SCREENS.IDLE)
  const [session, setSession] = useState(emptySession)

  // Pausa do totem ("Voltamos mais tarde"). Persiste no aparelho, então
  // sobrevive a reload/reboot até um operador retomar.
  const [paused, setPausedState] = useState(() => readJSON('paused', false))
  const setPaused = useCallback((value) => {
    writeJSON('paused', value)
    setPausedState(value)
  }, [])

  const resetToIdle = useCallback(() => {
    setSession(emptySession())
    setScreen(SCREENS.IDLE)
  }, [])

  const startRegistration = useCallback(() => {
    setSession(emptySession())
    setScreen(SCREENS.REGISTER)
  }, [])

  const submitRegistration = useCallback(({ name, phone, company }) => {
    setSession((prev) => ({ ...prev, name, phone, company, startedAt: Date.now() }))
    setScreen(SCREENS.INSTRUCTIONS)
  }, [])

  const startGame = useCallback((gameSetup) => {
    setSession((prev) => ({ ...prev, ...gameSetup }))
    setScreen(SCREENS.GAME)
  }, [])

  const finishGame = useCallback((gameResult) => {
    setSession((prev) => ({ ...prev, ...gameResult }))
    setScreen(SCREENS.RESULT)
  }, [])

  const goToPrize = useCallback(() => setScreen(SCREENS.PRIZE), [])

  const goToThanks = useCallback(() => setScreen(SCREENS.THANKS), [])

  const value = {
    screen,
    session,
    paused,
    setPaused,
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

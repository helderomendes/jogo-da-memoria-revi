import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'
import { appendGameLog, getGameConfig } from '../utils/dataStore'
import { DEFAULT_GAME_CONFIG } from '../data/config'

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
  prizeMode: 'wheel',
  prizeTier: null,
  pickupCode: null,
  // Modelo ESCOLHA: a partida só é gravada depois que o jogador escolhe o
  // brinde. Até lá o lead fica aqui; se ele sair sem escolher, é gravado no
  // reset com "Não escolheu" — nenhum lead se perde.
  pendingLog: null,
})

export function KioskProvider({ children }) {
  const [screen, setScreen] = useState(SCREENS.IDLE)
  const [session, setSession] = useState(emptySession)
  const [config, setConfig] = useState(DEFAULT_GAME_CONFIG)
  const pendingLogRef = useRef(null)

  useEffect(() => {
    getGameConfig().then((cfg) => cfg && setConfig(cfg))
  }, [])

  // Recarrega a config a cada nova partida (pega mudanças feitas no admin sem
  // precisar recarregar o totem).
  const refreshConfig = useCallback(() => {
    getGameConfig().then((cfg) => cfg && setConfig(cfg))
  }, [])

  // Pausa do totem ("Voltamos mais tarde"). Persiste no aparelho, então
  // sobrevive a reload/reboot até um operador retomar.
  const [paused, setPausedState] = useState(() => readJSON('paused', false))
  const setPaused = useCallback((value) => {
    writeJSON('paused', value)
    setPausedState(value)
  }, [])

  const flushPendingLog = useCallback(() => {
    const log = pendingLogRef.current
    pendingLogRef.current = null
    if (log) appendGameLog({ ...log, premioGanho: 'Não escolheu', codigoRetirada: null })
  }, [])

  const resetToIdle = useCallback(() => {
    flushPendingLog()
    setSession(emptySession())
    setScreen(SCREENS.IDLE)
    refreshConfig()
  }, [flushPendingLog, refreshConfig])

  const startRegistration = useCallback(() => {
    flushPendingLog()
    setSession(emptySession())
    setScreen(SCREENS.REGISTER)
  }, [flushPendingLog])

  const submitRegistration = useCallback(({ name, phone, company }) => {
    setSession((prev) => ({ ...prev, name, phone, company, startedAt: Date.now() }))
    setScreen(SCREENS.INSTRUCTIONS)
  }, [])

  const startGame = useCallback((gameSetup) => {
    setSession((prev) => ({ ...prev, ...gameSetup }))
    setScreen(SCREENS.GAME)
  }, [])

  const finishGame = useCallback((gameResult) => {
    pendingLogRef.current = gameResult.pendingLog ?? null
    setSession((prev) => ({ ...prev, ...gameResult }))
    setScreen(SCREENS.RESULT)
  }, [])

  // Modelo ESCOLHA: grava a partida com o brinde escolhido e o código.
  const confirmChoice = useCallback((tier, pickupCode) => {
    const log = pendingLogRef.current
    pendingLogRef.current = null
    if (log) appendGameLog({ ...log, premioGanho: tier.label, codigoRetirada: pickupCode })
    setSession((prev) => ({ ...prev, prizeTier: tier, pickupCode, pendingLog: null }))
  }, [])

  const goToPrize = useCallback(() => setScreen(SCREENS.PRIZE), [])

  const goToThanks = useCallback(() => setScreen(SCREENS.THANKS), [])

  const value = {
    screen,
    session,
    config,
    isLandscape: config.layout !== 'portrait',
    paused,
    setPaused,
    resetToIdle,
    startRegistration,
    submitRegistration,
    startGame,
    finishGame,
    confirmChoice,
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

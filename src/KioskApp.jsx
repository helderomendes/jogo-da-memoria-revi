import { useEffect, useState } from 'react'
import { KioskProvider, SCREENS, useKiosk } from './context/KioskContext'
import { getGameConfig } from './utils/dataStore'
import { useIdleTimer } from './utils/useIdleTimer'
import IdleScreen from './screens/IdleScreen'
import RegisterScreen from './screens/RegisterScreen'
import InstructionsScreen from './screens/InstructionsScreen'
import ThinkScreen from './screens/ThinkScreen'
import GameScreen from './screens/GameScreen'
import ResultScreen from './screens/ResultScreen'
import PrizeScreen from './screens/PrizeScreen'
import ThanksScreen from './screens/ThanksScreen'

const SCREEN_COMPONENTS = {
  [SCREENS.IDLE]: IdleScreen,
  [SCREENS.REGISTER]: RegisterScreen,
  [SCREENS.INSTRUCTIONS]: InstructionsScreen,
  [SCREENS.THINK]: ThinkScreen,
  [SCREENS.GAME]: GameScreen,
  [SCREENS.RESULT]: ResultScreen,
  [SCREENS.PRIZE]: PrizeScreen,
  [SCREENS.THANKS]: ThanksScreen,
}

function KioskFlow() {
  const { screen, resetToIdle } = useKiosk()
  const [idleTimeoutMs, setIdleTimeoutMs] = useState(null)

  useEffect(() => {
    getGameConfig().then((cfg) => setIdleTimeoutMs(cfg.idleTimeoutMs))
  }, [])

  useIdleTimer({
    enabled: idleTimeoutMs != null && screen !== SCREENS.IDLE && screen !== SCREENS.THANKS,
    timeoutMs: idleTimeoutMs ?? 30000,
    onIdle: resetToIdle,
  })

  const ScreenComponent = SCREEN_COMPONENTS[screen]

  return (
    <div className="fixed inset-0 overflow-hidden bg-revi-gradient transition-opacity duration-300">
      <ScreenComponent />
    </div>
  )
}

export default function KioskApp() {
  return (
    <KioskProvider>
      <KioskFlow />
    </KioskProvider>
  )
}

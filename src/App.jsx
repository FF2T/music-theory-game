import { useGameStore } from './store/gameStore'
import ModeSelector from './components/ModeSelector/ModeSelector'
import GameLayout from './components/GameLayout/GameLayout'
import BeginnerMode from './modes/beginner/BeginnerMode'
import IntermediateMode from './modes/intermediate/IntermediateMode'
import AdvancedMode from './modes/advanced/AdvancedMode'

const MODES = {
  beginner:     BeginnerMode,
  intermediate: IntermediateMode,
  advanced:     AdvancedMode,
}

export default function App() {
  const { currentMode, setMode } = useGameStore()

  if (!currentMode) {
    return <ModeSelector onSelectMode={setMode} />
  }

  const ModeComponent = MODES[currentMode]

  return (
    <GameLayout onExit={() => setMode(null)}>
      <ModeComponent />
    </GameLayout>
  )
}

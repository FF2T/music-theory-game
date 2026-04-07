import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import ModeSelector from './components/ModeSelector/ModeSelector'
import CharacterSelector from './components/CharacterSelector/CharacterSelector'
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
  const theme = useGameStore((s) => s.theme)
  const [showCharacterSelect, setShowCharacterSelect] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Character selection flow for beginner mode
  function handleSelectMode(mode) {
    if (mode === 'beginner') {
      setShowCharacterSelect(true)
    } else {
      setMode(mode)
    }
  }

  function handleCharacterSelected() {
    setShowCharacterSelect(false)
    setMode('beginner')
  }

  if (showCharacterSelect && !currentMode) {
    return <CharacterSelector onSelect={handleCharacterSelected} />
  }

  if (!currentMode) {
    return <ModeSelector onSelectMode={handleSelectMode} />
  }

  const ModeComponent = MODES[currentMode]

  return (
    <GameLayout onExit={() => { setMode(null); setShowCharacterSelect(false) }}>
      <ModeComponent />
    </GameLayout>
  )
}

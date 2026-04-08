import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import PlayerSelector from './components/PlayerSelector/PlayerSelector'
import ModeSelector from './components/ModeSelector/ModeSelector'
import CharacterSelector from './components/CharacterSelector/CharacterSelector'
import SessionComplete from './components/SessionComplete/SessionComplete'
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
  const { setMode, resetSession } = useGameStore()
  const sessionComplete = useGameStore((s) => s.sessionComplete)
  const theme = useGameStore((s) => s.theme)
  const startBeginnerSession = useGameStore((s) => s.startBeginnerSession)
  const startIntermediateSession = useGameStore((s) => s.startIntermediateSession)

  // Single screen state machine — no ambiguity
  const [screen, setScreen] = useState('player-select')
  // Which game mode is active (only relevant when screen === 'game')
  const [activeMode, setActiveMode] = useState(null)
  // Pending mode for character selection flow
  const [pendingMode, setPendingMode] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Force clean state on mount + load cloud data
  useEffect(() => {
    setMode(null)
    resetSession()
    useGameStore.getState().loadCloud()
    const unsub = useGameStore.getState().subscribeCloud()
    return () => unsub()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Watch for session completion (badge earned at 50 points)
  useEffect(() => {
    if (sessionComplete && (activeMode === 'beginner' || activeMode === 'intermediate')) {
      setScreen('session-complete')
    }
  }, [sessionComplete, activeMode])

  // ── Screen: Player selection ──
  if (screen === 'player-select') {
    return (
      <PlayerSelector
        onSelect={() => setScreen('home')}
      />
    )
  }

  // ── Screen: Session complete (badge earned) ──
  if (screen === 'session-complete') {
    return (
      <SessionComplete
        onContinue={() => {
          resetSession()
          setMode(null)
          setActiveMode(null)
          setScreen('home')
        }}
      />
    )
  }

  // ── Screen: Character + difficulty selection ──
  if (screen === 'character-select') {
    return (
      <CharacterSelector
        onSelect={() => {
          const mode = pendingMode || 'beginner'
          if (mode === 'intermediate') {
            startIntermediateSession()
          } else {
            startBeginnerSession()
          }
          setMode(mode)
          setActiveMode(mode)
          setScreen('game')
        }}
      />
    )
  }

  // ── Screen: Game ──
  if (screen === 'game' && activeMode) {
    const ModeComponent = MODES[activeMode]
    return (
      <GameLayout onExit={() => {
        resetSession()
        setMode(null)
        setActiveMode(null)
        setScreen('home')
      }}>
        <ModeComponent />
      </GameLayout>
    )
  }

  // ── Screen: Home (mode selection + scoreboard) ──
  return (
    <ModeSelector
      onSelectMode={(mode) => {
        if (mode === 'beginner' || mode === 'intermediate') {
          setPendingMode(mode)
          setScreen('character-select')
        } else {
          setMode(mode)
          setActiveMode(mode)
          setScreen('game')
        }
      }}
      onChangePlayer={() => setScreen('player-select')}
    />
  )
}

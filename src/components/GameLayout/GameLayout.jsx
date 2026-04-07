import { useState, useMemo } from 'react'
import { ChevronLeft, Volume2, VolumeX, Flame, Settings as SettingsIcon } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../ui/Button'
import Settings from '../Settings/Settings'

/** Compute page-wide embellishment styles from unicorn level (0-50). */
function usePageTheme(level) {
  return useMemo(() => {
    const l = level
    const t = l / 50 // 0→1 ratio

    // Background overlay gradient
    const bg = l >= 6
      ? `linear-gradient(180deg,
          rgba(3,7,18,1) 0%,
          rgba(88,28,135,${t * 0.12}) 40%,
          rgba(59,7,100,${t * 0.2}) 100%)`
      : undefined

    // Panel glow (applied to .glass panels)
    const panelShadow = l >= 10
      ? `0 0 ${t * 25}px rgba(139,92,246,${t * 0.25}),
         inset 0 0 ${t * 10}px rgba(139,92,246,${t * 0.04})`
      : undefined

    const panelBorder = l >= 10
      ? `rgba(167,139,250,${0.1 + t * 0.5})`
      : undefined

    // Header glow
    const headerShadow = l >= 15
      ? `0 2px ${t * 20}px rgba(139,92,246,${t * 0.2})`
      : undefined

    const headerBorder = l >= 15
      ? `rgba(167,139,250,${0.05 + t * 0.3})`
      : undefined

    // At level 50: rainbow hue-shift on borders
    const rainbow = l >= 50

    return { bg, panelShadow, panelBorder, headerShadow, headerBorder, rainbow, t, level: l }
  }, [level])
}

export default function GameLayout({ children, onExit }) {
  const [showSettings, setShowSettings] = useState(false)
  const {
    currentMode,
    sessionScore,
    sessionAnswers,
    sessionCorrect,
    currentStreak,
    audioEnabled,
    toggleAudio,
    resetSession,
  } = useGameStore()

  const isDark = useGameStore((s) => s.theme === 'dark')

  const unicornLevel = useGameStore((s) =>
    s.currentMode === 'beginner' ? (s.progress.beginner.unicornLevel ?? 0) : 0,
  )

  const theme = usePageTheme(isDark ? unicornLevel : 0)

  const accuracy = sessionAnswers > 0
    ? Math.round((sessionCorrect / sessionAnswers) * 100)
    : 0

  const currentPlayerId = useGameStore((s) => s.currentPlayerId)
  const players = useGameStore((s) => s.players)
  const currentPlayer = players.find((p) => p.id === currentPlayerId)

  const modeLabel = {
    beginner:     'Lecture de notes',
    intermediate: 'Rock Star',
    advanced:     'Légende vivante',
  }[currentMode] ?? ''

  function handleExit() {
    resetSession()
    onExit()
  }

  return (
    <div
      className="min-h-dvh flex flex-col transition-all duration-1000"
      style={theme.bg && isDark ? { background: theme.bg } : undefined}
    >
      {/* Header */}
      <header
        className={[
          'glass border-b px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-40',
          'transition-all duration-700',
          theme.rainbow && isDark ? 'rainbow-border' : '',
        ].join(' ')}
        style={{
          boxShadow: isDark ? theme.headerShadow : undefined,
          borderColor: isDark && theme.headerBorder ? theme.headerBorder : undefined,
        }}
      >
        <Button variant="ghost" size="sm" onClick={handleExit} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" />
          Modes
        </Button>

        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {currentPlayer ? `${currentPlayer.name} — ` : ''}{modeLabel}
        </span>

        {/* Score HUD */}
        <div className="flex items-center gap-4 text-sm">
          {currentStreak >= 3 && (
            <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 animate-pulse-fast">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{currentStreak}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span className="text-gray-900 dark:text-white font-semibold">{sessionScore}</span>
            <span className="hidden sm:inline">pts</span>
          </div>

          {sessionAnswers > 0 && (
            <div className="hidden sm:block text-gray-400 dark:text-gray-500 text-xs">
              {accuracy}% ({sessionCorrect}/{sessionAnswers})
            </div>
          )}

          <button
            onClick={toggleAudio}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title={audioEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {audioEnabled
              ? <Volume2 className="w-4 h-4" />
              : <VolumeX className="w-4 h-4" />
            }
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Paramètres"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content — pass theme down via CSS custom properties */}
      <main
        className="flex-1 flex flex-col items-center justify-start px-3 sm:px-4 py-3 sm:py-4"
        style={{
          '--panel-shadow': (isDark && theme.panelShadow) || 'none',
          '--panel-border': (isDark && theme.panelBorder) || undefined,
        }}
      >
        {children}
      </main>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

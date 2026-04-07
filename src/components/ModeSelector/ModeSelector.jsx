import { useState } from 'react'
import { BookOpen, Layers, Zap, Music, Star, Trophy, Lock, Settings as SettingsIcon, LogOut } from 'lucide-react'
import { useGameStore, CHARACTERS } from '../../store/gameStore'
import { Button } from '../ui/Button'
import Settings from '../Settings/Settings'
import Scoreboard from '../Scoreboard/Scoreboard'

const MODE_PASSWORD = '212402'

const MODES = [
  {
    id: 'beginner',
    label: 'Lecture de notes',
    icon: BookOpen,
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    glow: 'hover:shadow-emerald-500/20',
    description: 'Lecture de notes en clé de sol et fa, identification sur piano virtuel',
    topics: ['Notes Do→Si', 'Clé de Sol & Fa', 'Piano interactif', '50 points = Badge'],
    difficulty: 1,
    locked: false,
  },
  {
    id: 'intermediate',
    label: 'Rock Star',
    icon: Layers,
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    glow: 'hover:shadow-blue-500/20',
    description: 'Module en cours de développement',
    topics: ['Intervalles', 'Pentatonique Maj/min', 'Signatures rythmiques', 'Oreille musicale'],
    difficulty: 2,
    locked: true,
  },
  {
    id: 'advanced',
    label: 'Légende vivante',
    icon: Zap,
    color: 'from-violet-600 to-purple-700',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    glow: 'hover:shadow-violet-500/20',
    description: 'Module en cours de développement',
    topics: ['7 Modes grecs', 'Accords 7e & 9e', 'Grille blues 12 bars', 'Harmonie avancée'],
    difficulty: 3,
    locked: true,
  },
]

function DifficultyStars({ level }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  )
}

function ModeCard({ mode, onSelect, savedProgress }) {
  const Icon = mode.icon
  const progress = savedProgress[mode.id]
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const charInfo = CHARACTERS.find((c) => c.id === selectedCharacter)
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100)
    : null

  function handleClick() {
    if (mode.locked) {
      const pwd = window.prompt('Mot de passe requis :')
      if (pwd !== MODE_PASSWORD) {
        if (pwd !== null) window.alert('Mot de passe incorrect')
        return
      }
    }
    onSelect(mode.id)
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'group relative flex flex-col gap-4 p-5 sm:p-7 rounded-3xl text-left',
        'glass border transition-all duration-300',
        mode.locked ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-1',
        mode.border,
        mode.locked ? '' : mode.glow,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${mode.color}`}>
          {mode.locked
            ? <Lock className="w-7 h-7 text-white" strokeWidth={1.8} />
            : <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
          }
        </div>
        <div className="flex items-center gap-2">
          {mode.id === 'beginner' && charInfo && (
            <span className="text-lg" title={charInfo.label}>{charInfo.emoji}</span>
          )}
          <DifficultyStars level={mode.difficulty} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{mode.label}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">{mode.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {mode.topics.map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
          >
            {t}
          </span>
        ))}
      </div>

      {!mode.locked && accuracy !== null && (
        <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
          <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 dark:text-gray-300">
            {progress.totalAnswered} réponses · {accuracy}% correct · Meilleure série : {progress.bestStreak}
          </span>
        </div>
      )}

      <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-xl">
        {mode.locked ? '\u{1F512}' : '→'}
      </div>
    </button>
  )
}

export default function ModeSelector({ onSelectMode, onChangePlayer }) {
  const [showSettings, setShowSettings] = useState(false)
  const progress = useGameStore((s) => s.progress)
  const resetAll = useGameStore((s) => s.resetAllProgress)
  const currentPlayerId = useGameStore((s) => s.currentPlayerId)
  const players = useGameStore((s) => s.players)

  const currentPlayer = players.find((p) => p.id === currentPlayerId)

  return (
    <div className="min-h-dvh flex flex-col items-center px-3 sm:px-4 py-8 sm:py-12">
      {/* Top bar */}
      <div className="fixed top-4 left-4 z-30">
        <button
          onClick={onChangePlayer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          title="Changer de joueur"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{currentPlayer?.name}</span>
        </button>
      </div>

      <div className="fixed top-4 right-4 z-30">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Paramètres"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Music className="w-10 h-10 text-primary-500 dark:text-primary-400" strokeWidth={1.5} />
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-gradient">MusicMaster</h1>
        </div>
        {currentPlayer && (
          <p className="text-lg text-gray-600 dark:text-gray-300 font-semibold mb-1">
            Bonjour {currentPlayer.name} !
          </p>
        )}
        <p className="text-gray-500 dark:text-gray-300 text-sm max-w-md mx-auto">
          Choisis ton niveau pour commencer.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-slide-up mb-10">
        {MODES.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onSelect={onSelectMode}
            savedProgress={progress}
          />
        ))}
      </div>

      {/* Scoreboard */}
      <div className="w-full max-w-3xl animate-slide-up">
        <Scoreboard />
      </div>

      {/* Reset progress */}
      <div className="mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm('Réinitialiser toute la progression ?')) resetAll()
          }}
          className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
        >
          Réinitialiser la progression
        </Button>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

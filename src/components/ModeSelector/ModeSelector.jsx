import { BookOpen, Layers, Zap, Music, Star, Trophy } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../ui/Button'

const MODES = [
  {
    id: 'beginner',
    label: 'Débutant',
    icon: BookOpen,
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    glow: 'hover:shadow-emerald-500/20',
    description: 'Lecture de notes en clé de sol et identification sur piano virtuel',
    topics: ['Notes Do→Si', 'Clé de Sol', 'Piano interactif', 'Rythmes simples'],
    difficulty: 1,
  },
  {
    id: 'intermediate',
    label: 'Intermédiaire',
    icon: Layers,
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    glow: 'hover:shadow-blue-500/20',
    description: 'Intervalles, gammes pentatoniques et signatures rythmiques',
    topics: ['Intervalles', 'Pentatonique Maj/min', 'Signatures rythmiques', 'Oreille musicale'],
    difficulty: 2,
  },
  {
    id: 'advanced',
    label: 'Avancé',
    icon: Zap,
    color: 'from-violet-600 to-purple-700',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    glow: 'hover:shadow-violet-500/20',
    description: 'Modes grecs, accords de 7ème/9ème et structures blues',
    topics: ['7 Modes grecs', 'Accords 7e & 9e', 'Grille blues 12 bars', 'Harmonie avancée'],
    difficulty: 3,
  },
]

function DifficultyStars({ level }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  )
}

function ModeCard({ mode, onSelect, savedProgress }) {
  const Icon = mode.icon
  const progress = savedProgress[mode.id]
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100)
    : null

  return (
    <button
      onClick={() => onSelect(mode.id)}
      className={[
        'group relative flex flex-col gap-4 p-5 sm:p-7 rounded-3xl text-left',
        'glass border transition-all duration-300',
        'hover:shadow-2xl hover:-translate-y-1',
        mode.border,
        mode.glow,
      ].join(' ')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${mode.color}`}>
          <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
        </div>
        <DifficultyStars level={mode.difficulty} />
      </div>

      {/* Title & description */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">{mode.label}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{mode.description}</p>
      </div>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2">
        {mode.topics.map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 text-xs rounded-full bg-white/8 text-gray-300 border border-white/10"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Progress footer */}
      {accuracy !== null && (
        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-xs text-gray-400">
            {progress.totalAnswered} réponses · {accuracy}% correct · Meilleure série : {progress.bestStreak}
          </span>
        </div>
      )}

      {/* Hover arrow */}
      <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-xl">
        →
      </div>
    </button>
  )
}

export default function ModeSelector({ onSelectMode }) {
  const progress = useGameStore((s) => s.progress)
  const resetAll = useGameStore((s) => s.resetAllProgress)

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-14 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Music className="w-10 h-10 text-primary-400" strokeWidth={1.5} />
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-gradient">MusicMaster</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Apprends la théorie musicale de façon interactive et ludique.
          Choisis ton niveau pour commencer.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-slide-up">
        {MODES.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onSelect={onSelectMode}
            savedProgress={progress}
          />
        ))}
      </div>

      {/* Reset progress */}
      <div className="mt-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm('Réinitialiser toute la progression ?')) resetAll()
          }}
          className="text-gray-600 hover:text-gray-400"
        >
          Réinitialiser la progression
        </Button>
      </div>
    </div>
  )
}

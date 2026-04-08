import { Star, ArrowLeft } from 'lucide-react'
import { useGameStore, CHARACTERS, DIFFICULTY_CONFIGS, getBadgeTitle, getPlayerStatus } from '../../store/gameStore'
import { Button } from '../ui/Button'
import Scoreboard from '../Scoreboard/Scoreboard'

export default function CharacterSelector({ onSelect, onBack, mode = 'beginner' }) {
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const setCharacter = useGameStore((s) => s.setCharacter)
  const difficultyLevel = useGameStore((s) => s.difficultyLevel)
  const setDifficulty = useGameStore((s) => s.setDifficulty)
  const currentPlayerId = useGameStore((s) => s.currentPlayerId)
  const playerRecords = useGameStore((s) => s.playerRecords)

  const badgeKey = mode === 'intermediate' ? 'intervalBadges' : 'badges'

  // Show which characters already have badges for this player at selected difficulty
  const allBadges = playerRecords[currentPlayerId]?.[badgeKey] || {}
  const status = getPlayerStatus(allBadges, difficultyLevel)

  function handleConfirm() {
    onSelect(selectedCharacter)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 animate-fade-in">
      {/* Back button */}
      {onBack && (
        <div className="fixed top-4 left-4 z-30">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </button>
        </div>
      )}

      {/* Character selection */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choisis ton compagnon !
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Il grandira à chaque bonne réponse. Atteins 50 points pour obtenir son badge !
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg mb-8">
        {CHARACTERS.map((char) => {
          const isSelected = selectedCharacter === char.id
          const hasBadge = !!status.badges[char.id]
          return (
            <button
              key={char.id}
              onClick={() => setCharacter(char.id)}
              className={[
                'group relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl',
                'border-2 transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
                isSelected
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20',
              ].join(' ')}
            >
              <span className="text-4xl sm:text-5xl leading-none">{char.emoji}</span>

              <span className={[
                'text-sm font-semibold',
                isSelected
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300',
              ].join(' ')}>
                {getBadgeTitle(char.id, difficultyLevel)}
              </span>

              {/* Badge indicator — only for current difficulty */}
              {hasBadge && (
                <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold">
                  {DIFFICULTY_CONFIGS[difficultyLevel].emoji} Badge obtenu
                </span>
              )}

              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${char.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </button>
          )
        })}
      </div>

      {/* Difficulty selection */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Difficulté
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Plus c'est difficile, plus le défi est grand !
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg mb-8">
        {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => {
          const isSelected = difficultyLevel === key
          return (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className={[
                'flex flex-col items-center gap-1.5 p-3 rounded-xl',
                'border-2 transition-all duration-200',
                'hover:shadow-md active:scale-95',
                isSelected
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20',
              ].join(' ')}
            >
              <span className="text-xl">{config.emoji}</span>
              <span className={[
                'text-sm font-semibold',
                isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300',
              ].join(' ')}>
                {config.label}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < config.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-tight">
                {config.description}
              </span>
            </button>
          )
        })}
      </div>

      {/* Confirm */}
      <Button size="lg" onClick={handleConfirm} className="gap-2 mb-10">
        C'est parti !
      </Button>

      {/* Scoreboard */}
      <div className="w-full max-w-3xl">
        <Scoreboard badgeKey={badgeKey} />
      </div>
    </div>
  )
}

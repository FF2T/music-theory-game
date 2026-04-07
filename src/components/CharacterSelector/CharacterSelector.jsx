import { useGameStore, CHARACTERS } from '../../store/gameStore'

export default function CharacterSelector({ onSelect }) {
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const setCharacter = useGameStore((s) => s.setCharacter)

  function handleSelect(id) {
    setCharacter(id)
    onSelect(id)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choisis ton compagnon !
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Il grandira à chaque bonne réponse. Qui vas-tu construire aujourd'hui ?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg">
        {CHARACTERS.map((char) => {
          const isSelected = selectedCharacter === char.id
          return (
            <button
              key={char.id}
              onClick={() => handleSelect(char.id)}
              className={[
                'group relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl',
                'border-2 transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
                isSelected
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20',
              ].join(' ')}
            >
              {/* Emoji */}
              <span className="text-4xl sm:text-5xl leading-none">{char.emoji}</span>

              {/* Name */}
              <span className={[
                'text-sm font-semibold',
                isSelected
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300',
              ].join(' ')}>
                {char.label}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

              {/* Color accent on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${char.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600 mt-6">
        Tu pourras changer de compagnon à tout moment
      </p>
    </div>
  )
}

import { X, Sun, Moon, Volume2, VolumeX, Sliders } from 'lucide-react'
import { useGameStore, CHARACTERS } from '../../store/gameStore'

const PENALTY_OPTIONS = [
  { value: 0,  label: '0 (pas de malus)' },
  { value: -1, label: '-1 (très facile)' },
  { value: -2, label: '-2 (recommandé)' },
  { value: -3, label: '-3 (difficile)' },
  { value: -5, label: '-5 (très difficile)' },
]

export default function Settings({ onClose }) {
  const theme = useGameStore((s) => s.theme)
  const setTheme = useGameStore((s) => s.setTheme)
  const audioEnabled = useGameStore((s) => s.audioEnabled)
  const toggleAudio = useGameStore((s) => s.toggleAudio)
  const penaltyValue = useGameStore((s) => s.penaltyValue)
  const setPenaltyValue = useGameStore((s) => s.setPenaltyValue)
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const setCharacter = useGameStore((s) => s.setCharacter)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Apparence
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  theme === 'light'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-400'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
                ].join(' ')}
              >
                <Sun className="w-4 h-4" />
                Clair
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={[
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  theme === 'dark'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-400'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
                ].join(' ')}
              >
                <Moon className="w-4 h-4" />
                Sombre
              </button>
            </div>
          </div>

          {/* Audio */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Son</label>
            <button
              onClick={toggleAudio}
              className={[
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                audioEnabled
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400',
              ].join(' ')}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {audioEnabled ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* Scoring separator */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-primary-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Scoring
              </label>
            </div>

            {/* Penalty value */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Malus par mauvaise réponse (niveau personnage)
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {PENALTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPenaltyValue(opt.value)}
                    className={[
                      'px-3 py-2 rounded-lg text-xs font-medium text-left transition-all',
                      penaltyValue === opt.value
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-400'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character selector */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Compagnon (mode débutant)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setCharacter(char.id)}
                  className={[
                    'flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all',
                    selectedCharacter === char.id
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-400'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
                  ].join(' ')}
                >
                  <span className="text-xl">{char.emoji}</span>
                  {char.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

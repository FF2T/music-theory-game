import { X, Sun, Moon, Volume2, VolumeX } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export default function Settings({ onClose }) {
  const theme = useGameStore((s) => s.theme)
  const setTheme = useGameStore((s) => s.setTheme)
  const audioEnabled = useGameStore((s) => s.audioEnabled)
  const toggleAudio = useGameStore((s) => s.toggleAudio)

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

        {/* Theme */}
        <div className="space-y-4">
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
        </div>
      </div>
    </div>
  )
}

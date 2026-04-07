import { useState } from 'react'
import { UserPlus, Music } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../ui/Button'

export default function PlayerSelector({ onSelect }) {
  const players = useGameStore((s) => s.players)
  const currentPlayerId = useGameStore((s) => s.currentPlayerId)
  const setCurrentPlayer = useGameStore((s) => s.setCurrentPlayer)
  const addPlayer = useGameStore((s) => s.addPlayer)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  function handleSelect(id) {
    setCurrentPlayer(id)
    onSelect(id)
  }

  function handleAddPlayer(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    addPlayer(name)
    setNewName('')
    setShowAdd(false)
    // The addPlayer action sets currentPlayerId, so we just trigger onSelect
    setTimeout(() => {
      const state = useGameStore.getState()
      onSelect(state.currentPlayerId)
    }, 0)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Music className="w-10 h-10 text-primary-500 dark:text-primary-400" strokeWidth={1.5} />
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-gradient">MusicMaster</h1>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Qui joue ?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          S\u00e9lectionne ton profil pour commencer
        </p>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg">
        {players.map((player) => {
          const isSelected = currentPlayerId === player.id
          return (
            <button
              key={player.id}
              onClick={() => handleSelect(player.id)}
              className={[
                'group relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl',
                'border-2 transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
                isSelected
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20',
              ].join(' ')}
            >
              {/* Avatar circle with initials */}
              <div className={[
                'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold',
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300',
              ].join(' ')}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              <span className={[
                'text-sm font-semibold',
                isSelected
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300',
              ].join(' ')}>
                {player.name}
              </span>
            </button>
          )
        })}

        {/* Add player button */}
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className={[
              'flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-2xl',
              'border-2 border-dashed border-gray-300 dark:border-white/20',
              'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              'hover:border-gray-400 dark:hover:border-white/30 transition-all duration-200',
            ].join(' ')}
          >
            <UserPlus className="w-8 h-8" />
            <span className="text-xs font-medium">Ajouter</span>
          </button>
        )}
      </div>

      {/* Add player form */}
      {showAdd && (
        <form onSubmit={handleAddPlayer} className="mt-4 flex items-center gap-2 w-full max-w-xs">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Pr\u00e9nom..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            maxLength={20}
          />
          <Button size="sm" type="submit" disabled={!newName.trim()}>OK</Button>
          <Button size="sm" variant="ghost" type="button" onClick={() => { setShowAdd(false); setNewName('') }}>
            Annuler
          </Button>
        </form>
      )}
    </div>
  )
}

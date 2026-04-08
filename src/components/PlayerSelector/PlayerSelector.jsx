import { useState, useRef, useEffect } from 'react'
import { UserPlus, Music, Lock, KeyRound, Settings } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../ui/Button'
import { warmUpAudio } from '../../utils/audioHelpers'

export default function PlayerSelector({ onSelect }) {
  const players = useGameStore((s) => s.players)
  const currentPlayerId = useGameStore((s) => s.currentPlayerId)
  const setCurrentPlayer = useGameStore((s) => s.setCurrentPlayer)
  const addPlayer = useGameStore((s) => s.addPlayer)
  const setPlayerPin = useGameStore((s) => s.setPlayerPin)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  // PIN states
  const [pinPlayerId, setPinPlayerId] = useState(null) // player asking for PIN
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const [settingPin, setSettingPin] = useState(null) // player id setting new PIN
  const [newPinDigits, setNewPinDigits] = useState(['', '', '', ''])
  const pinRefs = [useRef(), useRef(), useRef(), useRef()]
  const newPinRefs = [useRef(), useRef(), useRef(), useRef()]

  function handleSelect(id) {
    const player = players.find((p) => p.id === id)
    if (player?.pin) {
      // Has PIN — ask for it
      setPinPlayerId(id)
      setPinDigits(['', '', '', ''])
      setPinError(false)
    } else {
      // No PIN — go directly
      warmUpAudio()
      setCurrentPlayer(id)
      onSelect(id)
    }
  }

  function handlePinSubmit() {
    const player = players.find((p) => p.id === pinPlayerId)
    const entered = pinDigits.join('')
    if (entered === player.pin) {
      warmUpAudio()
      setCurrentPlayer(pinPlayerId)
      setPinPlayerId(null)
      onSelect(pinPlayerId)
    } else {
      setPinError(true)
      setPinDigits(['', '', '', ''])
      setTimeout(() => pinRefs[0].current?.focus(), 50)
    }
  }

  function handlePinDigit(index, value, refs, digits, setDigits, onComplete) {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setPinError(false)
    if (value && index < 3) {
      refs[index + 1].current?.focus()
    }
    if (value && index === 3 && onComplete) {
      setTimeout(() => onComplete(next), 50)
    }
  }

  function handlePinKeyDown(e, index, refs, digits, setDigits) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus()
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
    }
  }

  // Auto-focus first PIN input
  useEffect(() => {
    if (pinPlayerId) setTimeout(() => pinRefs[0].current?.focus(), 50)
  }, [pinPlayerId])

  useEffect(() => {
    if (settingPin) setTimeout(() => newPinRefs[0].current?.focus(), 50)
  }, [settingPin])

  function handleSetPinSubmit(digits) {
    const pin = (digits || newPinDigits).join('')
    if (pin.length === 4) {
      setPlayerPin(settingPin, pin)
      setSettingPin(null)
      setNewPinDigits(['', '', '', ''])
    }
  }

  function handleRemovePin(id) {
    setPlayerPin(id, null)
    setSettingPin(null)
  }

  const [addError, setAddError] = useState('')

  function handleAddPlayer(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setAddError('Ce prénom existe déjà')
      return
    }
    addPlayer(name)
    setNewName('')
    setShowAdd(false)
    setAddError('')
    setTimeout(() => {
      const state = useGameStore.getState()
      onSelect(state.currentPlayerId)
    }, 0)
  }

  // PIN input modal
  if (pinPlayerId) {
    const player = players.find((p) => p.id === pinPlayerId)
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 animate-fade-in">
        <div className="glass rounded-2xl p-6 sm:p-8 max-w-xs w-full text-center">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {player?.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Entre ton code secret
          </p>

          <div className="flex justify-center gap-3 mb-4">
            {pinDigits.map((d, i) => (
              <input
                key={i}
                ref={pinRefs[i]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handlePinDigit(i, e.target.value, pinRefs, pinDigits, setPinDigits, () => {
                  // Auto-submit when 4 digits entered
                  const entered = [...pinDigits]; entered[i] = e.target.value
                  const pin = entered.join('')
                  if (pin.length === 4) {
                    const p = players.find((pl) => pl.id === pinPlayerId)
                    if (pin === p.pin) {
                      warmUpAudio()
                      setCurrentPlayer(pinPlayerId)
                      setPinPlayerId(null)
                      onSelect(pinPlayerId)
                    } else {
                      setPinError(true)
                      setPinDigits(['', '', '', ''])
                      setTimeout(() => pinRefs[0].current?.focus(), 50)
                    }
                  }
                })}
                onKeyDown={(e) => handlePinKeyDown(e, i, pinRefs, pinDigits, setPinDigits)}
                className={[
                  'w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-white dark:bg-white/5',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all',
                  pinError
                    ? 'border-red-400 dark:border-red-500 text-red-600'
                    : 'border-gray-300 dark:border-white/20 text-gray-900 dark:text-white',
                ].join(' ')}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-sm text-red-500 mb-3 animate-shake">Code incorrect</p>
          )}

          <Button variant="ghost" size="sm" onClick={() => setPinPlayerId(null)}>
            Retour
          </Button>
        </div>
      </div>
    )
  }

  // Set PIN modal
  if (settingPin) {
    const player = players.find((p) => p.id === settingPin)
    const hasPin = !!player?.pin
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 animate-fade-in">
        <div className="glass rounded-2xl p-6 sm:p-8 max-w-xs w-full text-center">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {player?.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {hasPin ? 'Changer le code secret' : 'Choisis un code secret (4 chiffres)'}
          </p>

          <div className="flex justify-center gap-3 mb-5">
            {newPinDigits.map((d, i) => (
              <input
                key={i}
                ref={newPinRefs[i]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handlePinDigit(i, e.target.value, newPinRefs, newPinDigits, setNewPinDigits, handleSetPinSubmit)}
                onKeyDown={(e) => handlePinKeyDown(e, i, newPinRefs, newPinDigits, setNewPinDigits)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {hasPin && (
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleRemovePin(settingPin)}>
                Supprimer le code
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setSettingPin(null); setNewPinDigits(['', '', '', '']) }}>
              Annuler
            </Button>
          </div>
        </div>
      </div>
    )
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
          Sélectionne ton profil pour commencer
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

              {/* Lock indicator */}
              {player.pin && (
                <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              )}

              {/* Settings button (long press / right area) */}
              <button
                onClick={(e) => { e.stopPropagation(); setSettingPin(player.id) }}
                className="absolute bottom-1 right-1 p-1 rounded-lg opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                title="Configurer le code secret"
              >
                <Settings className="w-3.5 h-3.5 text-gray-400" />
              </button>
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
        <div className="mt-4 w-full max-w-xs">
        <form onSubmit={handleAddPlayer} className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setAddError('') }}
            placeholder="Prénom..."
            className={[
              'flex-1 px-3 py-2 rounded-xl border bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400',
              addError ? 'border-red-400' : 'border-gray-300 dark:border-white/20',
            ].join(' ')}
            maxLength={20}
          />
          <Button size="sm" type="submit" disabled={!newName.trim()}>OK</Button>
          <Button size="sm" variant="ghost" type="button" onClick={() => { setShowAdd(false); setNewName(''); setAddError('') }}>
            Annuler
          </Button>
        </form>
        {addError && <p className="text-sm text-red-500 mt-1.5 animate-shake">{addError}</p>}
        </div>
      )}
    </div>
  )
}

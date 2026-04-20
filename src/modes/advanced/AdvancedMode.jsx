import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, Timer, Play } from 'lucide-react'
import CharacterReward from '../../components/CharacterReward/CharacterReward'
import { Button } from '../../components/ui/Button'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore, CHORD_DIFFICULTY_CONFIGS, getProgress } from '../../store/gameStore'
import { CHORD_TYPES, buildChord, pickRandom } from '../../utils/musicTheory'

// ── Constants ────────────────────────────────────────────────────────────────

const CHORDS_PER_ROUND = 4
const ROOT_NOTE_NAMES = ['Do', 'Do♯', 'Ré', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si']

// Display order for the 4 chord buttons — most to least common
const CHORD_ORDER = ['maj', 'min', 'dim', 'aug']

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRootPool(rootRange) {
  if (rootRange === 'wide') {
    // C3 to B4 (24 semitones)
    return Array.from({ length: 24 }, (_, i) => 48 + i)
  }
  // C4 to B4 (one octave)
  return Array.from({ length: 12 }, (_, i) => 60 + i)
}

function generateChordSequence(difficultyLevel) {
  const config = CHORD_DIFFICULTY_CONFIGS[difficultyLevel] || CHORD_DIFFICULTY_CONFIGS.normal
  const roots = getRootPool(config.rootRange)
  const sequence = []

  for (let i = 0; i < CHORDS_PER_ROUND; i++) {
    const rootMidi = pickRandom(roots)
    const targetId = pickRandom(config.chords)
    sequence.push({
      rootMidi,
      targetId,
      notes: buildChord(rootMidi, targetId),
    })
  }
  return sequence
}

function panelStyle() {
  return { borderColor: 'var(--panel-border, transparent)' }
}

// ── Chrono hook ──────────────────────────────────────────────────────────────

function useChrono(running) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!running) {
      setElapsed(0)
      startRef.current = Date.now()
      return
    }
    startRef.current = Date.now()
    setElapsed(0)
    const id = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000)
    }, 100)
    return () => clearInterval(id)
  }, [running])

  return { elapsed, startTime: startRef.current }
}

function useSessionTimer() {
  const sessionStartTime = useGameStore((s) => s.sessionStartTime)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  useEffect(() => {
    if (!sessionStartTime) return
    const id = setInterval(() => setSessionElapsed((Date.now() - sessionStartTime) / 1000), 1000)
    return () => clearInterval(id)
  }, [sessionStartTime])
  return sessionElapsed
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdvancedMode() {
  const difficultyLevel = useGameStore((s) => s.difficultyLevel)
  const diffConfig = CHORD_DIFFICULTY_CONFIGS[difficultyLevel] || CHORD_DIFFICULTY_CONFIGS.normal

  const [sequenceCount, setSequenceCount] = useState(0)
  const [sequence, setSequence] = useState(() => generateChordSequence(difficultyLevel))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [wrongAnswer, setWrongAnswer] = useState(null)
  const [chronoKey, setChronoKey] = useState(0)
  const [played, setPlayed] = useState(false)

  const recordAnswer = useGameStore((s) => s.recordAnswer)
  const unicornLevel = useGameStore((s) => getProgress(s).advanced?.unicornLevel ?? 0)
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const sessionComplete = useGameStore((s) => s.sessionComplete)
  const { playFailure, playChord } = useAudio()

  const { elapsed, startTime } = useChrono(!busy ? chronoKey : false)
  const sessionElapsed = useSessionTimer()

  const [fastThreshold, slowThreshold] = diffConfig.timeThresholds
  const chronoColor = busy
    ? 'text-gray-400 dark:text-gray-600'
    : elapsed < fastThreshold
      ? 'text-green-500 dark:text-green-400'
      : elapsed <= slowThreshold
        ? 'text-yellow-500 dark:text-yellow-400'
        : 'text-red-500 dark:text-red-400'

  // ── Actions ──

  const startNext = useCallback(() => {
    const newCount = sequenceCount + 1
    setSequenceCount(newCount)
    setSequence(generateChordSequence(difficultyLevel))
    setCurrentIdx(0)
    setResults([])
    setBusy(false)
    setPlayed(false)
    setChronoKey((k) => k + 1)
  }, [sequenceCount, difficultyLevel])

  const current = sequence[currentIdx]

  // Auto-play chord on new question
  useEffect(() => {
    if (diffConfig.autoPlay && current && !played && !busy) {
      playChord(current.notes, '2n')
      setPlayed(true)
    }
  }, [currentIdx, sequenceCount]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePlayChord() {
    if (!current) return
    playChord(current.notes, '2n')
    setPlayed(true)
  }

  const handleAnswer = useCallback(
    (chordId) => {
      if (busy || sessionComplete) return
      setBusy(true)

      const isCorrect = chordId === current.targetId
      const responseTimeMs = Date.now() - startTime
      recordAnswer({ correct: isCorrect, exerciseId: 'chord-quality', responseTimeMs })

      if (isCorrect) {
        setWrongAnswer(null)
        const newResults = [...results, 'correct']
        setResults(newResults)

        const isLast = currentIdx >= CHORDS_PER_ROUND - 1
        setTimeout(() => {
          setWrongAnswer(null)
          if (isLast) {
            setTimeout(() => startNext(), 400)
          } else {
            setCurrentIdx((i) => i + 1)
            setBusy(false)
            setPlayed(false)
            setChronoKey((k) => k + 1)
          }
        }, 500)
      } else {
        playFailure()
        setWrongAnswer(chordId)
        setTimeout(() => {
          setWrongAnswer(null)
          setBusy(false)
        }, 800)
      }
    },
    [busy, sessionComplete, currentIdx, results, current, startTime, recordAnswer, playFailure, startNext],
  )

  // ── Derived ──

  const seqCorrect = results.filter((r) => r === 'correct').length
  const seqTotal = results.length

  const rootName = current ? ROOT_NOTE_NAMES[current.rootMidi % 12] : ''

  // Filter to difficulty's allowed chords and sort in display order
  const choices = CHORD_ORDER.filter((id) => diffConfig.chords.includes(id))

  // Session timer display
  const sessionMin = Math.floor(sessionElapsed / 60)
  const sessionSec = Math.floor(sessionElapsed % 60)
  const sessionTimeStr = sessionMin > 0
    ? `${sessionMin}:${sessionSec.toString().padStart(2, '0')}`
    : `${sessionSec}s`

  // Confetti at 50
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    if (unicornLevel >= 50 && !showConfetti) setShowConfetti(true)
  }, [unicornLevel]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-6xl animate-fade-in">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden will-change-transform">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                fontSize: `${16 + Math.random() * 20}px`,
              }}
            >
              {['🎉', '✨', '🌟', '🎶', '💫'][i % 5]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-3">
        <div className="flex items-center gap-2 justify-center text-violet-500 dark:text-violet-400 mb-1">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Accords</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-semibold">
            {diffConfig.emoji} {diffConfig.label}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Identifie cet accord
          {current && <span className="text-violet-600 dark:text-violet-300"> {'—'} Fondamentale : {rootName}</span>}
        </h2>
      </div>

      {/* Main 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Progress header */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Accord {Math.min(currentIdx + 1, CHORDS_PER_ROUND)}/{CHORDS_PER_ROUND}
              </span>

              <div className={`flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums ${chronoColor} transition-colors`}>
                <Timer className="w-3.5 h-3.5" />
                <span>{elapsed.toFixed(1)}s</span>
                {!busy && (
                  <span className="text-[10px] font-semibold ml-1">
                    {elapsed < fastThreshold ? '+2' : elapsed <= slowThreshold ? '+1' : '+0'}
                  </span>
                )}
              </div>

              {seqTotal > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {seqCorrect}/{seqTotal} correct{seqCorrect > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Play button */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePlayChord}
              className="gap-2"
              disabled={busy || sessionComplete}
            >
              <Play className="w-4 h-4 fill-current" />
              Écouter
            </Button>
          </div>

          {/* Answer buttons */}
          <div className={`grid gap-2 ${choices.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {choices.map((chordId) => {
              const info = CHORD_TYPES[chordId]
              const isCorrect = current && chordId === current.targetId
              const isWrongPressed = busy && wrongAnswer === chordId
              let extra = ''
              if (busy && results.length > currentIdx) {
                extra = isCorrect
                  ? 'ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40'
                  : 'opacity-40'
              } else if (isWrongPressed) {
                extra = 'ring-2 ring-red-400 bg-red-100 dark:bg-red-900/40'
              }

              return (
                <button
                  key={chordId}
                  disabled={busy || sessionComplete}
                  onClick={() => handleAnswer(chordId)}
                  className={[
                    'py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-150',
                    'glass border border-gray-200 dark:border-white/10 hover:border-violet-400/60',
                    'hover:bg-violet-50 dark:hover:bg-violet-900/20 active:scale-95',
                    'disabled:cursor-not-allowed',
                    extra,
                  ].join(' ')}
                >
                  <div>{info.name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                    {rootName}{info.symbol}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right column: Character + Progress */}
        <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-3 self-start">
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Progression</span>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{sessionTimeStr}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 mb-1.5">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (unicornLevel / 50) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
              <span>{unicornLevel}/50</span>
              <span>Badge</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-3 sm:p-4" style={panelStyle()}>
            <CharacterReward character={selectedCharacter} level={unicornLevel} difficulty={difficultyLevel} />
          </div>
        </div>
      </div>
    </div>
  )
}

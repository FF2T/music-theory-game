import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Music2, RotateCcw, Timer } from 'lucide-react'
import StaffDisplay from '../../components/StaffDisplay/StaffDisplay'
import VirtualPiano from '../../components/VirtualPiano/VirtualPiano'
import CharacterReward from '../../components/CharacterReward/CharacterReward'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore, DIFFICULTY_CONFIGS } from '../../store/gameStore'
import { sampleN } from '../../utils/musicTheory'

const NOTES_PER_STAFF = 4

// ── Note pools ──────────────────────────────────────────────────────────────

const TREBLE_BASE = [
  { vexKey: 'c/4', fr: 'Do',  midi: 60 },
  { vexKey: 'd/4', fr: 'Ré',  midi: 62 },
  { vexKey: 'e/4', fr: 'Mi',  midi: 64 },
  { vexKey: 'f/4', fr: 'Fa',  midi: 65 },
  { vexKey: 'g/4', fr: 'Sol', midi: 67 },
  { vexKey: 'a/4', fr: 'La',  midi: 69 },
  { vexKey: 'b/4', fr: 'Si',  midi: 71 },
]

const TREBLE_EXTENDED = [
  { vexKey: 'a/3', fr: 'La',  midi: 57, ledger: true },
  { vexKey: 'b/3', fr: 'Si',  midi: 59, ledger: true },
  { vexKey: 'c/5', fr: 'Do',  midi: 72, ledger: true },
  { vexKey: 'd/5', fr: 'Ré',  midi: 74, ledger: true },
  { vexKey: 'e/5', fr: 'Mi',  midi: 76, ledger: true },
]

const BASS_BASE = [
  { vexKey: 'c/3', fr: 'Do',  midi: 48 },
  { vexKey: 'd/3', fr: 'Ré',  midi: 50 },
  { vexKey: 'e/3', fr: 'Mi',  midi: 52 },
  { vexKey: 'f/3', fr: 'Fa',  midi: 53 },
  { vexKey: 'g/3', fr: 'Sol', midi: 55 },
  { vexKey: 'a/3', fr: 'La',  midi: 57 },
  { vexKey: 'b/3', fr: 'Si',  midi: 59 },
]

const BASS_EXTENDED = [
  { vexKey: 'a/2', fr: 'La',  midi: 45, ledger: true },
  { vexKey: 'b/2', fr: 'Si',  midi: 47, ledger: true },
  { vexKey: 'c/4', fr: 'Do',  midi: 60, ledger: true },
  { vexKey: 'd/4', fr: 'Ré',  midi: 62, ledger: true },
]

// ── Adaptive difficulty helpers ─────────────────────────────────────────────

function isBaseMastered(noteErrors, clef) {
  const prefix = clef + ':'
  let total = 0, correct = 0
  for (const [key, stats] of Object.entries(noteErrors)) {
    if (key.startsWith(prefix)) {
      total += stats.total
      correct += stats.total - stats.wrong
    }
  }
  return total >= 20 && (correct / total) > 0.8
}

function weightedPick(pool, noteErrors, clef, weightBoost) {
  const weights = pool.map((note) => {
    const key = `${clef}:${note.fr}:${note.vexKey}`
    const stats = noteErrors[key]
    if (!stats || stats.total < 3) return 1
    const errorRate = stats.wrong / stats.total
    return 1 + errorRate * weightBoost
  })

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * totalWeight
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function pickChoices(pool, target, strategy) {
  const others = pool.filter((n) => n.midi !== target.midi)

  if (strategy === 'wide') {
    // Spread choices far apart - sort by distance descending, pick evenly spaced
    const sorted = [...others].sort((a, b) => Math.abs(b.midi - target.midi) - Math.abs(a.midi - target.midi))
    const picked = []
    const step = Math.max(1, Math.floor(sorted.length / 3))
    for (let i = 0; i < sorted.length && picked.length < 3; i += step) {
      picked.push(sorted[i])
    }
    // Fill if needed
    while (picked.length < 3 && others.length >= 3) {
      const remaining = others.filter((n) => !picked.includes(n))
      if (remaining.length === 0) break
      picked.push(remaining[Math.floor(Math.random() * remaining.length)])
    }
    return sampleN([target, ...picked.slice(0, 3)], Math.min(4, picked.length + 1))
  }

  if (strategy === 'tight') {
    // Close notes - sort by distance ascending, pick 3 closest
    const sorted = [...others].sort((a, b) => Math.abs(a.midi - target.midi) - Math.abs(b.midi - target.midi))
    const wrongs = sorted.slice(0, Math.min(5, sorted.length))
    return sampleN([target, ...sampleN(wrongs, Math.min(3, wrongs.length))], 4)
  }

  if (strategy === 'adjacent') {
    // Only adjacent notes (within 4 semitones)
    const adjacent = others.filter((n) => Math.abs(n.midi - target.midi) <= 4)
    const candidates = adjacent.length >= 3 ? adjacent : others
    const sorted = [...candidates].sort((a, b) => Math.abs(a.midi - target.midi) - Math.abs(b.midi - target.midi))
    return sampleN([target, ...sorted.slice(0, 3)], 4)
  }

  // Normal: random 3
  const wrongs = sampleN(others, Math.min(3, others.length))
  return sampleN([target, ...wrongs], Math.min(4, wrongs.length + 1))
}

function generateSequence(clef, noteErrors, difficultyLevel) {
  const config = DIFFICULTY_CONFIGS[difficultyLevel] || DIFFICULTY_CONFIGS.normal
  const base = clef === 'treble' ? TREBLE_BASE : BASS_BASE
  const ext = clef === 'treble' ? TREBLE_EXTENDED : BASS_EXTENDED
  const useLedger = config.forceLedger || isBaseMastered(noteErrors, clef)
  const pool = useLedger ? [...base, ...ext] : base

  return Array.from({ length: NOTES_PER_STAFF }, () => {
    const target = weightedPick(pool, noteErrors, clef, config.weightBoost)
    const choices = pickChoices(pool, target, config.choiceStrategy)
    return { target, choices }
  })
}

function getNextClef(currentClef, sequenceCount, difficultyLevel) {
  const config = DIFFICULTY_CONFIGS[difficultyLevel] || DIFFICULTY_CONFIGS.normal

  switch (config.clefMode) {
    case 'treble-only':
      return 'treble'
    case 'alternate-slow':
      // Switch every 2 sequences
      return sequenceCount % 4 < 2 ? 'treble' : 'bass'
    case 'alternate-fast':
      // Switch every sequence
      return currentClef === 'treble' ? 'bass' : 'treble'
    case 'random':
      return Math.random() < 0.5 ? 'treble' : 'bass'
    default:
      return currentClef === 'treble' ? 'bass' : 'treble'
  }
}

function panelStyle() {
  return {
    boxShadow: 'var(--panel-shadow, none)',
    borderColor: 'var(--panel-border)',
    transition: 'box-shadow 0.7s, border-color 0.7s',
  }
}

// ── Chrono hook ─────────────────────────────────────────────────────────────

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
      setElapsed(((Date.now() - startRef.current) / 1000))
    }, 100)
    return () => clearInterval(id)
  }, [running])

  return { elapsed, startTime: startRef.current }
}

// ── Session timer hook ──────────────────────────────────────────────────────

function useSessionTimer() {
  const sessionStartTime = useGameStore((s) => s.sessionStartTime)
  const [sessionElapsed, setSessionElapsed] = useState(0)

  useEffect(() => {
    if (!sessionStartTime) return
    const id = setInterval(() => {
      setSessionElapsed(((Date.now() - sessionStartTime) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [sessionStartTime])

  return sessionElapsed
}

// ── Component ────────────────────────────────────────────────────────────────

export default function BeginnerMode() {
  const difficultyLevel = useGameStore((s) => s.difficultyLevel)
  const diffConfig = DIFFICULTY_CONFIGS[difficultyLevel] || DIFFICULTY_CONFIGS.normal
  const [clef, setClef] = useState(diffConfig.clefMode === 'treble-only' ? 'treble' : 'treble')
  const [sequenceCount, setSequenceCount] = useState(0)
  const noteErrors = useGameStore((s) => s.noteErrors)
  const [sequence, setSequence] = useState(() => generateSequence('treble', noteErrors, difficultyLevel))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [wrongAnswer, setWrongAnswer] = useState(null)
  const [chronoKey, setChronoKey] = useState(0)

  const recordAnswer = useGameStore((s) => s.recordAnswer)
  const recordNoteError = useGameStore((s) => s.recordNoteError)
  const unicornLevel = useGameStore((s) => s.progress.beginner.unicornLevel ?? 0)
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const sessionComplete = useGameStore((s) => s.sessionComplete)
  const { playSuccess, playFailure, playNote } = useAudio()

  const { elapsed, startTime } = useChrono(!busy ? chronoKey : false)
  const sessionElapsed = useSessionTimer()

  // Chrono display helpers
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
    const nextClef = getNextClef(clef, newCount, difficultyLevel)
    const errors = useGameStore.getState().noteErrors
    setClef(nextClef)
    setSequenceCount(newCount)
    setSequence(generateSequence(nextClef, errors, difficultyLevel))
    setCurrentIdx(0)
    setResults([])
    setBusy(false)
    setWrongAnswer(null)
    setChronoKey((k) => k + 1)
  }, [clef, sequenceCount, difficultyLevel])

  const handleAnswer = useCallback(
    (isCorrect, answeredMidi) => {
      if (busy || sessionComplete) return
      setBusy(true)

      const current = sequence[currentIdx]
      const noteKey = `${clef}:${current.target.fr}:${current.target.vexKey}`
      const responseTimeMs = Date.now() - startTime

      recordAnswer({ correct: isCorrect, exerciseId: 'note-reading', responseTimeMs })
      recordNoteError(noteKey, isCorrect)

      playNote(current.target.midi, '4n')

      if (isCorrect) {
        playSuccess()
        setWrongAnswer(null)
      } else {
        playFailure()
        if (answeredMidi && answeredMidi !== current.target.midi) {
          setWrongAnswer(answeredMidi)
        }
      }

      const newResults = [...results, isCorrect ? 'correct' : 'wrong']
      setResults(newResults)

      const isLast = currentIdx >= NOTES_PER_STAFF - 1
      const feedbackDelay = isCorrect ? 350 : 800

      setTimeout(() => {
        setWrongAnswer(null)
        if (isLast) {
          setTimeout(() => startNext(), 400)
        } else {
          setCurrentIdx((i) => i + 1)
          setBusy(false)
          setChronoKey((k) => k + 1)
        }
      }, feedbackDelay)
    },
    [busy, sessionComplete, currentIdx, results, sequence, clef, startTime, recordAnswer, recordNoteError, playSuccess, playFailure, playNote, startNext],
  )

  const handlePianoClick = useCallback(
    (midi) => {
      if (busy || sessionComplete) return
      const isCorrect = midi === sequence[currentIdx].target.midi
      handleAnswer(isCorrect, midi)
    },
    [busy, sessionComplete, sequence, currentIdx, handleAnswer],
  )

  const handleButtonClick = useCallback(
    (note) => {
      if (busy || sessionComplete) return
      const isCorrect = note.midi === sequence[currentIdx].target.midi
      handleAnswer(isCorrect, note.midi)
    },
    [busy, sessionComplete, sequence, currentIdx, handleAnswer],
  )

  // ── Derived ──

  const noteKeys = useMemo(() => sequence.map((n) => n.target.vexKey), [sequence])

  const noteStates = useMemo(
    () =>
      sequence.map((_, i) => {
        if (i < results.length) return results[i]
        if (i === currentIdx) return 'current'
        return 'upcoming'
      }),
    [sequence, results, currentIdx],
  )

  const current = sequence[currentIdx]
  const choices = current?.choices ?? []
  const seqCorrect = results.filter((r) => r === 'correct').length
  const seqTotal = results.length

  const pianoHighlight = busy && results.length > currentIdx ? [current.target.midi] : []
  const pianoWrong = wrongAnswer ? [wrongAnswer] : []

  const useLedger = diffConfig.forceLedger || isBaseMastered(noteErrors, clef)
  const pianoStart = clef === 'treble' ? (useLedger ? 57 : 60) : (useLedger ? 45 : 48)
  const pianoOctaves = useLedger ? 2 : 1
  const showLedgerBadge = useLedger

  // Format session timer
  const sessionMin = Math.floor(sessionElapsed / 60)
  const sessionSec = Math.floor(sessionElapsed % 60)
  const sessionTimeStr = sessionMin > 0
    ? `${sessionMin}:${sessionSec.toString().padStart(2, '0')}`
    : `${sessionSec}s`

  return (
    <div className="w-full max-w-6xl animate-fade-in">
      {/* ── Header ── */}
      <div className="text-center mb-3">
        <div className="flex items-center gap-2 justify-center text-primary-500 dark:text-primary-400 mb-1">
          <Music2 className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Lecture de note</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold">
            {diffConfig.emoji} {diffConfig.label}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Identifie chaque note
          <span className="text-primary-600 dark:text-primary-300">
            {' '}{'—'} Clé de {clef === 'treble' ? 'Sol \u{1D11E}' : 'Fa \u{1D122}'}
          </span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Clique un bouton ou joue la note au piano
          {showLedgerBadge && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
              + lignes supplémentaires
            </span>
          )}
        </p>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* ── Left column: Staff + Chrono + Piano + Buttons ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Staff */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <StaffDisplay mode="sequence" keys={noteKeys} clef={clef} noteStates={noteStates} />
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Note {Math.min(currentIdx + 1, NOTES_PER_STAFF)}/{NOTES_PER_STAFF}
              </span>

              {/* ── Note Chrono ── */}
              <div className={`flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums ${chronoColor} transition-colors`}>
                <Timer className="w-3.5 h-3.5" />
                <span>{elapsed.toFixed(1)}s</span>
                {!busy && (
                  <span className="text-[10px] font-semibold ml-1">
                    {elapsed < fastThreshold
                      ? '+2'
                      : elapsed <= slowThreshold
                        ? '+1'
                        : '+0'}
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

          {/* Piano */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <VirtualPiano
              startMidi={pianoStart}
              octaves={pianoOctaves}
              onNoteClick={handlePianoClick}
              highlightMidi={pianoHighlight}
              wrongMidi={pianoWrong}
              showLabels={false}
            />
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {choices.map((note) => {
              const isCorrect = note.midi === current.target.midi
              const isWrongPressed = busy && wrongAnswer === note.midi
              let extra = ''
              if (busy && results.length > currentIdx) {
                extra = isCorrect
                  ? 'ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40'
                  : isWrongPressed
                    ? 'ring-2 ring-red-400 bg-red-100 dark:bg-red-900/40'
                    : 'opacity-40'
              }

              return (
                <button
                  key={note.midi}
                  disabled={busy || sessionComplete}
                  onClick={() => handleButtonClick(note)}
                  className={[
                    'py-3 min-h-[44px] rounded-xl text-sm sm:text-base font-semibold transition-all duration-150',
                    'glass border border-gray-200 dark:border-white/10 hover:border-primary-400/60',
                    'hover:bg-primary-50 dark:hover:bg-primary-900/30 active:scale-95',
                    'disabled:cursor-not-allowed',
                    extra,
                  ].join(' ')}
                  style={{ borderColor: busy ? undefined : 'var(--panel-border)' }}
                >
                  {note.fr}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right column: Character Reward + Progress ── */}
        <div
          className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-3 self-start"
        >
          {/* Session timer & progress */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Progression</span>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                {sessionTimeStr}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 mb-1.5">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (unicornLevel / 50) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
              <span>{unicornLevel}/50</span>
              <span>Badge</span>
            </div>
          </div>

          {/* Character */}
          <div
            className="glass rounded-2xl p-3 sm:p-4"
            style={panelStyle()}
          >
            <CharacterReward character={selectedCharacter} level={unicornLevel} />
          </div>
        </div>
      </div>
    </div>
  )
}

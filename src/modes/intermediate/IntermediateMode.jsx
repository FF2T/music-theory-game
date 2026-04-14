import { useState, useEffect, useCallback, useMemo } from 'react'
import { Layers, Timer, Play } from 'lucide-react'
import StaffDisplay from '../../components/StaffDisplay/StaffDisplay'
import CharacterReward from '../../components/CharacterReward/CharacterReward'
import { Button } from '../../components/ui/Button'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore, INTERVAL_DIFFICULTY_CONFIGS, DIFFICULTY_CONFIGS, getProgress } from '../../store/gameStore'
import {
  INTERVALS,
  TREBLE_NOTES,
  BASS_NOTES,
  intervalUpperNote,
  sampleN,
  pickRandom,
} from '../../utils/musicTheory'

// ── Constants ────────────────────────────────────────────────────────────────

const INTERVALS_PER_ROUND = 4

// Root note pools (narrower for easier difficulties)
const TREBLE_ROOTS_NARROW = TREBLE_NOTES.slice(0, 7) // C4–B4
const TREBLE_ROOTS_WIDE = TREBLE_NOTES.slice(0, 10)  // C4–E5
const BASS_ROOTS_NARROW = BASS_NOTES.slice(2, 9)     // B2–A3
const BASS_ROOTS_WIDE = BASS_NOTES

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIntervalPool(difficultyLevel) {
  const config = INTERVAL_DIFFICULTY_CONFIGS[difficultyLevel] || INTERVAL_DIFFICULTY_CONFIGS.normal
  return INTERVALS.filter((iv) => config.intervals.includes(iv.abbr))
}

function getRootPool(clef, difficultyLevel) {
  const hard = difficultyLevel === 'difficile' || difficultyLevel === 'expert'
  if (clef === 'bass') return hard ? BASS_ROOTS_WIDE : BASS_ROOTS_NARROW
  return hard ? TREBLE_ROOTS_WIDE : TREBLE_ROOTS_NARROW
}

function pickIntervalChoices(pool, target, count) {
  const others = pool.filter((iv) => iv.semitones !== target.semitones)
  // Prefer intervals close in semitones for harder distractors
  const sorted = [...others].sort((a, b) =>
    Math.abs(a.semitones - target.semitones) - Math.abs(b.semitones - target.semitones)
  )
  const picked = sorted.slice(0, count - 1)
  return sampleN([target, ...picked], count)
}

function generateIntervalSequence(clef, difficultyLevel) {
  const config = INTERVAL_DIFFICULTY_CONFIGS[difficultyLevel] || INTERVAL_DIFFICULTY_CONFIGS.normal
  const pool = getIntervalPool(difficultyLevel)
  const roots = getRootPool(clef, difficultyLevel)
  const sequence = []

  for (let i = 0; i < INTERVALS_PER_ROUND; i++) {
    const root = pickRandom(roots)
    const target = pickRandom(pool)
    const descending = config.allowDescending && Math.random() < 0.4

    // Compute upper note
    const upper = intervalUpperNote(root.vexKey, target.semitones)

    const choices = pickIntervalChoices(pool, target, config.choiceCount)

    sequence.push({
      root,
      upper,
      target,
      choices,
      descending,
    })
  }
  return sequence
}

function getNextClef(currentClef, count, difficultyLevel) {
  const config = INTERVAL_DIFFICULTY_CONFIGS[difficultyLevel] || INTERVAL_DIFFICULTY_CONFIGS.normal
  const mode = config.clefMode
  if (mode === 'treble-only') return 'treble'
  if (mode === 'random') return Math.random() < 0.5 ? 'treble' : 'bass'
  if (mode === 'alternate-slow') return count % 3 === 2 ? (currentClef === 'treble' ? 'bass' : 'treble') : currentClef
  if (mode === 'alternate-fast') return currentClef === 'treble' ? 'bass' : 'treble'
  return 'treble'
}

// Persistent panel style helper
function panelStyle() {
  return { borderColor: 'var(--panel-border, transparent)' }
}

// ── Chrono hook ──────────────────────────────────────────────────────────────

function useChrono(key) {
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (key === false) return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [key])
  const elapsed = (now - start) / 1000
  return { elapsed: key === false ? 0 : elapsed, startTime: start }
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

export default function IntermediateMode() {
  const difficultyLevel = useGameStore((s) => s.difficultyLevel)
  const diffConfig = INTERVAL_DIFFICULTY_CONFIGS[difficultyLevel] || INTERVAL_DIFFICULTY_CONFIGS.normal
  const visualDiffConfig = DIFFICULTY_CONFIGS[difficultyLevel] || DIFFICULTY_CONFIGS.normal

  const [clef, setClef] = useState('treble')
  const [sequenceCount, setSequenceCount] = useState(0)
  const [sequence, setSequence] = useState(() => generateIntervalSequence('treble', difficultyLevel))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [wrongAnswer, setWrongAnswer] = useState(null)
  const [chronoKey, setChronoKey] = useState(0)
  const [played, setPlayed] = useState(false)

  const recordAnswer = useGameStore((s) => s.recordAnswer)
  const unicornLevel = useGameStore((s) => getProgress(s).intermediate.unicornLevel ?? 0)
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const sessionComplete = useGameStore((s) => s.sessionComplete)
  const { playFailure, playNote, playMelody } = useAudio()

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
    const nextClef = getNextClef(clef, newCount, difficultyLevel)
    setClef(nextClef)
    setSequenceCount(newCount)
    setSequence(generateIntervalSequence(nextClef, difficultyLevel))
    setCurrentIdx(0)
    setResults([])
    setBusy(false)
    setPlayed(false)
    setChronoKey((k) => k + 1)
  }, [clef, sequenceCount, difficultyLevel])

  const current = sequence[currentIdx]

  // Auto-play interval on new question
  useEffect(() => {
    if (diffConfig.autoPlay && current && !played && !busy) {
      const rootMidi = current.root.midi
      const upperMidi = current.upper.midi
      if (current.descending) {
        playMelody([rootMidi + current.target.semitones, rootMidi], 100)
      } else {
        playMelody([rootMidi, upperMidi], 100)
      }
      setPlayed(true)
    }
  }, [currentIdx, sequenceCount]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePlayInterval() {
    if (!current) return
    const rootMidi = current.root.midi
    const upperMidi = current.upper.midi
    if (current.descending) {
      playMelody([rootMidi + current.target.semitones, rootMidi], 100)
    } else {
      playMelody([rootMidi, upperMidi], 100)
    }
    setPlayed(true)
  }

  const handleAnswer = useCallback(
    (isCorrect, answeredAbbr) => {
      if (busy || sessionComplete) return
      setBusy(true)

      const responseTimeMs = Date.now() - startTime
      recordAnswer({ correct: isCorrect, exerciseId: 'intervals', responseTimeMs })

      if (isCorrect) {
        // Play the interval melodically
        const rootMidi = current.root.midi
        const upperMidi = current.upper.midi
        if (current.descending) {
          playMelody([rootMidi + current.target.semitones, rootMidi], 120)
        } else {
          playMelody([rootMidi, upperMidi], 120)
        }
        setWrongAnswer(null)

        const newResults = [...results, 'correct']
        setResults(newResults)

        const isLast = currentIdx >= INTERVALS_PER_ROUND - 1
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
        setWrongAnswer(answeredAbbr)
        setTimeout(() => {
          setWrongAnswer(null)
          setBusy(false)
        }, 800)
      }
    },
    [busy, sessionComplete, currentIdx, results, current, startTime, recordAnswer, playFailure, playMelody, startNext],
  )

  // ── Derived ──

  const choices = current?.choices ?? []
  const seqCorrect = results.filter((r) => r === 'correct').length
  const seqTotal = results.length

  // Staff keys
  const staffKeys = useMemo(() => {
    if (!current) return []
    if (current.descending) {
      return [current.upper.vexKey, current.root.vexKey]
    }
    return [current.root.vexKey, current.upper.vexKey]
  }, [current])

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
        <div className="flex items-center gap-2 justify-center text-blue-500 dark:text-blue-400 mb-1">
          <Layers className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Intervalles</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
            {diffConfig.emoji} {diffConfig.label}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Identifie l'intervalle
          <span className="text-blue-600 dark:text-blue-300">
            {' '}{'—'} Clé de {clef === 'treble' ? 'Sol \u{1D11E}' : 'Fa \u{1D122}'}
          </span>
        </h2>
        {current?.descending && (
          <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 font-semibold">
            ↓ Intervalle descendant
          </p>
        )}
      </div>

      {/* Main 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Staff */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <StaffDisplay mode="interval" keys={staffKeys} clef={clef} />
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Intervalle {Math.min(currentIdx + 1, INTERVALS_PER_ROUND)}/{INTERVALS_PER_ROUND}
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
              onClick={handlePlayInterval}
              className="gap-2"
              disabled={busy || sessionComplete}
            >
              <Play className="w-4 h-4 fill-current" />
              Écouter
            </Button>
          </div>

          {/* Answer buttons */}
          <div className={`grid gap-2 ${choices.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {choices.map((interval) => {
              const isCorrect = interval.semitones === current.target.semitones
              const isWrongPressed = busy && wrongAnswer === interval.abbr
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
                  key={interval.abbr}
                  disabled={busy || sessionComplete}
                  onClick={() => handleAnswer(isCorrect, interval.abbr)}
                  className={[
                    'py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-150',
                    'glass border border-gray-200 dark:border-white/10 hover:border-blue-400/60',
                    'hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95',
                    'disabled:cursor-not-allowed',
                    extra,
                  ].join(' ')}
                >
                  <div>{interval.name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {interval.semitones} demi-ton{interval.semitones > 1 ? 's' : ''}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right column: Character + Progress */}
        <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-3 self-start">
          {/* Session timer & progress */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Progression</span>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{sessionTimeStr}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 mb-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (unicornLevel / 50) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
              <span>{unicornLevel}/50</span>
              <span>Badge</span>
            </div>
          </div>

          {/* Character */}
          <div className="glass rounded-2xl p-3 sm:p-4" style={panelStyle()}>
            <CharacterReward character={selectedCharacter} level={unicornLevel} difficulty={difficultyLevel} />
          </div>
        </div>
      </div>
    </div>
  )
}

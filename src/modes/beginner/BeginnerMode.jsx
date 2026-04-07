import { useState, useCallback, useMemo } from 'react'
import { Music2, RotateCcw } from 'lucide-react'
import StaffDisplay from '../../components/StaffDisplay/StaffDisplay'
import VirtualPiano from '../../components/VirtualPiano/VirtualPiano'
import UnicornReward from '../../components/UnicornReward/UnicornReward'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore } from '../../store/gameStore'
import { pickRandom, sampleN } from '../../utils/musicTheory'

const NOTES_PER_STAFF = 4

// Single-octave pools (7 natural notes each, no duplicates)
const TREBLE_POOL = [
  { vexKey: 'c/4', fr: 'Do',  midi: 60 },
  { vexKey: 'd/4', fr: 'Ré',  midi: 62 },
  { vexKey: 'e/4', fr: 'Mi',  midi: 64 },
  { vexKey: 'f/4', fr: 'Fa',  midi: 65 },
  { vexKey: 'g/4', fr: 'Sol', midi: 67 },
  { vexKey: 'a/4', fr: 'La',  midi: 69 },
  { vexKey: 'b/4', fr: 'Si',  midi: 71 },
]

const BASS_POOL = [
  { vexKey: 'c/3', fr: 'Do',  midi: 48 },
  { vexKey: 'd/3', fr: 'Ré',  midi: 50 },
  { vexKey: 'e/3', fr: 'Mi',  midi: 52 },
  { vexKey: 'f/3', fr: 'Fa',  midi: 53 },
  { vexKey: 'g/3', fr: 'Sol', midi: 55 },
  { vexKey: 'a/3', fr: 'La',  midi: 57 },
  { vexKey: 'b/3', fr: 'Si',  midi: 59 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSequence(clef) {
  const pool = clef === 'treble' ? TREBLE_POOL : BASS_POOL
  return Array.from({ length: NOTES_PER_STAFF }, () => {
    const target = pickRandom(pool)
    const wrongs = sampleN(pool.filter((n) => n.midi !== target.midi), 3)
    const choices = sampleN([target, ...wrongs], 4)
    return { target, choices }
  })
}

/** Panel style that glows based on unicorn level (reads CSS vars from parent). */
function panelStyle() {
  return {
    boxShadow: 'var(--panel-shadow, none)',
    borderColor: 'var(--panel-border, rgba(255,255,255,0.1))',
    transition: 'box-shadow 0.7s, border-color 0.7s',
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function BeginnerMode() {
  const [clef, setClef] = useState('treble')
  const [sequence, setSequence] = useState(() => generateSequence('treble'))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)

  const recordAnswer = useGameStore((s) => s.recordAnswer)
  const resetUnicorn = useGameStore((s) => s.resetUnicorn)
  const unicornLevel = useGameStore((s) => s.progress.beginner.unicornLevel ?? 0)
  const { playSuccess, playFailure } = useAudio()

  // ── Actions ──

  const startNext = useCallback(() => {
    const next = clef === 'treble' ? 'bass' : 'treble'
    setClef(next)
    setSequence(generateSequence(next))
    setCurrentIdx(0)
    setResults([])
    setBusy(false)
  }, [clef])

  const handleAnswer = useCallback(
    (isCorrect) => {
      if (busy) return
      setBusy(true)

      recordAnswer({ correct: isCorrect, exerciseId: 'note-reading' })
      if (isCorrect) playSuccess(); else playFailure()

      const newResults = [...results, isCorrect ? 'correct' : 'wrong']
      setResults(newResults)

      const isLast = currentIdx >= NOTES_PER_STAFF - 1
      setTimeout(() => {
        if (isLast) {
          setTimeout(() => startNext(), 900)
        } else {
          setCurrentIdx((i) => i + 1)
          setBusy(false)
        }
      }, 700)
    },
    [busy, currentIdx, results, recordAnswer, playSuccess, playFailure, startNext],
  )

  /** Piano key click → answer if it matches the note name (any octave in pool). */
  const handlePianoClick = useCallback(
    (midi) => {
      if (busy) return
      const isCorrect = midi === sequence[currentIdx].target.midi
      handleAnswer(isCorrect)
    },
    [busy, sequence, currentIdx, handleAnswer],
  )

  const handleResetUnicorn = useCallback(() => {
    if (window.confirm('Remettre la licorne à zéro ?')) {
      resetUnicorn()
    }
  }, [resetUnicorn])

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

  // Highlight correct key on piano after answering
  const pianoHighlight = busy && results.length > currentIdx ? [current.target.midi] : []

  // Piano — single octave matching the clef
  const pianoStart = clef === 'treble' ? 60 : 48
  const pianoOctaves = 1

  return (
    <div className="w-full max-w-6xl animate-fade-in">
      {/* ── Header ── */}
      <div className="text-center mb-3">
        <div className="flex items-center gap-2 justify-center text-primary-400 mb-1">
          <Music2 className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Lecture de note</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          Identifie chaque note
          <span className="text-primary-300">
            {' '}— Clé de {clef === 'treble' ? 'Sol 𝄞' : 'Fa 𝄢'}
          </span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">Clique un bouton ou joue la note au piano</p>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* ── Left column: Staff + Piano + Buttons ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Staff */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <StaffDisplay mode="sequence" keys={noteKeys} clef={clef} noteStates={noteStates} />
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-gray-500">
                Note {Math.min(currentIdx + 1, NOTES_PER_STAFF)}/{NOTES_PER_STAFF}
              </span>
              {seqTotal > 0 && (
                <span className="text-xs text-gray-500">
                  {seqCorrect}/{seqTotal} correct{seqCorrect > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Piano — always visible, acts as answer input */}
          <div className="glass rounded-2xl p-3" style={panelStyle()}>
            <VirtualPiano
              startMidi={pianoStart}
              octaves={pianoOctaves}
              onNoteClick={handlePianoClick}
              highlightMidi={pianoHighlight}
            />
          </div>

          {/* Answer buttons */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {choices.map((note) => {
              const isCorrect = note.midi === current.target.midi
              let extra = ''
              if (busy && results.length > currentIdx) {
                extra = isCorrect
                  ? 'ring-2 ring-green-400 bg-green-900/40'
                  : 'opacity-40'
              }

              return (
                <button
                  key={note.midi}
                  disabled={busy}
                  onClick={() => handleAnswer(isCorrect)}
                  className={[
                    'py-3 min-h-[44px] rounded-xl text-sm sm:text-base font-semibold transition-all duration-150',
                    'glass border border-white/10 hover:border-primary-400/60',
                    'hover:bg-primary-900/30 active:scale-95',
                    'disabled:cursor-not-allowed',
                    extra,
                  ].join(' ')}
                  style={{ borderColor: busy ? undefined : 'var(--panel-border, rgba(255,255,255,0.1))' }}
                >
                  {note.fr}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right column: Unicorn ── */}
        <div
          className="w-full lg:w-[280px] flex-shrink-0 glass rounded-2xl p-3 sm:p-4 self-start"
          style={panelStyle()}
        >
          {/* Reset button */}
          <div className="flex justify-end mb-1">
            <button
              onClick={handleResetUnicorn}
              className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
              title="Remettre la licorne à zéro"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
          <UnicornReward level={unicornLevel} />
        </div>
      </div>
    </div>
  )
}

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { BookOpen, Mic, MicOff, RotateCcw, ArrowLeft } from 'lucide-react'
import StaffDisplay from '../../components/StaffDisplay/StaffDisplay'
import VirtualPiano from '../../components/VirtualPiano/VirtualPiano'
import { useAudio } from '../../hooks/useAudio'
import { useGameStore, DIFFICULTY_CONFIGS } from '../../store/gameStore'
import { EXERCISES, bassToTreble, vexKeyToFrench, vexKeyToMidi, displayNoteName } from './exercises'
import { sampleN } from '../../utils/musicTheory'

// ── Constants ───────────────────────────────────────────────────────────────

const WINDOW_SIZE = 6
const ALL_NOTES_FR = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si']

// ── Speech recognition aliases ──────────────────────────────────────────────

const SPEECH_ALIASES = {
  'do': 'Do', 'dose': 'Do', 'doh': 'Do',
  'ré': 'Ré', 're': 'Ré', 'raie': 'Ré', 'ray': 'Ré',
  'mi': 'Mi', 'mis': 'Mi', 'me': 'Mi',
  'fa': 'Fa', 'fah': 'Fa',
  'sol': 'Sol', 'sole': 'Sol', 'saul': 'Sol',
  'la': 'La', 'là': 'La', 'lah': 'La',
  'si': 'Si', 'see': 'Si', 'scie': 'Si',
  'chut': 'Chut', 'chute': 'Chut', 'shut': 'Chut',
  'fa dièse': 'Fa#', 'fa diese': 'Fa#',
  'do dièse': 'Do#', 'do diese': 'Do#',
  'sol dièse': 'Sol#', 'sol diese': 'Sol#',
  'ré dièse': 'Ré#', 're diese': 'Ré#',
  'la dièse': 'La#', 'la diese': 'La#',
  'si bémol': 'Sib', 'si bemol': 'Sib',
  'mi bémol': 'Mib', 'mi bemol': 'Mib',
  'la bémol': 'Lab', 'la bemol': 'Lab',
}

function normalizeSpeech(text) {
  const cleaned = text.toLowerCase().normalize('NFC').trim()
  if (SPEECH_ALIASES[cleaned]) return SPEECH_ALIASES[cleaned]
  const words = cleaned.split(/\s+/)
  if (words.length >= 2) {
    const pair = words.slice(-2).join(' ')
    if (SPEECH_ALIASES[pair]) return SPEECH_ALIASES[pair]
  }
  const last = words[words.length - 1]
  if (SPEECH_ALIASES[last]) return SPEECH_ALIASES[last]
  return null
}

// ── Choice generation ───────────────────────────────────────────────────────

function generateChoices(correctFr, isRest) {
  if (isRest) {
    const wrongs = sampleN(ALL_NOTES_FR, 3).map(n => ({ label: n, correct: false }))
    return sampleN([{ label: 'Chut', correct: true }, ...wrongs], 4)
  }
  const baseName = correctFr.replace(/#|b/g, '')
  const pool = ALL_NOTES_FR.filter(n => n !== baseName)
  const wrongs = sampleN(pool, 3).map(n => ({ label: n, correct: false }))
  return sampleN([{ label: correctFr, correct: true }, ...wrongs], 4)
}

// ── Speech recognition hook ─────────────────────────────────────────────────

function useSpeechRecognition(onResult, active) {
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    if (!active) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const r = new SR()
    r.lang = 'fr-FR'
    r.continuous = true
    r.interimResults = false
    r.maxAlternatives = 3

    r.onresult = (e) => {
      const result = e.results[e.results.length - 1]
      if (!result.isFinal) return
      for (let i = 0; i < result.length; i++) {
        const note = normalizeSpeech(result[i].transcript)
        if (note) { onResultRef.current(note); return }
      }
    }

    r.onend = () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.start() } catch { /* ignore */ }
      }
    }

    r.onerror = () => {}

    try { r.start() } catch { /* ignore */ }
    recognitionRef.current = r

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [active])

  return typeof (window.SpeechRecognition || window.webkitSpeechRecognition) !== 'undefined'
}

// ── Component ───────────────────────────────────────────────────────────────

export default function DannhauserMode() {
  const difficultyLevel = useGameStore(s => s.difficultyLevel)
  const setDifficulty = useGameStore(s => s.setDifficulty)
  const isNormalOrAbove = difficultyLevel !== 'facile'

  // Phase: select | bass | transition | treble | complete
  const [phase, setPhase] = useState('select')
  const [exerciseId, setExerciseId] = useState(null)
  const [noteIndex, setNoteIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [wrongAnswer, setWrongAnswer] = useState(null)
  const [micActive, setMicActive] = useState(false)
  const [lastHeard, setLastHeard] = useState(null)

  const recordAnswer = useGameStore(s => s.recordAnswer)
  const sessionScore = useGameStore(s => s.sessionScore)
  const sessionCorrect = useGameStore(s => s.sessionCorrect)
  const sessionAnswers = useGameStore(s => s.sessionAnswers)
  const startDannhauserSession = useGameStore(s => s.startDannhauserSession)
  const { playNote, playFailure } = useAudio()

  const exercise = useMemo(() => EXERCISES.find(e => e.id === exerciseId), [exerciseId])
  const notes = exercise?.notes || []
  const totalNotes = notes.length

  const currentClef = phase === 'treble' ? 'treble' : 'bass'
  const currentNote = notes[noteIndex]

  // Current note info
  const currentVexKey = useMemo(() => {
    if (!currentNote || currentNote.rest) return null
    return currentClef === 'bass' ? currentNote.key : bassToTreble(currentNote.key)
  }, [currentNote, currentClef])

  const currentFr = useMemo(() => {
    if (!currentNote) return ''
    if (currentNote.rest) return 'Chut'
    return currentVexKey ? vexKeyToFrench(currentVexKey) : ''
  }, [currentNote, currentVexKey])

  // ── Sliding window for staff display ──

  const windowStart = useMemo(
    () => Math.max(0, Math.min(noteIndex - 2, totalNotes - WINDOW_SIZE)),
    [noteIndex, totalNotes],
  )

  const windowKeys = useMemo(() => {
    const end = Math.min(windowStart + WINDOW_SIZE, totalNotes)
    return notes.slice(windowStart, end).map(n => {
      if (n.rest) return 'rest'
      return currentClef === 'bass' ? n.key : bassToTreble(n.key)
    })
  }, [notes, windowStart, totalNotes, currentClef])

  const windowStates = useMemo(() => {
    const end = Math.min(windowStart + WINDOW_SIZE, totalNotes)
    return notes.slice(windowStart, end).map((_, i) => {
      const idx = windowStart + i
      if (idx < noteIndex) return 'correct'
      if (idx === noteIndex) return 'current'
      return 'upcoming'
    })
  }, [noteIndex, windowStart, totalNotes, notes])

  // ── Choices ──

  const choices = useMemo(() => {
    if (!currentNote) return []
    return generateChoices(currentFr, !!currentNote.rest)
  }, [currentNote, currentFr])

  // ── Piano range (computed from exercise notes) ──

  const pianoConfig = useMemo(() => {
    const realNotes = notes.filter(n => !n.rest)
    if (!realNotes.length) return { start: 48, octaves: 1 }
    const midis = realNotes.map(n => {
      const k = currentClef === 'bass' ? n.key : bassToTreble(n.key)
      return vexKeyToMidi(k)
    })
    const min = Math.min(...midis)
    const max = Math.max(...midis)
    const start = Math.floor(min / 12) * 12
    const octaves = Math.max(1, Math.ceil((max - start + 1) / 12))
    return { start, octaves }
  }, [notes, currentClef])

  // ── Answer handling ──

  const handleAnswer = useCallback((answer, viaPiano = false) => {
    if (busy || phase === 'complete' || phase === 'select' || phase === 'transition') return
    setBusy(true)

    const isCorrect = viaPiano
      ? answer === (currentNote?.rest ? null : vexKeyToMidi(currentVexKey))
      : answer === currentFr

    recordAnswer({ correct: isCorrect, exerciseId: `dannhauser-${exerciseId}` })

    if (isCorrect) {
      if (!currentNote.rest && currentVexKey) {
        playNote(vexKeyToMidi(currentVexKey), '4n')
      }
      setWrongAnswer(null)

      const next = noteIndex + 1
      const isDone = next >= totalNotes

      setTimeout(() => {
        if (isDone) {
          setPhase(isNormalOrAbove && phase === 'bass' ? 'transition' : 'complete')
        } else {
          setNoteIndex(next)
        }
        setBusy(false)
      }, isDone ? 600 : 300)
    } else {
      playFailure()
      setWrongAnswer(answer)
      setTimeout(() => {
        setWrongAnswer(null)
        setBusy(false)
      }, 800)
    }
  }, [busy, phase, currentFr, currentNote, currentVexKey, noteIndex, totalNotes, isNormalOrAbove, exerciseId, recordAnswer, playNote, playFailure])

  const handlePianoClick = useCallback(midi => {
    if (busy || currentNote?.rest) return
    handleAnswer(midi, true)
  }, [busy, currentNote, handleAnswer])

  // ── Speech recognition ──

  const handleSpeechResult = useCallback(note => {
    setLastHeard(note)
    handleAnswer(note)
  }, [handleAnswer])

  const hasSpeech = useSpeechRecognition(
    handleSpeechResult,
    micActive && (phase === 'bass' || phase === 'treble'),
  )

  useEffect(() => {
    if (!lastHeard) return
    const t = setTimeout(() => setLastHeard(null), 2000)
    return () => clearTimeout(t)
  }, [lastHeard])

  // ── Actions ──

  function startExercise(id) {
    startDannhauserSession()
    setExerciseId(id)
    setNoteIndex(0)
    setPhase('bass')
    setBusy(false)
    setWrongAnswer(null)
  }

  function continueToTreble() {
    setNoteIndex(0)
    setPhase('treble')
    setBusy(false)
    setWrongAnswer(null)
  }

  function resetToSelect() {
    setPhase('select')
    setExerciseId(null)
    setNoteIndex(0)
    setBusy(false)
    setWrongAnswer(null)
    setMicActive(false)
    setLastHeard(null)
  }

  // ── Piano visual feedback ──

  const correctMidi = currentVexKey ? vexKeyToMidi(currentVexKey) : null
  const pianoHighlight = busy && wrongAnswer === null && correctMidi ? [correctMidi] : []
  const pianoWrong = typeof wrongAnswer === 'number' ? [wrongAnswer] : []

  // ══════════════════════════════════════════════════════════════════════════
  // ── Render: exercise selection ──
  // ══════════════════════════════════════════════════════════════════════════

  if (phase === 'select') {
    return (
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center text-amber-500 dark:text-amber-400 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-widest">Dannhauser</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Solfege des Solfeges — Vol. I
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choisis un exercice de lecture de notes en cle de Fa
          </p>
        </div>

        {/* Difficulty selector */}
        <div className="flex justify-center gap-2 mb-8">
          {['facile', 'normal'].map(key => {
            const config = DIFFICULTY_CONFIGS[key]
            const isSelected = difficultyLevel === key
            return (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={[
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200',
                  'hover:shadow-md active:scale-95',
                  isSelected
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20',
                ].join(' ')}
              >
                <span className="text-lg">{config.emoji}</span>
                <div className="text-left">
                  <span className={[
                    'text-sm font-semibold block',
                    isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300',
                  ].join(' ')}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {key === 'facile' ? 'Cle de Fa uniquement' : 'Fa puis Sol (memes positions)'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {EXERCISES.map(ex => (
            <button
              key={ex.id}
              onClick={() => startExercise(ex.id)}
              className="group relative glass border border-amber-500/20 hover:border-amber-400/50 p-6 rounded-2xl text-left hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {ex.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ex.tempo}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ex.timeSignature} — {ex.composer}
              </p>
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-3 font-medium">
                {ex.notes.length} notes
              </p>
              <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-xl">
                &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Render: transition bass → treble ──
  // ══════════════════════════════════════════════════════════════════════════

  if (phase === 'transition') {
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-in text-center py-12">
        <div className="text-6xl mb-6">&#127881;</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cle de Fa terminee !
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Score : {sessionScore} pts — {sessionCorrect}/{sessionAnswers}{' '}
          correct{sessionCorrect > 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Meme exercice, maintenant en{' '}
          <strong className="text-amber-500">cle de Sol</strong>. Les notes sont
          aux memes positions sur la portee, mais les noms changent !
        </p>
        <button
          onClick={continueToTreble}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg hover:shadow-lg transition-all active:scale-95"
        >
          Continuer en cle de Sol &rarr;
        </button>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Render: complete ──
  // ══════════════════════════════════════════════════════════════════════════

  if (phase === 'complete') {
    const accuracy =
      sessionAnswers > 0 ? Math.round((sessionCorrect / sessionAnswers) * 100) : 0
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-in text-center py-12">
        <div className="text-6xl mb-6">&#127942;</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Exercice termine !
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">
          Score :{' '}
          <span className="font-bold text-amber-500">{sessionScore}</span> pts
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {sessionCorrect}/{sessionAnswers} reponses correctes ({accuracy}%)
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => startExercise(exerciseId)}
            className="px-6 py-3 rounded-xl glass border border-gray-200 dark:border-white/10 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Recommencer
          </button>
          <button
            onClick={resetToSelect}
            className="px-6 py-3 rounded-xl glass border border-gray-200 dark:border-white/10 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Autre exercice
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Render: game (bass or treble phase) ──
  // ══════════════════════════════════════════════════════════════════════════

  const progress = totalNotes > 0 ? (noteIndex / totalNotes) * 100 : 0
  const phaseLabel = isNormalOrAbove
    ? phase === 'bass'
      ? 'Phase 1/2 (Fa)'
      : 'Phase 2/2 (Sol)'
    : null

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      {/* ── Header ── */}
      <div className="text-center mb-3">
        <div className="flex items-center gap-2 justify-center text-amber-500 dark:text-amber-400 mb-1">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Dannhauser — {exercise?.title}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Lis chaque note
          <span className="text-amber-600 dark:text-amber-300">
            {' '}&mdash; Cle de {currentClef === 'bass' ? 'Fa \u{1D122}' : 'Sol \u{1D11E}'}
          </span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Dis la note au micro, clique un bouton, ou joue au piano
          {phaseLabel && ` · ${phaseLabel}`}
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5 mb-1">
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">
        Note {Math.min(noteIndex + 1, totalNotes)} / {totalNotes}
      </p>

      {/* ── Staff ── */}
      <div className="glass rounded-2xl p-3 mb-3">
        <StaffDisplay
          mode="sequence"
          keys={windowKeys}
          clef={currentClef}
          noteStates={windowStates}
        />
      </div>

      {/* ── Piano ── */}
      <div className="glass rounded-2xl p-3 mb-3">
        <VirtualPiano
          startMidi={pianoConfig.start}
          octaves={pianoConfig.octaves}
          onNoteClick={handlePianoClick}
          highlightMidi={pianoHighlight}
          wrongMidi={pianoWrong}
          showLabels
        />
      </div>

      {/* ── Choice buttons ── */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3">
        {choices.map((choice, i) => {
          let extra = ''
          if (busy && wrongAnswer === null) {
            extra = choice.correct
              ? 'ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40'
              : 'opacity-40'
          } else if (busy && wrongAnswer === choice.label) {
            extra = 'ring-2 ring-red-400 bg-red-100 dark:bg-red-900/40'
          }

          return (
            <button
              key={`${choice.label}-${i}`}
              disabled={busy}
              onClick={() => handleAnswer(choice.label)}
              className={[
                'py-3 min-h-[44px] rounded-xl text-sm sm:text-base font-semibold transition-all duration-150',
                'glass border border-gray-200 dark:border-white/10 hover:border-amber-400/60',
                'hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95',
                'disabled:cursor-not-allowed',
                choice.label === 'Chut' ? 'italic text-gray-500 dark:text-gray-400' : '',
                extra,
              ].join(' ')}
            >
              {displayNoteName(choice.label)}
            </button>
          )
        })}
      </div>

      {/* ── Mic button ── */}
      {hasSpeech && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setMicActive(prev => !prev)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all',
              micActive
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse-fast'
                : 'glass border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-amber-400/60',
            ].join(' ')}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {micActive ? 'Micro actif' : 'Activer le micro'}
          </button>
          {lastHeard && (
            <span className="text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
              Entendu :{' '}
              <strong className="text-gray-700 dark:text-gray-200">
                {displayNoteName(lastHeard)}
              </strong>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

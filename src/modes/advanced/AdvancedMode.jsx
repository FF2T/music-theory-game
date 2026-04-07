import { useState, useCallback } from 'react'
import { Zap, Play, Info } from 'lucide-react'
import VirtualPiano from '../../components/VirtualPiano/VirtualPiano'
import StaffDisplay from '../../components/StaffDisplay/StaffDisplay'
import { FeedbackBadge } from '../../components/ui/FeedbackBadge'
import { Button } from '../../components/ui/Button'
import { useExercise } from '../../hooks/useExercise'
import { useAudio } from '../../hooks/useAudio'
import {
  GREEK_MODES,
  CHORD_TYPES,
  buildScale,
  buildChord,
  pickRandom,
  sampleN,
  midiToToneNote,
} from '../../utils/musicTheory'

const EXERCISE_TYPES = ['greek-modes', 'chord-quality']

function toVex(midi) {
  const names = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b']
  return `${names[midi % 12]}/${Math.floor(midi / 12) - 1}`
}

function generateQuestion() {
  const type = pickRandom(EXERCISE_TYPES)

  if (type === 'greek-modes') {
    const root   = 60 + Math.floor(Math.random() * 12) // C4..B4
    const target = pickRandom(GREEK_MODES)
    const scale  = buildScale(root, target.steps)
    const wrongs = sampleN(GREEK_MODES.filter((m) => m.name !== target.name), 3)
    const choices = sampleN([target, ...wrongs], 4)
    return { type, root, target, scale, choices }
  }

  // chord-quality
  const root     = 60 + Math.floor(Math.random() * 12)
  const chordIds = ['maj', 'min', 'dom7', 'maj7', 'min7']
  const targetId = pickRandom(chordIds)
  const target   = { id: targetId, ...CHORD_TYPES[targetId] }
  const midiNotes = buildChord(root, targetId)
  const wrongs    = sampleN(
    chordIds.filter((id) => id !== targetId).map((id) => ({ id, ...CHORD_TYPES[id] })),
    3,
  )
  const choices = sampleN([target, ...wrongs], 4)
  const vexKeys = midiNotes.filter((m) => m < 84).map(toVex)
  return { type, root, target, midiNotes, choices, vexKeys }
}

export default function AdvancedMode() {
  const [question, setQuestion] = useState(() => generateQuestion())
  const { playMelody, playChord } = useAudio()

  const nextQuestion = useCallback(() => setQuestion(generateQuestion()), [])
  const { submit, answered, feedback } = useExercise({ onNext: nextQuestion })

  const isMode  = question.type === 'greek-modes'
  const isChord = question.type === 'chord-quality'

  async function handlePlay() {
    if (isMode) {
      await playMelody(question.scale, 140)
    } else {
      await playChord(question.midiNotes, '2n')
    }
  }

  const rootName = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][question.root % 12]

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-5 sm:gap-8 animate-fade-in">
      <FeedbackBadge feedback={feedback} />

      <div className="text-center">
        <div className="flex items-center gap-2 justify-center text-violet-400 mb-2">
          <Zap className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">
            {isMode ? 'Modes Grecs' : 'Qualité d\'accord'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {isMode
            ? `Quel mode commence sur ${rootName} ?`
            : `Identifie cet accord de ${rootName}`
          }
        </h2>
      </div>

      {/* Staff (chord only) */}
      {isChord && question.vexKeys?.length > 0 && (
        <div className="w-full glass rounded-2xl p-4">
          <StaffDisplay mode="chord" keys={question.vexKeys} />
        </div>
      )}

      {/* Play button */}
      <Button variant="secondary" onClick={handlePlay} className="gap-2">
        <Play className="w-4 h-4 fill-current" />
        {isMode ? 'Écouter la gamme' : 'Écouter l\'accord'}
      </Button>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {question.choices.map((choice) => {
          const id = choice.name ?? choice.id
          const targetId = question.target.name ?? question.target.id
          const isCorrect = id === targetId
          let extra = ''
          if (answered) {
            extra = isCorrect ? 'ring-2 ring-green-400 bg-green-900/40' : 'opacity-40'
          }

          return (
            <button
              key={id}
              disabled={answered}
              onClick={() => submit(isCorrect, question.type)}
              className={[
                'py-3 sm:py-4 px-3 min-h-[44px] rounded-2xl text-sm sm:text-base font-semibold transition-all duration-150 text-left',
                'glass border border-white/10 hover:border-violet-400/60',
                'hover:bg-violet-900/20 active:scale-95 disabled:cursor-not-allowed',
                extra,
              ].join(' ')}
            >
              <div>{choice.name}</div>
              {choice.mood && (
                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />{choice.mood}
                </div>
              )}
              {choice.symbol !== undefined && (
                <div className="text-xs text-gray-500 mt-0.5 font-mono">
                  {rootName}{choice.symbol}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Piano */}
      <div className="w-full glass rounded-2xl p-3 sm:p-4">
        <p className="text-xs text-gray-500 text-center mb-2">Piano de référence</p>
        <VirtualPiano
          startMidi={60}
          octaves={2}
          highlightMidi={answered
            ? (isMode ? question.scale : question.midiNotes).filter((m) => m >= 60 && m <= 84)
            : []}
        />
      </div>
    </div>
  )
}

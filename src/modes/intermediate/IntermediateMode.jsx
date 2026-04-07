import { useState, useCallback } from 'react'
import { Layers, Play } from 'lucide-react'
import StaffDisplay from '../../components/StaffDisplay/StaffDisplay'
import VirtualPiano from '../../components/VirtualPiano/VirtualPiano'
import { FeedbackBadge } from '../../components/ui/FeedbackBadge'
import { Button } from '../../components/ui/Button'
import { useExercise } from '../../hooks/useExercise'
import { useAudio } from '../../hooks/useAudio'
import {
  INTERVALS,
  TREBLE_NOTES,
  sampleN,
  pickRandom,
} from '../../utils/musicTheory'

const EXERCISE_TYPES = ['interval-hear', 'interval-read']

function generateQuestion() {
  const type = pickRandom(EXERCISE_TYPES)
  const root  = pickRandom(TREBLE_NOTES.slice(0, 7)) // C4–B4
  const pool  = INTERVALS.filter((i) => i.semitones <= 8) // keep accessible
  const target = pickRandom(pool)

  const upper = { ...root, midi: root.midi + target.semitones }
  upper.vexKey = `${['c','d','e','f','g','a','b','c','d','e','f','g'][upper.midi % 12 > 11 ? 0 : upper.midi % 12]}/${Math.floor(upper.midi / 12) - 1}`

  const wrongs = sampleN(pool.filter((i) => i.semitones !== target.semitones), 3)
  const choices = sampleN([target, ...wrongs], 4)

  return { type, root, upper, target, choices }
}

// Minimal vexKey converter (avoids circular import)
function toVex(midi) {
  const names = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b']
  const oct   = Math.floor(midi / 12) - 1
  return `${names[midi % 12]}/${oct}`
}

export default function IntermediateMode() {
  const [question, setQuestion] = useState(() => generateQuestion())
  const { playMelody, playChord } = useAudio()

  const nextQuestion = useCallback(() => setQuestion(generateQuestion()), [])
  const { submit, answered, feedback } = useExercise({ onNext: nextQuestion })

  const { root, upper, target, choices } = question

  const rootVex  = toVex(root.midi)
  const upperVex = toVex(upper.midi)

  async function handlePlayInterval() {
    await playMelody([root.midi, upper.midi], 100)
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-5 sm:gap-8 animate-fade-in">
      <FeedbackBadge feedback={feedback} />

      <div className="text-center">
        <div className="flex items-center gap-2 justify-center text-blue-500 dark:text-blue-400 mb-2">
          <Layers className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Intervalles</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Identifie l&apos;intervalle</h2>
      </div>

      {/* Staff showing two notes */}
      <div className="w-full glass rounded-2xl p-4">
        <StaffDisplay mode="interval" keys={[rootVex, upperVex]} />
      </div>

      {/* Play button */}
      <Button
        variant="secondary"
        onClick={handlePlayInterval}
        className="gap-2"
      >
        <Play className="w-4 h-4 fill-current" />
        Écouter l'intervalle
      </Button>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {choices.map((interval) => {
          const isCorrect = interval.semitones === target.semitones
          let extra = ''
          if (answered) {
            extra = isCorrect ? 'ring-2 ring-green-400 bg-green-100 dark:bg-green-900/40' : 'opacity-40'
          }

          return (
            <button
              key={interval.semitones}
              disabled={answered}
              onClick={() => submit(isCorrect, 'intervals')}
              className={[
                'py-3 sm:py-4 min-h-[44px] rounded-2xl text-sm sm:text-base font-semibold transition-all duration-150',
                'glass border border-gray-200 dark:border-white/10 hover:border-blue-400/60',
                'hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 disabled:cursor-not-allowed',
                extra,
              ].join(' ')}
            >
              <div>{interval.name}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{interval.semitones} demi-tons</div>
            </button>
          )
        })}
      </div>

      {/* Piano hint */}
      <div className="w-full glass rounded-2xl p-3 sm:p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2">Piano de référence</p>
        <VirtualPiano
          startMidi={60}
          octaves={2}
          highlightMidi={answered ? [root.midi, upper.midi] : []}
        />
      </div>
    </div>
  )
}

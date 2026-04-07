import { useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAudio } from './useAudio'

/**
 * Generic exercise hook.
 * Provides answer submission logic with feedback and auto-advance.
 *
 * @param {Object} opts
 * @param {() => void} opts.onNext  – called after feedback delay to load the next question
 */
export function useExercise({ onNext }) {
  const recordAnswer  = useGameStore((s) => s.recordAnswer)
  const lastFeedback  = useGameStore((s) => s.lastFeedback)
  const { playSuccess, playFailure } = useAudio()

  const [answered, setAnswered] = useState(false)
  const [startTime] = useState(() => Date.now())

  const submit = useCallback(
    (correct, exerciseId = 'generic') => {
      if (answered) return
      setAnswered(true)

      const responseTimeMs = Date.now() - startTime
      recordAnswer({ correct, exerciseId, responseTimeMs })

      if (correct) playSuccess()
      else         playFailure()

      setTimeout(() => {
        setAnswered(false)
        onNext()
      }, 1400)
    },
    [answered, startTime, recordAnswer, playSuccess, playFailure, onNext],
  )

  return { submit, answered, feedback: lastFeedback }
}

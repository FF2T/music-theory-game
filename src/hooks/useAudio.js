import { useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  playNote,
  playChord,
  playMelody,
  playSuccess,
  playFailure,
  playToneNote,
} from '../utils/audioHelpers'

/**
 * Convenience hook that gates all audio calls through the global audioEnabled flag.
 */
export function useAudio() {
  const audioEnabled = useGameStore((s) => s.audioEnabled)

  const safePlay = useCallback(
    async (fn, ...args) => {
      if (!audioEnabled) return
      try {
        await fn(...args)
      } catch (e) {
        // AudioContext may be suspended; silently ignore
        console.warn('[useAudio] playback error', e)
      }
    },
    [audioEnabled],
  )

  return {
    playNote:     (midi, dur)    => safePlay(playNote,     midi, dur),
    playToneNote: (note, dur)    => safePlay(playToneNote, note, dur),
    playChord:    (midis, dur)   => safePlay(playChord,    midis, dur),
    playMelody:   (midis, bpm)   => safePlay(playMelody,   midis, bpm),
    playSuccess:  ()             => safePlay(playSuccess),
    playFailure:  ()             => safePlay(playFailure),
  }
}

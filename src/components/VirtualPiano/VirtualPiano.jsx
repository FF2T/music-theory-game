import { useState, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

/**
 * Interactive piano keyboard.
 *
 * Props:
 *   startMidi     : first MIDI note (default 60 = C4)
 *   octaves       : number of octaves to display (default 2)
 *   onNoteClick   : (midi: number) => void
 *   highlightMidi : number[]  — keys to highlight (e.g. correct answer)
 *   disabledMidi  : number[]  — keys visually greyed-out
 */
export default function VirtualPiano({
  startMidi = 60,
  octaves = 2,
  onNoteClick,
  highlightMidi = [],
  disabledMidi  = [],
}) {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const { playNote } = useAudio()

  // Build the list of keys for the range
  const totalKeys = octaves * 12 + 1
  const keys = Array.from({ length: totalKeys }, (_, i) => {
    const midi     = startMidi + i
    const noteIdx  = midi % 12
    const isBlack  = [1, 3, 6, 8, 10].includes(noteIdx)
    return { midi, isBlack, noteIdx }
  })

  const handlePress = useCallback(
    async (midi) => {
      if (disabledMidi.includes(midi)) return
      setPressedKeys((s) => new Set(s).add(midi))
      await playNote(midi, '8n')
      onNoteClick?.(midi)

      setTimeout(() => {
        setPressedKeys((s) => {
          const next = new Set(s)
          next.delete(midi)
          return next
        })
      }, 300)
    },
    [playNote, onNoteClick, disabledMidi],
  )

  // Separate white and black keys for correct z-layering
  const whiteKeys = keys.filter((k) => !k.isBlack)
  const blackKeys = keys.filter((k) => k.isBlack)

  // Map black key MIDI → left offset relative to white keys
  const whiteKeyWidth = 100 / whiteKeys.length // % of container width

  function blackLeftOffset(midi) {
    // Find the preceding white key index
    let whiteIdx = 0
    for (let i = 0; i < whiteKeys.length; i++) {
      if (whiteKeys[i].midi < midi) whiteIdx = i
    }
    return (whiteIdx + 0.65) * whiteKeyWidth
  }

  const keyClass = (k) => {
    const pressed    = pressedKeys.has(k.midi)
    const highlighted = highlightMidi.includes(k.midi)
    const disabled   = disabledMidi.includes(k.midi)

    if (k.isBlack) {
      return [
        'piano-key-black absolute',
        pressed    ? '!bg-primary-700' : '',
        highlighted ? '!bg-yellow-400' : '',
        disabled   ? 'opacity-30 cursor-not-allowed' : '',
      ].filter(Boolean).join(' ')
    }

    return [
      'piano-key-white absolute',
      pressed    ? '!bg-primary-200' : '',
      highlighted ? '!bg-yellow-200' : '',
      disabled   ? 'opacity-30 cursor-not-allowed' : '',
    ].filter(Boolean).join(' ')
  }

  return (
    <div
      className="relative w-full select-none touch-none"
      style={{ height: octaves <= 1 ? 110 : 130, maxWidth: 700 }}
    >
      {/* White keys */}
      {whiteKeys.map((k, i) => (
        <button
          key={k.midi}
          onMouseDown={() => handlePress(k.midi)}
          onTouchStart={(e) => { e.preventDefault(); handlePress(k.midi) }}
          className={keyClass(k)}
          style={{
            left:   `${i * whiteKeyWidth}%`,
            width:  `${whiteKeyWidth - 0.5}%`,
            top:    0,
            bottom: 0,
          }}
          aria-label={`Note ${k.midi}`}
        />
      ))}

      {/* Black keys (drawn on top) */}
      {blackKeys.map((k) => (
        <button
          key={k.midi}
          onMouseDown={() => handlePress(k.midi)}
          onTouchStart={(e) => { e.preventDefault(); handlePress(k.midi) }}
          className={keyClass(k)}
          style={{
            left:   `${blackLeftOffset(k.midi)}%`,
            width:  `${whiteKeyWidth * 0.6}%`,
            top:    0,
            height: '62%',
          }}
          aria-label={`Note # ${k.midi}`}
        />
      ))}
    </div>
  )
}

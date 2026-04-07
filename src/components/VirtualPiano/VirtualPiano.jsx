import { useState, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

const NOTE_LABELS = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

/**
 * Interactive piano keyboard.
 *
 * Props:
 *   startMidi      : first MIDI note (default 60 = C4)
 *   octaves        : number of octaves to display (default 2)
 *   onNoteClick    : (midi: number) => void
 *   highlightMidi  : number[]  — keys to highlight green (e.g. correct answer)
 *   wrongMidi      : number[]  — keys to highlight red (wrong answer feedback)
 *   disabledMidi   : number[]  — keys visually greyed-out
 *   showLabels     : boolean   — show note names on white keys
 */
export default function VirtualPiano({
  startMidi = 60,
  octaves = 2,
  onNoteClick,
  highlightMidi = [],
  wrongMidi = [],
  disabledMidi  = [],
  showLabels = true,
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
    let whiteIdx = 0
    for (let i = 0; i < whiteKeys.length; i++) {
      if (whiteKeys[i].midi < midi) whiteIdx = i
    }
    return (whiteIdx + 0.62) * whiteKeyWidth
  }

  const keyClass = (k) => {
    const pressed     = pressedKeys.has(k.midi)
    const highlighted = highlightMidi.includes(k.midi)
    const wrong       = wrongMidi.includes(k.midi)
    const disabled    = disabledMidi.includes(k.midi)

    if (k.isBlack) {
      return [
        'piano-key-black absolute',
        pressed     ? '!bg-primary-700' : '',
        highlighted ? '!bg-green-400 !border-green-500' : '',
        wrong       ? '!bg-red-400 !border-red-500' : '',
        disabled    ? 'opacity-30 cursor-not-allowed' : '',
      ].filter(Boolean).join(' ')
    }

    return [
      'piano-key-white absolute',
      pressed     ? '!bg-primary-200' : '',
      highlighted ? '!bg-green-200 !border-green-400' : '',
      wrong       ? '!bg-red-200 !border-red-400' : '',
      disabled    ? 'opacity-30 cursor-not-allowed' : '',
    ].filter(Boolean).join(' ')
  }

  // Compute dynamic height based on octaves
  const pianoHeight = octaves <= 1 ? 140 : 160

  return (
    <div
      className="relative w-full select-none touch-none mx-auto"
      style={{ height: pianoHeight, maxWidth: 700 }}
    >
      {/* White keys */}
      {whiteKeys.map((k, i) => {
        const isHighlighted = highlightMidi.includes(k.midi)
        const isWrong = wrongMidi.includes(k.midi)
        return (
          <button
            key={k.midi}
            onMouseDown={() => handlePress(k.midi)}
            onTouchStart={(e) => { e.preventDefault(); handlePress(k.midi) }}
            className={keyClass(k)}
            style={{
              left:   `${i * whiteKeyWidth}%`,
              width:  `${whiteKeyWidth - 0.4}%`,
              top:    0,
              bottom: 0,
              borderRadius: '0 0 8px 8px',
            }}
            aria-label={`Note ${NOTE_LABELS[k.noteIdx]}`}
          >
            {/* Middle C dot (Do serrure) */}
            {k.midi === 60 && (
              <span className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 pointer-events-none ${showLabels ? 'bottom-7' : 'bottom-3'}`} />
            )}
            {showLabels && (
              <span
                className={[
                  'absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold pointer-events-none select-none',
                  isHighlighted ? 'text-green-700' : isWrong ? 'text-red-700' : 'text-gray-400 dark:text-gray-500',
                ].join(' ')}
              >
                {NOTE_LABELS[k.noteIdx]}
              </span>
            )}
          </button>
        )
      })}

      {/* Black keys (drawn on top) */}
      {blackKeys.map((k) => (
        <button
          key={k.midi}
          onMouseDown={() => handlePress(k.midi)}
          onTouchStart={(e) => { e.preventDefault(); handlePress(k.midi) }}
          className={keyClass(k)}
          style={{
            left:   `${blackLeftOffset(k.midi)}%`,
            width:  `${whiteKeyWidth * 0.58}%`,
            top:    0,
            height: '60%',
            borderRadius: '0 0 6px 6px',
          }}
          aria-label={`Note ${NOTE_LABELS[k.noteIdx]}`}
        />
      ))}
    </div>
  )
}

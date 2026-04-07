import { useEffect, useRef } from 'react'
import { drawSingleNote, drawInterval, drawChord, drawNoteSequence } from '../../utils/vexflowHelpers'

/**
 * Renders a VexFlow staff.
 *
 * Props:
 *   mode       : 'single' | 'interval' | 'chord' | 'sequence'
 *   noteKey    : string              (for single)
 *   keys       : string[]            (for chord / interval / sequence)
 *   duration   : string              default 'q'
 *   clef       : 'treble' | 'bass'   (for sequence)
 *   noteStates : string[]            (for sequence: 'upcoming'|'current'|'correct'|'wrong')
 */
export default function StaffDisplay({
  mode = 'single', noteKey, keys = [], duration = 'q',
  clef = 'treble', noteStates = [],
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    try {
      if (mode === 'single' && noteKey) {
        drawSingleNote(el, noteKey, duration)
      } else if (mode === 'interval' && keys.length === 2) {
        drawInterval(el, keys[0], keys[1])
      } else if (mode === 'chord' && keys.length > 0) {
        drawChord(el, keys)
      } else if (mode === 'sequence' && keys.length > 0) {
        drawNoteSequence(el, keys, clef, noteStates)
      }
    } catch (err) {
      console.error('[StaffDisplay] VexFlow error:', err)
    }
  }, [mode, noteKey, keys, duration, clef, noteStates])

  return (
    <div
      ref={containerRef}
      className="staff-container w-full bg-white rounded-xl p-1.5 sm:p-2 min-h-[120px] sm:min-h-[140px] overflow-hidden"
    />
  )
}

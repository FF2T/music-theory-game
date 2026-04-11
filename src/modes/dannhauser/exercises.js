/**
 * Dannhauser Solfege exercises data and helpers.
 * Exercises transcribed from "Solfege des Solfeges - Vol. I"
 *
 * Each exercise stores bass-clef vexKeys. The treble-clef version
 * keeps the SAME staff position (visual) but changes the note names.
 */

const LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b']
const FR_NAMES = { c: 'Do', d: 'Ré', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' }

/**
 * Convert a bass-clef vexKey to the treble-clef vexKey at the SAME
 * visual staff position.
 *
 * Bass middle line = D3, Treble middle line = B4 → shift +5 letters +1 octave.
 */
export function bassToTreble(bassKey) {
  const [letterPart, octStr] = bassKey.split('/')
  const octave = parseInt(octStr, 10)
  const baseLetter = letterPart.charAt(0).toLowerCase()
  const accidental = letterPart.slice(1)
  const idx = LETTERS.indexOf(baseLetter)
  if (idx === -1) return bassKey
  const newIdx = (idx + 5) % 7
  const newOctave = octave + 1 + Math.floor((idx + 5) / 7)
  return `${LETTERS[newIdx]}${accidental}/${newOctave}`
}

/** Convert a vexKey to its French solfege name (e.g. 'f#/3' → 'Fa#') */
export function vexKeyToFrench(key) {
  const letterPart = key.split('/')[0]
  const baseLetter = letterPart.charAt(0).toLowerCase()
  const acc = letterPart.slice(1)
  const name = FR_NAMES[baseLetter] || baseLetter
  if (acc === '##') return name + '##'
  if (acc === '#') return name + '#'
  if (acc === 'bb') return name + 'bb'
  if (acc === 'b') return name + 'b'
  return name
}

/** Convert a vexKey to MIDI number (e.g. 'c/3' → 48) */
export function vexKeyToMidi(key) {
  const [letterPart, octStr] = key.split('/')
  const octave = parseInt(octStr, 10)
  const baseLetter = letterPart.charAt(0).toLowerCase()
  const semitones = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }
  let midi = (octave + 1) * 12 + (semitones[baseLetter] ?? 0)
  const acc = letterPart.slice(1)
  if (acc === '##') midi += 2
  else if (acc === '#') midi += 1
  else if (acc === 'bb') midi -= 2
  else if (acc === 'b') midi -= 1
  return midi
}

/** Pretty-print accidentals: Fa# → Fa♯, Sib → Si♭ */
export function displayNoteName(fr) {
  return fr
    .replace(/##$/, '𝄪')
    .replace(/#$/, '♯')
    .replace(/bb$/, '𝄫')
    .replace(/b$/, '♭')
}

// ── Parse helper ────────────────────────────────────────────────────────────

function parseNotes(str) {
  return str.trim().split(/\s+/).filter(Boolean).map(token =>
    token === 'R' ? { rest: true } : { key: token }
  )
}

// ── Exercises ───────────────────────────────────────────────────────────────
// Notes are in bass clef. 'R' = rest (silence / "chut").
// Transcriptions are approximate — verify against the original score.

export const EXERCISES = [
  {
    id: 152,
    title: 'Exercice 152',
    tempo: 'Andantino (♩ = 92)',
    timeSignature: '3/4',
    composer: 'H.L.',
    notes: parseNotes(`
      c/3 d/3 e/3 f/3 e/3 d/3 c/3 R
      d/3 e/3 f/3 e/3 d/3 e/3 d/3 c/3 d/3 e/3
      d/3 e/3 f/3 g/3 a/3 g/3 f/3 e/3 d/3 R
      e/3 d/3 c/3 d/3 e/3 f/3 e/3 d/3 e/3 c/3
      d/3 e/3 f/3 g/3 a/3 g/3 f/3 e/3 d/3 R
      c/3 d/3 e/3 f#/3 g/3 a/3 g/3 f/3 e/3 d/3 c/3
      d/3 e/3 f#/3 g/3 e/3 f#/3 g/3 a/3 b/3 a/3 g/3 f#/3 e/3 d/3 c/3
    `),
  },
  {
    id: 153,
    title: 'Exercice 153',
    tempo: 'Allegro moderato (♩ = 120)',
    timeSignature: '4/4',
    composer: 'H.L.',
    notes: parseNotes(`
      c/3 d/3 c/3 d/3 f/3 e/3 d/3 c/3 d/3 e/3 d/3 c/3 R
      d/3 e/3 f/3 e/3 d/3 c/3 bb/2 c/3 d/3 e/3 f/3
      d/3 c/3 d/3 e/3 f/3 g/3 f/3 e/3 d/3 R
      c/3 d/3 bb/2 c/3 d/3 e/3 f/3 g/3 a/3 g/3 f/3 e/3 d/3
      c/3 d/3 e/3 f/3 g/3 a/3 g/3 f/3 e/3 d/3 c/3
      d/3 e/3 f/3 g/3 f/3 e/3 d/3 c/3
    `),
  },
]

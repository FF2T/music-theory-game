/**
 * Core music theory data and helpers.
 * Pure functions — no side-effects, no imports.
 */

// ── Note names ────────────────────────────────────────────────────────────────

export const NOTE_NAMES_FR = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
export const NOTE_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** Maps solfège index (0=Do) to English letter */
export const toEnglish = (index) => NOTE_NAMES_EN[index % 12]
export const toFrench  = (index) => NOTE_NAMES_FR[index % 12]

// ── Treble-clef note pool (beginner) ─────────────────────────────────────────
// Each entry: { vexKey, fr, octave }  — keys below middle C up to top-space G5

export const TREBLE_NOTES = [
  { vexKey: 'c/4', fr: 'Do',  en: 'C4', midi: 60 },
  { vexKey: 'd/4', fr: 'Ré',  en: 'D4', midi: 62 },
  { vexKey: 'e/4', fr: 'Mi',  en: 'E4', midi: 64 },
  { vexKey: 'f/4', fr: 'Fa',  en: 'F4', midi: 65 },
  { vexKey: 'g/4', fr: 'Sol', en: 'G4', midi: 67 },
  { vexKey: 'a/4', fr: 'La',  en: 'A4', midi: 69 },
  { vexKey: 'b/4', fr: 'Si',  en: 'B4', midi: 71 },
  { vexKey: 'c/5', fr: 'Do',  en: 'C5', midi: 72 },
  { vexKey: 'd/5', fr: 'Ré',  en: 'D5', midi: 74 },
  { vexKey: 'e/5', fr: 'Mi',  en: 'E5', midi: 76 },
  { vexKey: 'f/5', fr: 'Fa',  en: 'F5', midi: 77 },
  { vexKey: 'g/5', fr: 'Sol', en: 'G5', midi: 79 },
]

// ── Bass-clef note pool (beginner) ──────────────────────────────────────────
// G2 (bottom line) to D4 (ledger line above staff)

export const BASS_NOTES = [
  { vexKey: 'g/2', fr: 'Sol', en: 'G2', midi: 43 },
  { vexKey: 'a/2', fr: 'La',  en: 'A2', midi: 45 },
  { vexKey: 'b/2', fr: 'Si',  en: 'B2', midi: 47 },
  { vexKey: 'c/3', fr: 'Do',  en: 'C3', midi: 48 },
  { vexKey: 'd/3', fr: 'Ré',  en: 'D3', midi: 50 },
  { vexKey: 'e/3', fr: 'Mi',  en: 'E3', midi: 52 },
  { vexKey: 'f/3', fr: 'Fa',  en: 'F3', midi: 53 },
  { vexKey: 'g/3', fr: 'Sol', en: 'G3', midi: 55 },
  { vexKey: 'a/3', fr: 'La',  en: 'A3', midi: 57 },
  { vexKey: 'b/3', fr: 'Si',  en: 'B3', midi: 59 },
  { vexKey: 'c/4', fr: 'Do',  en: 'C4', midi: 60 },
  { vexKey: 'd/4', fr: 'Ré',  en: 'D4', midi: 62 },
]

// ── Intervals ─────────────────────────────────────────────────────────────────

export const INTERVALS = [
  { semitones: 1,  name: 'Seconde mineure',  abbr: '2m',  en: 'Minor 2nd' },
  { semitones: 2,  name: 'Seconde majeure',  abbr: '2M',  en: 'Major 2nd' },
  { semitones: 3,  name: 'Tierce mineure',   abbr: '3m',  en: 'Minor 3rd' },
  { semitones: 4,  name: 'Tierce majeure',   abbr: '3M',  en: 'Major 3rd' },
  { semitones: 5,  name: 'Quarte juste',     abbr: 'P4',  en: 'Perfect 4th' },
  { semitones: 6,  name: 'Triton',           abbr: 'TT',  en: 'Tritone' },
  { semitones: 7,  name: 'Quinte juste',     abbr: 'P5',  en: 'Perfect 5th' },
  { semitones: 8,  name: 'Sixte mineure',    abbr: '6m',  en: 'Minor 6th' },
  { semitones: 9,  name: 'Sixte majeure',    abbr: '6M',  en: 'Major 6th' },
  { semitones: 10, name: 'Septième mineure', abbr: '7m',  en: 'Minor 7th' },
  { semitones: 11, name: 'Septième majeure', abbr: '7M',  en: 'Major 7th' },
  { semitones: 12, name: 'Octave',           abbr: '8ve', en: 'Octave' },
]

// ── Interval helpers ─────────────────────────────────────────────────────────

/** Diatonic letter steps for each interval (semitones → letter offset) */
const INTERVAL_LETTER_STEPS = {
  1: 1, 2: 1,    // seconds
  3: 2, 4: 2,    // thirds
  5: 3,          // fourth
  6: 3,          // tritone (augmented fourth)
  7: 4,          // fifth
  8: 5, 9: 5,    // sixths
  10: 6, 11: 6,  // sevenths
  12: 7,         // octave
}

const DIATONIC_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b']

/**
 * Compute the upper note's vexKey for an interval above a given root.
 * Returns { vexKey, midi } with correct diatonic spelling.
 */
export function intervalUpperNote(rootVexKey, semitones) {
  // Parse root: "c/4", "f#/3", "bb/4"
  const parts = rootVexKey.split('/')
  const octave = parseInt(parts[1], 10)
  const letterPart = parts[0]
  const rootLetter = letterPart.charAt(0).toLowerCase()
  const rootIdx = DIATONIC_LETTERS.indexOf(rootLetter)

  // Compute root MIDI from vexKey
  const letterMidi = [0, 2, 4, 5, 7, 9, 11] // c d e f g a b
  let rootMidi = (octave + 1) * 12 + letterMidi[rootIdx]
  if (letterPart.includes('#')) rootMidi += 1
  else if (letterPart.includes('b')) rootMidi -= 1

  const upperMidi = rootMidi + semitones
  const letterSteps = INTERVAL_LETTER_STEPS[semitones] ?? Math.round(semitones * 7 / 12)
  const upperLetterIdx = (rootIdx + letterSteps) % 7
  const upperOctave = octave + Math.floor((rootIdx + letterSteps) / 7)
  const upperLetter = DIATONIC_LETTERS[upperLetterIdx]
  const expectedMidi = (upperOctave + 1) * 12 + letterMidi[upperLetterIdx]
  const diff = upperMidi - expectedMidi

  let accidental = ''
  if (diff === 1) accidental = '#'
  else if (diff === -1) accidental = 'b'
  else if (diff === 2) accidental = '##'
  else if (diff === -2) accidental = 'bb'

  return {
    vexKey: `${upperLetter}${accidental}/${upperOctave}`,
    midi: upperMidi,
  }
}

// ── Pentatonic scales ─────────────────────────────────────────────────────────

/** Returns MIDI note array for a major pentatonic starting at rootMidi */
export function majorPentatonic(rootMidi) {
  return [0, 2, 4, 7, 9].map((s) => rootMidi + s)
}

/** Returns MIDI note array for a minor pentatonic starting at rootMidi */
export function minorPentatonic(rootMidi) {
  return [0, 3, 5, 7, 10].map((s) => rootMidi + s)
}

// ── Greek modes ───────────────────────────────────────────────────────────────

export const GREEK_MODES = [
  { name: 'Ionien',      steps: [2,2,1,2,2,2,1], mood: 'Joyeux, brillant' },
  { name: 'Dorien',      steps: [2,1,2,2,2,1,2], mood: 'Doux, mélancolique' },
  { name: 'Phrygien',    steps: [1,2,2,2,1,2,2], mood: 'Sombre, espagnol' },
  { name: 'Lydien',      steps: [2,2,2,1,2,2,1], mood: 'Rêveur, flottant' },
  { name: 'Mixolydien',  steps: [2,2,1,2,2,1,2], mood: 'Blues, rock' },
  { name: 'Éolien',      steps: [2,1,2,2,1,2,2], mood: 'Triste, naturel' },
  { name: 'Locrien',     steps: [1,2,2,1,2,2,2], mood: 'Instable, dissonant' },
]

/** Build a scale from a root MIDI note and an array of step intervals */
export function buildScale(rootMidi, steps) {
  const scale = [rootMidi]
  let current = rootMidi
  for (const step of steps) {
    current += step
    scale.push(current)
  }
  return scale
}

// ── Chord structures ──────────────────────────────────────────────────────────

export const CHORD_TYPES = {
  maj:    { name: 'Majeur',        intervals: [0, 4, 7],         symbol: '' },
  min:    { name: 'Mineur',        intervals: [0, 3, 7],         symbol: 'm' },
  dom7:   { name: 'Dominante 7',   intervals: [0, 4, 7, 10],     symbol: '7' },
  maj7:   { name: 'Majeur 7',      intervals: [0, 4, 7, 11],     symbol: 'M7' },
  min7:   { name: 'Mineur 7',      intervals: [0, 3, 7, 10],     symbol: 'm7' },
  dim7:   { name: 'Diminué 7',     intervals: [0, 3, 6, 9],      symbol: 'dim7' },
  dom9:   { name: 'Dominante 9',   intervals: [0, 4, 7, 10, 14], symbol: '9' },
  maj9:   { name: 'Majeur 9',      intervals: [0, 4, 7, 11, 14], symbol: 'M9' },
  min9:   { name: 'Mineur 9',      intervals: [0, 3, 7, 10, 14], symbol: 'm9' },
}

/** Build chord MIDI notes from root */
export function buildChord(rootMidi, chordType) {
  return CHORD_TYPES[chordType].intervals.map((i) => rootMidi + i)
}

// ── Blues ─────────────────────────────────────────────────────────────────────

/** Blues scale (hexatonic): root + b3 + 4 + b5 + 5 + b7 */
export function bluesScale(rootMidi) {
  return [0, 3, 5, 6, 7, 10].map((s) => rootMidi + s)
}

export const BLUES_PROGRESSION = {
  name: '12-bar Blues (I-IV-V)',
  pattern: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
  description: 'La grille la plus fondamentale du blues et du rock',
}

// ── Time signatures ───────────────────────────────────────────────────────────

export const TIME_SIGNATURES = [
  { beats: 4, value: 4, name: '4/4', description: 'Temps commun – rock, pop, jazz' },
  { beats: 3, value: 4, name: '3/4', description: 'Valse – 1 fort, 2 faibles' },
  { beats: 6, value: 8, name: '6/8', description: 'Composé – sentiment ternaire' },
  { beats: 5, value: 4, name: '5/4', description: 'Asymétrique – Mission Impossible' },
  { beats: 7, value: 8, name: '7/8', description: 'Balkanique – impression boiteuse' },
]

// ── Misc helpers ──────────────────────────────────────────────────────────────

/** Convert MIDI note number to Tone.js note string (e.g. 60 → "C4") */
export function midiToToneNote(midi) {
  const octave = Math.floor(midi / 12) - 1
  const name   = NOTE_NAMES_EN[midi % 12]
  return `${name}${octave}`
}

/** Pick n unique random items from an array */
export function sampleN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/** Return a random item from an array */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Tone.js audio helpers.
 * Lazy-initialised synth so we never start AudioContext before a user gesture.
 */

import * as Tone from 'tone'
import { midiToToneNote } from './musicTheory'

let synth = null
let polySynth = null
let audioStarted = false

function getSynth() {
  if (!synth) {
    synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
    }).toDestination()
  }
  return synth
}

function getPolySynth() {
  if (!polySynth) {
    polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 1.2 },
    }).toDestination()
  }
  return polySynth
}

/** Ensure AudioContext is running (call once from a click handler) */
export async function startAudio() {
  if (!audioStarted) {
    await Tone.start()
    audioStarted = true
  }
}

/** Warm up: call on first user interaction to eliminate latency */
export function warmUpAudio() {
  startAudio().then(() => {
    // Pre-create synths so first note is instant
    getSynth()
    getPolySynth()
  })
}

/**
 * Play a single MIDI note — synchronous (no await needed).
 */
export function playNote(midi, duration = '8n') {
  if (!audioStarted) return
  const note = midiToToneNote(midi)
  getSynth().triggerAttackRelease(note, duration)
}

/**
 * Play a Tone.js note string directly (e.g. "C4").
 */
export function playToneNote(noteStr, duration = '8n') {
  if (!audioStarted) return
  getSynth().triggerAttackRelease(noteStr, duration)
}

/**
 * Play multiple MIDI notes simultaneously (chord).
 */
export function playChord(midiNotes, duration = '2n') {
  if (!audioStarted) return
  const notes = midiNotes.map(midiToToneNote)
  getPolySynth().triggerAttackRelease(notes, duration)
}

/**
 * Play a sequence of MIDI notes melodically.
 */
export function playMelody(midiNotes, bpm = 120) {
  if (!audioStarted) return
  const noteDuration = (60 / bpm) * 1000
  for (let i = 0; i < midiNotes.length; i++) {
    const note = midiToToneNote(midiNotes[i])
    getSynth().triggerAttackRelease(note, '8n', Tone.now() + (i * noteDuration) / 1000)
  }
}

/**
 * Play a success jingle.
 */
export function playSuccess() {
  if (!audioStarted) return
  const s = getSynth()
  const now = Tone.now()
  s.triggerAttackRelease('C5', '16n', now)
  s.triggerAttackRelease('E5', '16n', now + 0.1)
  s.triggerAttackRelease('G5', '8n',  now + 0.2)
}

/**
 * Play a failure sound.
 */
export function playFailure() {
  if (!audioStarted) return
  const s = getSynth()
  const now = Tone.now()
  s.triggerAttackRelease('A3', '16n', now)
  s.triggerAttackRelease('F3', '8n',  now + 0.1)
}

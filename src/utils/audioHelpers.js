/**
 * Tone.js audio helpers.
 * Lazy-initialised synth so we never start AudioContext before a user gesture.
 */

import * as Tone from 'tone'
import { midiToToneNote } from './musicTheory'

let synth = null
let polySynth = null

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

/** Ensure AudioContext is running (call from a click handler) */
export async function startAudio() {
  await Tone.start()
}

/**
 * Play a single MIDI note.
 * @param {number} midi
 * @param {string} [duration='8n']
 */
export async function playNote(midi, duration = '8n') {
  await startAudio()
  const note = midiToToneNote(midi)
  getSynth().triggerAttackRelease(note, duration)
}

/**
 * Play a Tone.js note string directly (e.g. "C4").
 */
export async function playToneNote(noteStr, duration = '8n') {
  await startAudio()
  getSynth().triggerAttackRelease(noteStr, duration)
}

/**
 * Play multiple MIDI notes simultaneously (chord).
 * @param {number[]} midiNotes
 * @param {string} [duration='2n']
 */
export async function playChord(midiNotes, duration = '2n') {
  await startAudio()
  const notes = midiNotes.map(midiToToneNote)
  getPolySynth().triggerAttackRelease(notes, duration)
}

/**
 * Play a sequence of MIDI notes melodically.
 * @param {number[]} midiNotes
 * @param {number} [bpm=120]
 */
export async function playMelody(midiNotes, bpm = 120) {
  await startAudio()
  const noteDuration = (60 / bpm) * 1000 // ms per beat
  for (let i = 0; i < midiNotes.length; i++) {
    const note = midiToToneNote(midiNotes[i])
    getSynth().triggerAttackRelease(note, '8n', Tone.now() + (i * noteDuration) / 1000)
  }
}

/**
 * Play a success jingle.
 */
export async function playSuccess() {
  await startAudio()
  const s = getSynth()
  const now = Tone.now()
  s.triggerAttackRelease('C5', '16n', now)
  s.triggerAttackRelease('E5', '16n', now + 0.1)
  s.triggerAttackRelease('G5', '8n',  now + 0.2)
}

/**
 * Play a failure sound.
 */
export async function playFailure() {
  await startAudio()
  const s = getSynth()
  const now = Tone.now()
  s.triggerAttackRelease('A3', '16n', now)
  s.triggerAttackRelease('F3', '8n',  now + 0.1)
}

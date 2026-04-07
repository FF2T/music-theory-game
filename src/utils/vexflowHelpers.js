/**
 * VexFlow 5 rendering helpers.
 * Uses the unified Vex namespace (VexFlow 5 ESM entry).
 */

import Vex from 'vexflow'

const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex

/**
 * Clear a DOM container and return a fresh VexFlow renderer.
 */
export function createRenderer(container, width = 400, height = 150) {
  container.innerHTML = ''
  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, height)
  return renderer
}

/**
 * Draw a single note on a treble-clef stave.
 * @param {HTMLElement} container
 * @param {string} vexKey   e.g. "c/4"
 * @param {string} duration e.g. "q"
 */
export function drawSingleNote(container, vexKey, duration = 'q') {
  const width  = Math.max(container.clientWidth || 400, 260)
  const height = 150
  const renderer = createRenderer(container, width, height)
  const context  = renderer.getContext()

  const stave = new Stave(10, 20, width - 20)
  stave.addClef('treble').addTimeSignature('4/4')
  stave.setContext(context).draw()

  const note = new StaveNote({ keys: [vexKey], duration })

  if (vexKey.includes('#')) note.addModifier(new Accidental('#'), 0)
  if (vexKey.includes('b') && vexKey[0] !== 'b') note.addModifier(new Accidental('b'), 0)

  const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
  voice.addTickables([note])

  new Formatter().joinVoices([voice]).format([voice], width - 80)
  voice.draw(context, stave)
}

/**
 * Draw two notes side by side (interval exercise).
 */
export function drawInterval(container, key1, key2) {
  const width  = Math.max(container.clientWidth || 500, 300)
  const height = 150
  const renderer = createRenderer(container, width, height)
  const context  = renderer.getContext()

  const stave = new Stave(10, 20, width - 20)
  stave.addClef('treble')
  stave.setContext(context).draw()

  const notes = [key1, key2].map((k) => {
    const n = new StaveNote({ keys: [k], duration: 'h' })
    if (k.includes('#')) n.addModifier(new Accidental('#'), 0)
    return n
  })

  const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
  voice.addTickables(notes)

  new Formatter().joinVoices([voice]).format([voice], width - 80)
  voice.draw(context, stave)
}

/**
 * Draw a chord (multiple simultaneous keys).
 */
export function drawChord(container, keys) {
  const width  = Math.max(container.clientWidth || 400, 260)
  const height = 150
  const renderer = createRenderer(container, width, height)
  const context  = renderer.getContext()

  const stave = new Stave(10, 20, width - 20)
  stave.addClef('treble')
  stave.setContext(context).draw()

  const note = new StaveNote({ keys, duration: 'w' })
  keys.forEach((k, i) => {
    if (k.includes('#')) note.addModifier(new Accidental('#'), i)
  })

  const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
  voice.addTickables([note])

  new Formatter().joinVoices([voice]).format([voice], width - 80)
  voice.draw(context, stave)
}

/**
 * Draw a sequence of notes on a staff, each individually colored.
 *
 * @param {HTMLElement} container
 * @param {string[]}    vexKeys     e.g. ["c/4","e/4","g/4","c/5"]
 * @param {'treble'|'bass'} clef
 * @param {string[]}    noteStates  per-note: 'upcoming'|'current'|'correct'|'wrong'
 */
export function drawNoteSequence(container, vexKeys, clef = 'treble', noteStates = []) {
  const width  = Math.max(container.clientWidth || 460, 280)
  const height = 155
  const renderer = createRenderer(container, width, height)
  const context  = renderer.getContext()

  const stave = new Stave(10, 20, width - 20)
  stave.addClef(clef)
  stave.setContext(context).draw()

  const palette = {
    upcoming: '#d1d5db',
    current:  '#000000',
    correct:  '#22c55e',
    wrong:    '#ef4444',
  }

  const notes = vexKeys.map((key, i) => {
    const state = noteStates[i] || 'upcoming'
    const color = palette[state] || palette.upcoming
    const note  = new StaveNote({ keys: [key], duration: 'q', clef })

    note.setStyle({ fillStyle: color, strokeStyle: color })
    if (note.setStemStyle)  note.setStemStyle({ fillStyle: color, strokeStyle: color })
    if (note.setFlagStyle)  note.setFlagStyle({ fillStyle: color, strokeStyle: color })

    if (key.includes('#')) note.addModifier(new Accidental('#'), 0)
    if (key.includes('b') && key[0] !== 'b') note.addModifier(new Accidental('b'), 0)

    return note
  })

  const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
  voice.addTickables(notes)

  new Formatter().joinVoices([voice]).format([voice], width - 80)
  voice.draw(context, stave)
}

/** Convert MIDI note number to a VexFlow key string e.g. 60 → "c/4" */
export function midiToVexKey(midi) {
  const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
  const octave    = Math.floor(midi / 12) - 1
  const name      = noteNames[midi % 12]
  return `${name}/${octave}`
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * @typedef {'beginner'|'intermediate'|'advanced'} GameMode
 *
 * @typedef {Object} ExerciseResult
 * @property {string} exerciseId
 * @property {boolean} correct
 * @property {number} timestamp
 * @property {number} responseTimeMs
 */

const initialProgress = {
  beginner:     { totalAnswered: 0, correctAnswers: 0, streak: 0, bestStreak: 0, unicornLevel: 0, unlockedExercises: ['note-reading'] },
  intermediate: { totalAnswered: 0, correctAnswers: 0, streak: 0, bestStreak: 0, unlockedExercises: ['intervals'] },
  advanced:     { totalAnswered: 0, correctAnswers: 0, streak: 0, bestStreak: 0, unlockedExercises: ['greek-modes'] },
}

export const CHARACTERS = [
  { id: 'unicorn',  label: 'Licorne',  emoji: '\u{1F984}', color: 'from-purple-400 to-pink-400' },
  { id: 'cat',      label: 'Chaton',   emoji: '\u{1F431}', color: 'from-orange-400 to-amber-400' },
  { id: 'dragon',   label: 'Dragon',   emoji: '\u{1F409}', color: 'from-emerald-400 to-teal-400' },
  { id: 'bunny',    label: 'Lapin',    emoji: '\u{1F430}', color: 'from-pink-400 to-rose-400' },
  { id: 'panda',    label: 'Panda',    emoji: '\u{1F43C}', color: 'from-gray-400 to-slate-400' },
  { id: 'dolphin',  label: 'Dauphin',  emoji: '\u{1F42C}', color: 'from-cyan-400 to-blue-400' },
]

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ── Navigation ──────────────────────────────────────────────────────────
      /** @type {GameMode|null} */
      currentMode: null,
      currentExercise: null,

      setMode: (mode) => set({ currentMode: mode, currentExercise: null }),
      setExercise: (exerciseId) => set({ currentExercise: exerciseId }),

      // ── Session (non-persisted across reloads) ───────────────────────────
      sessionScore: 0,
      sessionAnswers: 0,
      sessionCorrect: 0,
      currentStreak: 0,
      lastFeedback: null, // 'correct' | 'wrong' | null

      // ── Persistent progress ──────────────────────────────────────────────
      progress: initialProgress,

      // ── Audio preference ────────────────────────────────────────────────
      audioEnabled: true,
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

      // ── Theme ───────────────────────────────────────────────────────────
      theme: 'dark', // 'light' | 'dark'
      setTheme: (theme) => set({ theme }),

      // ── Scoring settings ────────────────────────────────────────────────
      penaltyValue: -2, // configurable penalty for wrong answers (unicorn level)
      setPenaltyValue: (v) => set({ penaltyValue: v }),

      // ── Character selection ─────────────────────────────────────────────
      selectedCharacter: 'unicorn',
      setCharacter: (id) => set({ selectedCharacter: id }),

      // ── Note error tracking (adaptive difficulty) ───────────────────────
      // { "treble:Do": { total: 10, wrong: 3 }, ... }
      noteErrors: {},

      recordNoteError: (noteKey, correct) => {
        set((s) => {
          const prev = s.noteErrors[noteKey] || { total: 0, wrong: 0 }
          return {
            noteErrors: {
              ...s.noteErrors,
              [noteKey]: {
                total: prev.total + 1,
                wrong: prev.wrong + (correct ? 0 : 1),
              },
            },
          }
        })
      },

      // ── Actions ──────────────────────────────────────────────────────────
      recordAnswer: ({ correct, exerciseId, responseTimeMs = 0 }) => {
        const { currentMode, progress, currentStreak, penaltyValue } = get()
        if (!currentMode) return

        const newStreak    = correct ? currentStreak + 1 : 0
        const modeProgress = progress[currentMode]
        const bestStreak   = Math.max(modeProgress.bestStreak, newStreak)

        // +10 base, +5 bonus per streak level (capped at +25), −0 for wrong
        const points = correct ? 10 + Math.min(newStreak - 1, 5) * 5 : 0

        // Character reward (beginner only, capped 0-50)
        // Time-based bonus: <3s → +2, 3-10s → +1, >10s → +0
        const prevUnicorn = modeProgress.unicornLevel ?? 0
        let unicornDelta = penaltyValue // wrong answer default
        if (correct) {
          if (responseTimeMs < 3000) unicornDelta = 2
          else if (responseTimeMs <= 10000) unicornDelta = 1
          else unicornDelta = 0
        }
        const unicornLevel = currentMode === 'beginner'
          ? Math.max(0, Math.min(50, prevUnicorn + unicornDelta))
          : prevUnicorn

        set((s) => ({
          sessionScore:   s.sessionScore   + points,
          sessionAnswers: s.sessionAnswers + 1,
          sessionCorrect: s.sessionCorrect + (correct ? 1 : 0),
          currentStreak:  newStreak,
          lastFeedback:   correct ? 'correct' : 'wrong',
          progress: {
            ...s.progress,
            [currentMode]: {
              ...modeProgress,
              totalAnswered: modeProgress.totalAnswered + 1,
              correctAnswers: modeProgress.correctAnswers + (correct ? 1 : 0),
              streak:     newStreak,
              bestStreak: bestStreak,
              ...(currentMode === 'beginner' ? { unicornLevel } : {}),
            },
          },
        }))

        // Clear feedback after 1.2 s
        setTimeout(() => set({ lastFeedback: null }), 1200)
      },

      resetSession: () => set({
        sessionScore:   0,
        sessionAnswers: 0,
        sessionCorrect: 0,
        currentStreak:  0,
        lastFeedback:   null,
      }),

      resetUnicorn: () => set((s) => ({
        progress: {
          ...s.progress,
          beginner: { ...s.progress.beginner, unicornLevel: 0 },
        },
      })),

      resetAllProgress: () => set({ progress: initialProgress, noteErrors: {} }),
    }),
    {
      name: 'musicmaster-progress',
      partialize: (s) => ({
        progress:          s.progress,
        audioEnabled:      s.audioEnabled,
        theme:             s.theme,
        penaltyValue:      s.penaltyValue,
        selectedCharacter: s.selectedCharacter,
        noteErrors:        s.noteErrors,
      }),
    },
  ),
)

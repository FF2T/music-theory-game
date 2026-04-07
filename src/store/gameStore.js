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

      // ── Actions ──────────────────────────────────────────────────────────
      recordAnswer: ({ correct, exerciseId, responseTimeMs = 0 }) => {
        const { currentMode, progress, currentStreak } = get()
        if (!currentMode) return

        const newStreak    = correct ? currentStreak + 1 : 0
        const modeProgress = progress[currentMode]
        const bestStreak   = Math.max(modeProgress.bestStreak, newStreak)

        // +10 base, +5 bonus per streak level (capped at +25), −0 for wrong
        const points = correct ? 10 + Math.min(newStreak - 1, 5) * 5 : 0

        // Unicorn reward: +1 correct, −3 wrong (beginner only, capped 0-50)
        const prevUnicorn = modeProgress.unicornLevel ?? 0
        const unicornLevel = currentMode === 'beginner'
          ? Math.max(0, Math.min(50, correct ? prevUnicorn + 1 : prevUnicorn - 3))
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

      resetAllProgress: () => set({ progress: initialProgress }),
    }),
    {
      name: 'musicmaster-progress',
      partialize: (s) => ({
        progress:     s.progress,
        audioEnabled: s.audioEnabled,
        theme:        s.theme,
      }),
    },
  ),
)

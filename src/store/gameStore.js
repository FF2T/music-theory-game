import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

const DEFAULT_PLAYERS = [
  { id: 'constance', name: 'Constance' },
  { id: 'arthur',    name: 'Arthur' },
  { id: 'edgar',     name: 'Edgar' },
  { id: 'anne',      name: 'Anne' },
  { id: 'franck',    name: 'Franck' },
  { id: 'seb',       name: 'Seb' },
]

export const DIFFICULTY_CONFIGS = {
  facile: {
    label: 'Facile',
    emoji: '\u{1F331}',
    stars: 1,
    description: 'Cl\u00e9 de sol uniquement, notes sur la port\u00e9e',
    clefMode: 'treble-only',
    forceLedger: false,
    choiceStrategy: 'wide',
    weightBoost: 1,
    timeThresholds: [5, 15],
    penaltyMultiplier: 0.5,
  },
  normal: {
    label: 'Normal',
    emoji: '\u{1F3B5}',
    stars: 2,
    description: 'Alternance lente des cl\u00e9s, notes sur la port\u00e9e',
    clefMode: 'alternate-slow',
    forceLedger: false,
    choiceStrategy: 'normal',
    weightBoost: 3,
    timeThresholds: [3, 10],
    penaltyMultiplier: 1,
  },
  difficile: {
    label: 'Difficile',
    emoji: '\u{1F525}',
    stars: 3,
    description: 'Alternance rapide, notes hors port\u00e9e, choix proches',
    clefMode: 'alternate-fast',
    forceLedger: true,
    choiceStrategy: 'tight',
    weightBoost: 5,
    timeThresholds: [2, 7],
    penaltyMultiplier: 1.5,
  },
  expert: {
    label: 'Expert',
    emoji: '\u{1F480}',
    stars: 4,
    description: 'Cl\u00e9 al\u00e9atoire, toutes les notes, choix adjacents',
    clefMode: 'random',
    forceLedger: true,
    choiceStrategy: 'adjacent',
    weightBoost: 7,
    timeThresholds: [1.5, 5],
    penaltyMultiplier: 2,
  },
}

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}min ${seconds.toString().padStart(2, '0')}s`
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ── Players ─────────────────────────────────────────────────────────
      players: DEFAULT_PLAYERS,
      currentPlayerId: null,
      playerRecords: {},

      addPlayer: (name) => {
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
        set((s) => ({
          players: [...s.players, { id, name }],
          currentPlayerId: id,
        }))
      },

      setCurrentPlayer: (id) => set({ currentPlayerId: id }),

      // ── Difficulty ──────────────────────────────────────────────────────
      difficultyLevel: 'normal',
      setDifficulty: (level) => set({ difficultyLevel: level }),

      // ── Navigation ──────────────────────────────────────────────────────
      currentMode: null,
      currentExercise: null,

      setMode: (mode) => set({ currentMode: mode, currentExercise: null }),
      setExercise: (exerciseId) => set({ currentExercise: exerciseId }),

      // ── Session (non-persisted) ─────────────────────────────────────────
      sessionScore: 0,
      sessionAnswers: 0,
      sessionCorrect: 0,
      currentStreak: 0,
      lastFeedback: null,
      sessionStartTime: null,
      sessionComplete: false,

      startBeginnerSession: () => set((s) => ({
        sessionScore: 0,
        sessionAnswers: 0,
        sessionCorrect: 0,
        currentStreak: 0,
        lastFeedback: null,
        sessionStartTime: Date.now(),
        sessionComplete: false,
        progress: {
          ...s.progress,
          beginner: { ...s.progress.beginner, unicornLevel: 0 },
        },
      })),

      // ── Badge saving ────────────────────────────────────────────────────
      saveBadge: () => {
        const { currentPlayerId, selectedCharacter, difficultyLevel, sessionStartTime, playerRecords } = get()
        if (!currentPlayerId || !sessionStartTime) return

        const timeMs = Date.now() - sessionStartTime
        const existing = playerRecords[currentPlayerId]?.badges?.[selectedCharacter]

        // Save if new badge or better time
        if (!existing || timeMs < existing.time) {
          set((s) => ({
            playerRecords: {
              ...s.playerRecords,
              [currentPlayerId]: {
                ...s.playerRecords[currentPlayerId],
                badges: {
                  ...(s.playerRecords[currentPlayerId]?.badges || {}),
                  [selectedCharacter]: {
                    time: timeMs,
                    difficulty: difficultyLevel,
                    date: new Date().toISOString().slice(0, 10),
                  },
                },
              },
            },
            sessionComplete: true,
          }))
        } else {
          set({ sessionComplete: true })
        }
      },

      // ── Persistent progress ──────────────────────────────────────────────
      progress: initialProgress,

      // ── Audio preference ────────────────────────────────────────────────
      audioEnabled: true,
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

      // ── Theme ───────────────────────────────────────────────────────────
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // ── Scoring settings ────────────────────────────────────────────────
      penaltyValue: -2,
      setPenaltyValue: (v) => set({ penaltyValue: v }),

      // ── Character selection ─────────────────────────────────────────────
      selectedCharacter: 'unicorn',
      setCharacter: (id) => set({ selectedCharacter: id }),

      // ── Note error tracking (adaptive difficulty) ───────────────────────
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
        const { currentMode, progress, currentStreak, penaltyValue, difficultyLevel } = get()
        if (!currentMode) return

        const newStreak    = correct ? currentStreak + 1 : 0
        const modeProgress = progress[currentMode]
        const bestStreak   = Math.max(modeProgress.bestStreak, newStreak)

        const points = correct ? 10 + Math.min(newStreak - 1, 5) * 5 : 0

        // Character reward (beginner only, capped 0-50)
        const diffConfig = DIFFICULTY_CONFIGS[difficultyLevel] || DIFFICULTY_CONFIGS.normal
        const [fastThreshold, slowThreshold] = diffConfig.timeThresholds
        const penaltyMult = diffConfig.penaltyMultiplier

        const prevUnicorn = modeProgress.unicornLevel ?? 0
        let unicornDelta = Math.round(penaltyValue * penaltyMult)
        if (correct) {
          if (responseTimeMs < fastThreshold * 1000) unicornDelta = 2
          else if (responseTimeMs <= slowThreshold * 1000) unicornDelta = 1
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

        // Clear feedback after 1.2s
        setTimeout(() => set({ lastFeedback: null }), 1200)

        // Check if unicorn reached 50
        if (currentMode === 'beginner' && unicornLevel >= 50 && prevUnicorn < 50) {
          setTimeout(() => get().saveBadge(), 1500)
        }
      },

      resetSession: () => set({
        sessionScore:   0,
        sessionAnswers: 0,
        sessionCorrect: 0,
        currentStreak:  0,
        lastFeedback:   null,
        sessionStartTime: null,
        sessionComplete: false,
      }),

      resetUnicorn: () => set((s) => ({
        progress: {
          ...s.progress,
          beginner: { ...s.progress.beginner, unicornLevel: 0 },
        },
      })),

      resetAllProgress: () => set({ progress: initialProgress, noteErrors: {}, playerRecords: {} }),
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
        players:           s.players,
        currentPlayerId:   s.currentPlayerId,
        playerRecords:     s.playerRecords,
        difficultyLevel:   s.difficultyLevel,
      }),
    },
  ),
)

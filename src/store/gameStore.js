import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveToCloud, savePlayerBadges, loadFromCloud, subscribeToCloud } from '../utils/firebase'

const initialProgress = {
  beginner:     { totalAnswered: 0, correctAnswers: 0, streak: 0, bestStreak: 0, unicornLevel: 0, unlockedExercises: ['note-reading'] },
  intermediate: { totalAnswered: 0, correctAnswers: 0, streak: 0, bestStreak: 0, unicornLevel: 0, unlockedExercises: ['intervals'] },
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
    description: 'Clé de sol uniquement, notes sur la portée',
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
    description: 'Alternance lente des clés, notes sur la portée',
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
    description: 'Alternance rapide, notes hors portée, choix proches',
    clefMode: 'alternate-fast',
    forceLedger: true,
    choiceStrategy: 'tight',
    weightBoost: 5,
    timeThresholds: [2, 7],
    penaltyMultiplier: 1.5,
  },
  expert: {
    label: 'Expert',
    emoji: '\u{1F916}',
    stars: 4,
    description: 'Clé aléatoire, toutes les notes, choix adjacents',
    clefMode: 'random',
    forceLedger: true,
    choiceStrategy: 'adjacent',
    weightBoost: 7,
    timeThresholds: [1.5, 5],
    penaltyMultiplier: 2,
  },
}

export const INTERVAL_DIFFICULTY_CONFIGS = {
  facile: {
    label: 'Facile', emoji: '\u{1F331}', stars: 1,
    description: 'Tierces et quinte, ascendant uniquement',
    intervals: ['3m', '3M', 'P5', 'P8'],
    allowDescending: false,
    clefMode: 'treble-only',
    choiceCount: 3,
    autoPlay: true,
    timeThresholds: [6, 18],
    penaltyMultiplier: 0.5,
  },
  normal: {
    label: 'Normal', emoji: '\u{1F3B5}', stars: 2,
    description: 'Plus d\'intervalles, ascendant',
    intervals: ['2M', '3m', '3M', 'P4', 'P5', '6M', 'P8'],
    allowDescending: false,
    clefMode: 'treble-only',
    choiceCount: 4,
    autoPlay: true,
    timeThresholds: [4, 12],
    penaltyMultiplier: 1,
  },
  difficile: {
    label: 'Difficile', emoji: '\u{1F525}', stars: 3,
    description: 'Tous les intervalles, ascendant et descendant',
    intervals: ['2m', '2M', '3m', '3M', 'P4', 'TT', 'P5', '6m', '6M', '7m', 'P8'],
    allowDescending: true,
    clefMode: 'alternate-slow',
    choiceCount: 4,
    autoPlay: false,
    timeThresholds: [3, 8],
    penaltyMultiplier: 1.5,
  },
  expert: {
    label: 'Expert', emoji: '\u{1F916}', stars: 4,
    description: 'Tous les intervalles, toutes les directions',
    intervals: ['2m', '2M', '3m', '3M', 'P4', 'TT', 'P5', '6m', '6M', '7m', '7M', 'P8'],
    allowDescending: true,
    clefMode: 'random',
    choiceCount: 4,
    autoPlay: false,
    timeThresholds: [2, 6],
    penaltyMultiplier: 2,
  },
}

const RACE_PILOT_THRESHOLD_MS = 6 * 60 * 1000 // 6 minutes

// Badge titles vary by difficulty – each character earns a different name
export const BADGE_TITLES = {
  facile: {
    unicorn: 'Bébé Licorne',  cat: 'Petit Chaton',   dragon: 'Bébé Dragon',
    bunny:   'Petit Lapin',   panda: 'Bébé Panda',   dolphin: 'Petit Dauphin',
  },
  normal: {
    unicorn: 'Licorne',       cat: 'Chaton',          dragon: 'Dragon',
    bunny:   'Lapin',         panda: 'Panda',         dolphin: 'Dauphin',
  },
  difficile: {
    unicorn: 'Licorne Magique', cat: 'Chaton Ninja',  dragon: 'Dragon de Feu',
    bunny:   'Lapin Véloce',    panda: 'Panda Guerrier', dolphin: 'Dauphin Acrobate',
  },
  expert: {
    unicorn: 'Licorne Céleste', cat: 'Chaton Suprême', dragon: 'Dragon Ancestral',
    bunny:   'Lapin Cosmique',  panda: 'Panda Maître', dolphin: 'Dauphin Mythique',
  },
}

export function getBadgeTitle(characterId, difficulty) {
  return BADGE_TITLES[difficulty]?.[characterId] || CHARACTERS.find(c => c.id === characterId)?.label || characterId
}

/**
 * Check legend / race pilot status for a player at a given difficulty.
 * Returns { isLegend, isRacePilot, badgeCount, totalTime }
 */
/**
 * Normalise a character badge entry to the new nested format:
 * { difficulty: { time, date }, ... }
 * Legacy flat format: { time, difficulty, date } → { [difficulty]: { time, date } }
 */
function normaliseBadgeEntry(entry) {
  if (!entry || typeof entry !== 'object') return {}
  if (entry.difficulty !== undefined && entry.time !== undefined) {
    return { [entry.difficulty]: { time: entry.time, date: entry.date } }
  }
  return entry
}

/**
 * Merge two badge maps (local + cloud), handling both legacy and new formats.
 * Keeps best time per character per difficulty.
 */
function mergeBadges(localBadges, cloudBadges) {
  const merged = {}
  const allCharIds = new Set([...Object.keys(localBadges), ...Object.keys(cloudBadges)])
  for (const charId of allCharIds) {
    const localEntry = normaliseBadgeEntry(localBadges[charId])
    const cloudEntry = normaliseBadgeEntry(cloudBadges[charId])
    const charMerged = { ...localEntry }
    for (const [diff, record] of Object.entries(cloudEntry)) {
      if (!charMerged[diff] || record.time < charMerged[diff].time) {
        charMerged[diff] = record
      }
    }
    merged[charId] = charMerged
  }
  return merged
}

export function getPlayerStatus(playerBadges, difficulty) {
  const matching = {}
  for (const [charId, rawEntry] of Object.entries(playerBadges || {})) {
    const entry = normaliseBadgeEntry(rawEntry)
    if (entry[difficulty]) {
      matching[charId] = entry[difficulty]
    }
  }
  const badgeCount = Object.keys(matching).length
  const totalTime = Object.values(matching).reduce((sum, r) => sum + r.time, 0)
  const isLegend = badgeCount >= CHARACTERS.length
  const isRacePilot = isLegend && totalTime <= RACE_PILOT_THRESHOLD_MS
  return { isLegend, isRacePilot, badgeCount, totalTime, badges: matching }
}

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}min ${seconds.toString().padStart(2, '0')}s`
}

/** Return the progress object for the current player (or initialProgress as fallback) */
export function getProgress(state) {
  const pid = state.currentPlayerId
  return (pid && state.playerProgress?.[pid]) || initialProgress
}

/** Return a new playerProgress with the current player's progress updated */
function setPlayerProgress(state, modeUpdates) {
  const pid = state.currentPlayerId
  if (!pid) return {}
  const prev = state.playerProgress?.[pid] || initialProgress
  return {
    playerProgress: {
      ...state.playerProgress,
      [pid]: { ...prev, ...modeUpdates },
    },
  }
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ── Players ─────────────────────────────────────────────────────────
      players: DEFAULT_PLAYERS,
      currentPlayerId: null,
      playerRecords: {},

      addPlayer: (name) => {
        const existing = get().players
        if (existing.some((p) => p.name.toLowerCase() === name.toLowerCase())) return false
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
        set((s) => ({
          players: [...s.players, { id, name }],
          currentPlayerId: id,
        }))
        // Sync to cloud
        const { players, playerRecords } = get()
        saveToCloud(players, playerRecords)
      },

      setCurrentPlayer: (id) => set({ currentPlayerId: id }),

      setPlayerPin: (id, pin) => {
        set((s) => ({
          players: s.players.map((p) => p.id === id ? { ...p, pin } : p),
        }))
        const { players, playerRecords } = get()
        saveToCloud(players, playerRecords)
      },

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

      startBeginnerSession: () => set((s) => {
        const prog = getProgress(s)
        return {
          sessionScore: 0,
          sessionAnswers: 0,
          sessionCorrect: 0,
          currentStreak: 0,
          lastFeedback: null,
          sessionStartTime: Date.now(),
          sessionComplete: false,
          ...setPlayerProgress(s, { beginner: { ...prog.beginner, unicornLevel: 0 } }),
        }
      }),

      startIntermediateSession: () => set((s) => {
        const prog = getProgress(s)
        return {
          sessionScore: 0,
          sessionAnswers: 0,
          sessionCorrect: 0,
          currentStreak: 0,
          lastFeedback: null,
          sessionStartTime: Date.now(),
          sessionComplete: false,
          ...setPlayerProgress(s, { intermediate: { ...prog.intermediate, unicornLevel: 0 } }),
        }
      }),

      // ── Badge saving ────────────────────────────────────────────────────
      saveBadge: () => {
        const { currentPlayerId, selectedCharacter, difficultyLevel, currentMode, sessionStartTime, playerRecords } = get()
        if (!currentPlayerId || !sessionStartTime) return

        const badgeKey = currentMode === 'intermediate' ? 'intervalBadges' : 'badges'
        const timeMs = Date.now() - sessionStartTime
        const normalised = normaliseBadgeEntry(playerRecords[currentPlayerId]?.[badgeKey]?.[selectedCharacter])
        const existing = normalised[difficultyLevel]

        // Save if new badge or better time
        if (!existing || timeMs < existing.time) {
          set((s) => {
            const prev = normaliseBadgeEntry(s.playerRecords[currentPlayerId]?.[badgeKey]?.[selectedCharacter])
            return {
              playerRecords: {
                ...s.playerRecords,
                [currentPlayerId]: {
                  ...s.playerRecords[currentPlayerId],
                  [badgeKey]: {
                    ...(s.playerRecords[currentPlayerId]?.[badgeKey] || {}),
                    [selectedCharacter]: {
                      ...prev,
                      [difficultyLevel]: {
                        time: timeMs,
                        date: new Date().toISOString().slice(0, 10),
                      },
                    },
                  },
                },
              },
              sessionComplete: true,
            }
          })
          // Sync to cloud (targeted write for the specific badge set)
          const state = get()
          const record = state.playerRecords[currentPlayerId]
          if (record) savePlayerBadges(currentPlayerId, { badges: record.badges, intervalBadges: record.intervalBadges })
        } else {
          set({ sessionComplete: true })
        }
      },

      // ── Persistent progress (per player) ─────────────────────────────────
      playerProgress: {},

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
        const state = get()
        const { currentMode, currentStreak, penaltyValue, difficultyLevel } = state
        if (!currentMode) return

        const progress = getProgress(state)
        const newStreak    = correct ? currentStreak + 1 : 0
        const modeProgress = progress[currentMode] || initialProgress[currentMode] || { totalAnswered: 0, correctAnswers: 0, streak: 0, bestStreak: 0 }
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
        const hasCharacterProgression = currentMode === 'beginner' || currentMode === 'intermediate'
        const unicornLevel = hasCharacterProgression
          ? Math.max(0, Math.min(50, prevUnicorn + unicornDelta))
          : prevUnicorn

        set((s) => ({
          sessionScore:   s.sessionScore   + points,
          sessionAnswers: s.sessionAnswers + 1,
          sessionCorrect: s.sessionCorrect + (correct ? 1 : 0),
          currentStreak:  newStreak,
          lastFeedback:   correct ? 'correct' : 'wrong',
          ...setPlayerProgress(s, {
            [currentMode]: {
              ...modeProgress,
              totalAnswered: modeProgress.totalAnswered + 1,
              correctAnswers: modeProgress.correctAnswers + (correct ? 1 : 0),
              streak:     newStreak,
              bestStreak: bestStreak,
              ...(hasCharacterProgression ? { unicornLevel } : {}),
            },
          }),
        }))

        // Clear feedback after 1.2s
        setTimeout(() => set({ lastFeedback: null }), 500)

        // Check if unicorn reached 50
        if (hasCharacterProgression && unicornLevel >= 50 && prevUnicorn < 50) {
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

      resetUnicorn: () => set((s) => {
        const prog = getProgress(s)
        return setPlayerProgress(s, { beginner: { ...prog.beginner, unicornLevel: 0 } })
      }),

      resetAllProgress: () => {
        set({ playerProgress: {}, noteErrors: {}, playerRecords: {} })
        saveToCloud(get().players, {})
      },

      // ── Cloud sync ──────────────────────────────────────────────────────
      cloudLoaded: false,

      loadCloud: async () => {
        const data = await loadFromCloud()
        if (!data) { set({ cloudLoaded: true }); return }

        // Merge: cloud players + local players (deduplicate by id)
        const localPlayers = get().players
        const cloudPlayers = data.players || []
        const mergedMap = new Map()
        for (const p of localPlayers) mergedMap.set(p.id, p)
        for (const p of cloudPlayers) mergedMap.set(p.id, p)
        const mergedPlayers = [...mergedMap.values()]

        // Merge records: keep best time per badge per difficulty
        const localRecords = get().playerRecords || {}
        const cloudRecords = data.playerRecords || {}
        const mergedRecords = { ...localRecords }
        for (const [playerId, pData] of Object.entries(cloudRecords)) {
          if (!mergedRecords[playerId]) {
            mergedRecords[playerId] = {
              ...pData,
              badges: mergeBadges({}, pData.badges || {}),
              intervalBadges: mergeBadges({}, pData.intervalBadges || {}),
            }
          } else {
            mergedRecords[playerId] = {
              ...mergedRecords[playerId],
              badges: mergeBadges(mergedRecords[playerId].badges || {}, pData.badges || {}),
              intervalBadges: mergeBadges(mergedRecords[playerId].intervalBadges || {}, pData.intervalBadges || {}),
            }
          }
        }

        set({ players: mergedPlayers, playerRecords: mergedRecords, cloudLoaded: true })
      },

      subscribeCloud: () => {
        return subscribeToCloud((data) => {
          if (!data) return
          const localPlayers = get().players
          const cloudPlayers = data.players || []
          const mergedMap = new Map()
          for (const p of localPlayers) mergedMap.set(p.id, p)
          for (const p of cloudPlayers) mergedMap.set(p.id, p)

          const localRecords = get().playerRecords || {}
          const cloudRecords = data.playerRecords || {}
          const mergedRecords = { ...localRecords }
          for (const [playerId, pData] of Object.entries(cloudRecords)) {
            if (!mergedRecords[playerId]) {
              mergedRecords[playerId] = {
                ...pData,
                badges: mergeBadges({}, pData.badges || {}),
                intervalBadges: mergeBadges({}, pData.intervalBadges || {}),
              }
            } else {
              mergedRecords[playerId] = {
                ...mergedRecords[playerId],
                badges: mergeBadges(mergedRecords[playerId].badges || {}, pData.badges || {}),
                intervalBadges: mergeBadges(mergedRecords[playerId].intervalBadges || {}, pData.intervalBadges || {}),
              }
            }
          }

          set({ players: [...mergedMap.values()], playerRecords: mergedRecords })
        })
      },
    }),
    {
      name: 'musicmaster-progress',
      version: 2,
      migrate: (persisted, version) => {
        if (version === 0 || version === undefined) {
          // Migrate badges from flat { time, difficulty, date } to nested { [difficulty]: { time, date } }
          const records = persisted.playerRecords || {}
          for (const playerId of Object.keys(records)) {
            const badges = records[playerId]?.badges
            if (!badges) continue
            for (const charId of Object.keys(badges)) {
              badges[charId] = normaliseBadgeEntry(badges[charId])
            }
          }
        }
        if (version < 2) {
          // Migrate global progress → per-player progress
          // Old progress was shared; assign it to the current player if one is set
          if (persisted.progress && !persisted.playerProgress) {
            const pid = persisted.currentPlayerId
            if (pid) {
              persisted.playerProgress = { [pid]: persisted.progress }
            } else {
              persisted.playerProgress = {}
            }
            delete persisted.progress
          }
        }
        return persisted
      },
      partialize: (s) => ({
        playerProgress:    s.playerProgress,
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

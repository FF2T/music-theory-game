import { useState } from 'react'
import { Trophy, Crown, Gauge } from 'lucide-react'
import { useGameStore, CHARACTERS, DIFFICULTY_CONFIGS, formatTime, getPlayerStatus, getBadgeTitle } from '../../store/gameStore'

function LegendName({ name }) {
  return (
    <span className="font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-rainbow bg-[length:200%_auto]">
      {name}
    </span>
  )
}

const DIFF_KEYS = Object.keys(DIFFICULTY_CONFIGS)

export default function Scoreboard({ badgeKey = 'badges' }) {
  const players = useGameStore((s) => s.players)
  const playerRecords = useGameStore((s) => s.playerRecords)
  const [selectedDiff, setSelectedDiff] = useState('normal')

  const diffConfig = DIFFICULTY_CONFIGS[selectedDiff]

  // Build scoreboard data for selected difficulty
  const playerData = players.map((player) => {
    const allBadges = playerRecords[player.id]?.[badgeKey] || {}
    const status = getPlayerStatus(allBadges, selectedDiff)
    return { ...player, ...status }
  })

  // Sort: most badges first, then fastest total time
  playerData.sort((a, b) => {
    if (b.badgeCount !== a.badgeCount) return b.badgeCount - a.badgeCount
    if (a.badgeCount === 0) return 0
    return a.totalTime - b.totalTime
  })

  const activePlayers = playerData.filter((p) => p.badgeCount > 0)

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tableau des scores</h3>
      </div>

      {/* Difficulty tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {DIFF_KEYS.map((key) => {
          const config = DIFFICULTY_CONFIGS[key]
          return (
            <button
              key={key}
              onClick={() => setSelectedDiff(key)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                selectedDiff === key
                  ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-400'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10',
              ].join(' ')}
            >
              {config.emoji} {config.label}
            </button>
          )
        })}
      </div>

      {activePlayers.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 dark:text-gray-400">
            Aucun badge obtenu en {diffConfig.label}. Joue en mode Lecture de notes pour débloquer des badges !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activePlayers.map((player, idx) => (
            <div
              key={player.id}
              className={[
                'flex items-start gap-3 p-3 rounded-xl transition-all',
                player.isRacePilot
                  ? 'bg-gradient-to-r from-red-50 via-yellow-50 to-orange-50 dark:from-red-900/10 dark:via-yellow-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800/30'
                  : player.isLegend
                    ? 'bg-gradient-to-r from-yellow-50 to-purple-50 dark:from-yellow-900/10 dark:to-purple-900/10 border border-yellow-200 dark:border-yellow-800/30'
                    : 'bg-gray-50 dark:bg-white/5',
              ].join(' ')}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + Status badges */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {player.isLegend ? (
                    <LegendName name={player.name} />
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {player.name}
                    </span>
                  )}

                  {player.isLegend && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold">
                      <Crown className="w-3 h-3" />
                      Légende
                    </span>
                  )}

                  {player.isRacePilot && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold">
                      <Gauge className="w-3 h-3" />
                      Pilote de course
                    </span>
                  )}

                  <span className="text-[10px] text-gray-400 dark:text-gray-400">
                    {player.badgeCount}/{CHARACTERS.length}
                  </span>

                  {player.badgeCount > 0 && (
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-400">
                      cumul : {formatTime(player.totalTime)}
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {CHARACTERS.map((char) => {
                    const record = player.badges[char.id]
                    const title = getBadgeTitle(char.id, selectedDiff)
                    if (!record) {
                      return (
                        <span
                          key={char.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-300 dark:text-gray-500 text-xs opacity-40"
                          title={`${title} - non obtenu`}
                        >
                          <span className="grayscale">{char.emoji}</span>
                        </span>
                      )
                    }
                    return (
                      <span
                        key={char.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs"
                        title={`${title} - ${formatTime(record.time)}`}
                      >
                        <span>{char.emoji}</span>
                        <span className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                          {formatTime(record.time)}
                        </span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

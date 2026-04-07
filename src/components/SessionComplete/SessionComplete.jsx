import { useState, useEffect } from 'react'
import { Trophy, Star, Crown, ArrowRight } from 'lucide-react'
import { useGameStore, CHARACTERS, DIFFICULTY_CONFIGS, formatTime } from '../../store/gameStore'
import { Button } from '../ui/Button'
import CharacterReward from '../CharacterReward/CharacterReward'

export default function SessionComplete({ onContinue }) {
  const currentPlayerId = useGameStore((s) => s.currentPlayerId)
  const players = useGameStore((s) => s.players)
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const difficultyLevel = useGameStore((s) => s.difficultyLevel)
  const playerRecords = useGameStore((s) => s.playerRecords)
  const sessionStartTime = useGameStore((s) => s.sessionStartTime)

  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const player = players.find((p) => p.id === currentPlayerId)
  const charInfo = CHARACTERS.find((c) => c.id === selectedCharacter)
  const diffConfig = DIFFICULTY_CONFIGS[difficultyLevel] || DIFFICULTY_CONFIGS.normal
  const record = playerRecords[currentPlayerId]?.badges?.[selectedCharacter]
  const elapsedMs = record?.time || (sessionStartTime ? Date.now() - sessionStartTime : 0)

  // Check if legend
  const badges = playerRecords[currentPlayerId]?.badges || {}
  const badgeCount = Object.keys(badges).length
  const isLegend = badgeCount >= CHARACTERS.length

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8 animate-fade-in">
      {/* Confetti-like background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              fontSize: `${16 + Math.random() * 20}px`,
            }}
          >
            {['✨', '🎉', '🌟', '🎶', '💫'][i % 5]}
          </div>
        ))}
      </div>

      {showContent && (
        <div className="relative z-10 text-center max-w-md w-full">
          {/* Character display */}
          <div className="mb-6 w-48 h-48 mx-auto">
            <CharacterReward character={selectedCharacter} level={50} />
          </div>

          {/* Congratulations */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-up">
              F\u00e9licitations {player?.name} !
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tu as obtenu le badge <span className="font-bold">{charInfo?.emoji} {charInfo?.label}</span> !
            </p>
          </div>

          {/* Record card */}
          <div className="glass rounded-2xl p-5 mb-6 border border-yellow-200 dark:border-yellow-800/30 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/10 dark:to-transparent">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-900 dark:text-white">Record</span>
            </div>

            <div className="text-4xl font-mono font-bold text-primary-600 dark:text-primary-400 mb-2">
              {formatTime(elapsedMs)}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Difficult\u00e9 :</span>
              <span className="font-semibold">{diffConfig.emoji} {diffConfig.label}</span>
            </div>

            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: diffConfig.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </div>

          {/* Progress toward legend */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Badges obtenus : {badgeCount}/{CHARACTERS.length}
            </p>
            <div className="flex justify-center gap-2">
              {CHARACTERS.map((c) => (
                <span
                  key={c.id}
                  className={badges[c.id] ? '' : 'grayscale opacity-30'}
                  title={c.label}
                >
                  {c.emoji}
                </span>
              ))}
            </div>
          </div>

          {/* Legend achievement */}
          {isLegend && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-100 via-purple-100 to-pink-100 dark:from-yellow-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border border-yellow-300 dark:border-yellow-700/50 animate-slide-up">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  L\u00c9GENDE
                </span>
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tu as collect\u00e9 tous les badges ! Tu es un v\u00e9ritable Ma\u00eetre de la Musique !
              </p>
            </div>
          )}

          {/* Continue button */}
          <Button size="lg" onClick={onContinue} className="gap-2">
            Continuer
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  )
}

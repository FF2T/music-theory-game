import { useMemo } from 'react'
import UnicornReward from '../UnicornReward/UnicornReward'
import CatReward from './CatReward'
import DragonReward from './DragonReward'
import BunnyReward from './BunnyReward'
import PandaReward from './PandaReward'
import DolphinReward from './DolphinReward'
import { getBadgeTitle } from '../../store/gameStore'

const COMPONENTS = {
  unicorn: UnicornReward,
  cat:     CatReward,
  dragon:  DragonReward,
  bunny:   BunnyReward,
  panda:   PandaReward,
  dolphin: DolphinReward,
}

// Visual cap per difficulty: how far the character builds visually
const VISUAL_CAP = { facile: 35, normal: 45, difficile: 50, expert: 50 }

export default function CharacterReward({ character = 'unicorn', level = 0, difficulty = 'normal' }) {
  const Component = COMPONENTS[character] || UnicornReward
  const cap = VISUAL_CAP[difficulty] || 50
  const badgeTitle = getBadgeTitle(character, difficulty)

  const cosmicStars = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 0.3 + Math.random() * 1.2,
      d: 1 + Math.random() * 3,
      delay: Math.random() * 3,
    })), [])

  return (
    <div className="relative">
      {/* Expert cosmic background */}
      {difficulty === 'expert' && level >= 30 && (
        <div className="absolute inset-0 -m-4 overflow-hidden rounded-2xl pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
            <defs>
              <radialGradient id="cosmic-glow">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#cosmic-glow)" />
            {cosmicStars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r}
                fill={i % 3 === 0 ? '#c4b5fd' : i % 3 === 1 ? '#fbbf24' : '#93c5fd'}
                opacity="0.6">
                <animate attributeName="opacity" values="0.1;0.8;0.1"
                  dur={`${s.d}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </svg>
        </div>
      )}

      <Component level={level} visualCap={cap} badgeTitle={badgeTitle} />
    </div>
  )
}

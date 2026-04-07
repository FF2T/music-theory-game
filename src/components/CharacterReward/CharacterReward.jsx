import UnicornReward from '../UnicornReward/UnicornReward'
import CatReward from './CatReward'
import DragonReward from './DragonReward'
import BunnyReward from './BunnyReward'
import PandaReward from './PandaReward'
import DolphinReward from './DolphinReward'

const COMPONENTS = {
  unicorn: UnicornReward,
  cat:     CatReward,
  dragon:  DragonReward,
  bunny:   BunnyReward,
  panda:   PandaReward,
  dolphin: DolphinReward,
}

export default function CharacterReward({ character = 'unicorn', level = 0 }) {
  const Component = COMPONENTS[character] || UnicornReward
  return <Component level={level} />
}

import { useMemo } from 'react'

/**
 * Cute baby dragon that builds up progressively over 50 levels.
 */

const MAX_LEVEL = 50

function op(level, start, end = start + 4) {
  if (level < start) return 0
  if (level >= end) return 1
  return (level - start) / (end - start)
}

export default function DragonReward({ level = 0, visualCap = 50, badgeTitle = '' }) {
  const l = Math.max(0, Math.min(MAX_LEVEL, level))
  const v = Math.min(l, visualCap)
  const colored = v >= 31
  const animated = v >= 36
  const pct = Math.round((l / MAX_LEVEL) * 100)

  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      x: 20 + Math.random() * 360,
      y: 10 + Math.random() * 270,
      r: 1 + Math.random() * 2.5,
      d: 1.3 + Math.random() * 2,
    })), [])

  const body   = colored ? '#34d399' : '#8b8fa0'
  const stroke = colored ? '#059669' : '#6b7280'
  const belly  = colored ? '#fef3c7' : '#aaa'
  const wing   = colored ? '#a7f3d0' : '#bbb'
  const horn   = colored ? '#fbbf24' : '#999'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: l >= 50
                ? 'linear-gradient(90deg,#34d399,#fbbf24,#f87171,#60a5fa,#a78bfa)'
                : l >= 35
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : 'linear-gradient(90deg,#10b981,#059669)',
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right">{l}/{MAX_LEVEL}</span>
      </div>

      <svg viewBox="0 0 400 300" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="dg">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d1fae5" stopOpacity="0" />
          </radialGradient>
          <filter id="df">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ghost */}
        <g opacity={v === 0 ? 0.12 : 0} stroke="#9ca3af" fill="none" strokeWidth="1.2" strokeDasharray="5 5">
          <ellipse cx="200" cy="168" rx="65" ry="48" />
          <circle cx="220" cy="100" r="35" />
          <line x1="160" y1="210" x2="155" y2="255" />
          <line x1="240" y1="210" x2="245" y2="255" />
        </g>

        {/* Level 50 glow */}
        {v >= 50 && (
          <ellipse cx="200" cy="155" rx="170" ry="135" fill="url(#dg)">
            <animate attributeName="rx" values="170;182;170" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* 1-5: Body - chubby dragon body */}
        <g opacity={op(v, 1, 5)} style={{ transition: 'all 0.8s' }}>
          <ellipse cx="195" cy="172" rx="70" ry="48" fill={body} stroke={stroke} strokeWidth="1.8" />
          {/* Belly */}
          <ellipse cx="200" cy="180" rx="38" ry="30" fill={belly} opacity={colored ? 0.7 : 0.2} />
          {/* Back spikes */}
          {colored && (
            <g fill="#10b981" opacity="0.6">
              {[160, 175, 190, 205, 220].map((x, i) => (
                <path key={i} d={`M ${x - 5} ${130 + i * 2} L ${x} ${118 + i * 2} L ${x + 5} ${130 + i * 2}`} />
              ))}
            </g>
          )}
        </g>

        {/* 6-10: Head */}
        <g opacity={op(v, 6, 10)} style={{ transition: 'all 0.8s' }}>
          {/* Neck */}
          <path d="M 240 150 C 260 135, 268 118, 265 105"
            stroke={body} strokeWidth="32" strokeLinecap="round" fill="none" />
          {/* Head */}
          <ellipse cx="268" cy="98" rx="38" ry="32" fill={body} stroke={stroke} strokeWidth="1.8" />
          {/* Snout */}
          <ellipse cx="298" cy="105" rx="16" ry="12" fill={colored ? '#6ee7b7' : '#9ca3af'} stroke={stroke} strokeWidth="1.2" />
          {/* Nostrils */}
          <circle cx="304" cy="103" r="2" fill={colored ? '#065f46' : '#555'} opacity="0.5" />
          <circle cx="299" cy="105" r="1.8" fill={colored ? '#065f46' : '#555'} opacity="0.4" />
          {/* Smile */}
          <path d="M 306 110 Q 298 116 290 112" stroke={colored ? '#065f46' : '#666'} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* 11-15: Legs */}
        <g opacity={op(v, 11, 15)} style={{ transition: 'all 0.8s' }}>
          {[{ x: 155, a: -2 }, { x: 175, a: 0 }, { x: 220, a: 0 }, { x: 240, a: 2 }].map((leg, i) => (
            <g key={i}>
              <rect x={leg.x - 8} y="210" width="16" height="38" rx="8"
                fill={body} stroke={stroke} strokeWidth="1.2"
                transform={`rotate(${leg.a} ${leg.x} 229)`} />
              <ellipse cx={leg.x} cy="250" rx="10" ry="6" fill={colored ? '#059669' : '#777'} />
              {/* Claws */}
              {colored && (
                <g fill="#fbbf24" opacity="0.6">
                  <circle cx={leg.x - 4} cy="252" r="1.5" />
                  <circle cx={leg.x} cy="253" r="1.5" />
                  <circle cx={leg.x + 4} cy="252" r="1.5" />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* 16-20: Tail */}
        <g opacity={op(v, 16, 20)} style={{ transition: 'all 0.8s' }}>
          <path
            d="M 130 168 C 100 155, 75 160, 60 175 C 45 165, 35 175, 42 190"
            stroke={body} strokeWidth="10" fill="none" strokeLinecap="round"
          >
            {animated && (
              <animate attributeName="d" dur="2.5s" repeatCount="indefinite"
                values="M 130 168 C 100 155,75 160,60 175 C 45 165,35 175,42 190;
                        M 130 168 C 102 150,77 155,62 170 C 47 160,37 170,44 185;
                        M 130 168 C 100 155,75 160,60 175 C 45 165,35 175,42 190" />
            )}
          </path>
          {/* Tail tip - spade shape */}
          <path d="M 42 190 C 30 180, 25 195, 35 200 C 25 205, 30 215, 42 205"
            fill={colored ? '#059669' : '#888'} />
        </g>

        {/* 21-25: Horns + ears */}
        <g opacity={op(v, 21, 25)} style={{ transition: 'all 0.8s' }}>
          {/* Small horns */}
          <path d="M 258 72 L 250 45 L 268 68" fill={horn} stroke={colored ? '#d97706' : '#888'} strokeWidth="1" />
          <path d="M 278 72 L 285 48 L 290 70" fill={horn} stroke={colored ? '#d97706' : '#888'} strokeWidth="1" />
          {/* Ear ridges */}
          <path d="M 248 78 Q 255 70 262 78" fill={colored ? '#6ee7b7' : '#999'} />
          <path d="M 275 78 Q 282 72 288 80" fill={colored ? '#6ee7b7' : '#999'} />
        </g>

        {/* 26-30: Eyes */}
        <g opacity={op(v, 26, 30)} style={{ transition: 'all 0.8s' }}>
          {[258, 282].map((cx, i) => (
            <g key={i}>
              <ellipse cx={cx} cy="95" rx="9" ry="10" fill="white" stroke={colored ? '#065f46' : '#444'} strokeWidth="1.5" />
              <ellipse cx={cx + 1} cy="94" rx="6" ry="7" fill={colored ? '#f59e0b' : '#333'} />
              <ellipse cx={cx + 1} cy="93" rx="3" ry="4.5" fill="#1a1a2e" />
              <circle cx={cx + 4} cy="91" r="2.5" fill="white" />
              <circle cx={cx - 2} cy="96" r="1.2" fill="white" opacity="0.7" />
            </g>
          ))}
        </g>

        {/* 36-40: Wings + fire breath */}
        <g opacity={op(v, 36, 40)} style={{ transition: 'all 0.8s' }}>
          {/* Wings */}
          <path
            d="M 190 145 C 170 110, 140 90, 115 100 C 100 80, 85 90, 95 110 C 80 105, 78 118, 95 125 C 110 130, 145 138, 175 148"
            fill={wing} stroke={stroke} strokeWidth="1" opacity="0.7"
          >
            {animated && (
              <animate attributeName="d" dur="3s" repeatCount="indefinite"
                values="M 190 145 C 170 110,140 90,115 100 C 100 80,85 90,95 110 C 80 105,78 118,95 125 C 110 130,145 138,175 148;
                        M 190 145 C 172 105,142 85,117 95 C 102 75,87 85,97 105 C 82 100,80 113,97 120 C 112 125,147 133,177 143;
                        M 190 145 C 170 110,140 90,115 100 C 100 80,85 90,95 110 C 80 105,78 118,95 125 C 110 130,145 138,175 148" />
            )}
          </path>
          {/* Wing veins */}
          <g stroke={colored ? '#059669' : '#999'} strokeWidth="0.6" fill="none" opacity="0.4">
            <path d="M 170 140 Q 140 115 110 108" />
            <path d="M 175 143 Q 135 120 98 115" />
          </g>
          {/* Small fire breath */}
          {animated && (
            <g opacity="0.6">
              <ellipse cx="318" cy="100" rx="8" ry="5" fill="#f87171">
                <animate attributeName="rx" values="6;10;6" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="0.8s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="325" cy="98" rx="5" ry="3" fill="#fbbf24">
                <animate attributeName="rx" values="4;7;4" dur="0.7s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}
        </g>

        {/* 41-45: Sparkles + gems */}
        <g opacity={op(v, 41, 45)} style={{ transition: 'opacity 0.8s' }}>
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill={i % 3 === 0 ? '#34d399' : i % 3 === 1 ? '#fbbf24' : '#60a5fa'} opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Gems */}
          {[{ x: 55, y: 45, c: '#f87171' }, { x: 350, y: 55, c: '#60a5fa' }, { x: 45, y: 230, c: '#a78bfa' }].map((g, i) => (
            <g key={i} opacity="0.5">
              <path d={`M ${g.x} ${g.y - 8} L ${g.x + 7} ${g.y} L ${g.x} ${g.y + 8} L ${g.x - 7} ${g.y} Z`} fill={g.c} />
              <path d={`M ${g.x} ${g.y - 8} L ${g.x + 7} ${g.y} L ${g.x} ${g.y} Z`} fill="white" opacity="0.3" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2.5 + i * 0.5}s`} repeatCount="indefinite" />
            </g>
          ))}
        </g>

        {/* 46-49: Hearts + stars */}
        <g opacity={op(v, 46, 49)} style={{ transition: 'opacity 0.8s' }}>
          {[{ x: 360, y: 30, c: '#f472b6', s: 0.9 }, { x: 30, y: 160, c: '#fb7185', s: 0.7 }].map((h, i) => (
            <path key={i}
              d={`M ${h.x} ${h.y + 4 * h.s} C ${h.x - 6 * h.s} ${h.y - 6 * h.s}, ${h.x - 12 * h.s} ${h.y + 2 * h.s}, ${h.x} ${h.y + 12 * h.s} C ${h.x + 12 * h.s} ${h.y + 2 * h.s}, ${h.x + 6 * h.s} ${h.y - 6 * h.s}, ${h.x} ${h.y + 4 * h.s} Z`}
              fill={h.c} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>

        {/* Level 50: Crown + treasure */}
        {v >= 50 && (
          <g filter="url(#df)">
            {/* Crown */}
            <path d="M 248 68 L 245 50 L 255 58 L 260 40 L 268 55 L 275 38 L 280 52 L 288 42 L 285 60 L 290 50 L 288 68 Z"
              fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
            <circle cx="260" cy="44" r="2.5" fill="#f87171" />
            <circle cx="275" cy="42" r="2.5" fill="#60a5fa" />
            {/* Extra glow */}
            <circle cx="268" cy="42" r="8" fill="#fef3c7" opacity="0.4">
              <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>

      <p className="text-xs text-center font-medium" style={{
        color: l >= 50 ? '#fbbf24' : v >= 30 ? '#34d399' : '#9ca3af',
      }}>
        {l >= 50 && `✨ ${badgeTitle || 'Dragon'} obtenu ! Gardien des mélodies ! ✨`}
        {l < 50 && v === 0 && 'Réponds correctement pour faire apparaître le dragon !'}
        {l < 50 && v >= 1  && v < 6  && 'Un corps écailleux se forme...'}
        {l < 50 && v >= 6  && v < 11 && 'Une tête adorable apparaît !'}
        {l < 50 && v >= 11 && v < 16 && 'Il se dresse sur ses pattes !'}
        {l < 50 && v >= 16 && v < 21 && 'Une queue avec un bout en coeur !'}
        {l < 50 && v >= 21 && v < 26 && 'Des petites cornes et des oreilles !'}
        {l < 50 && v >= 26 && v < 31 && 'De grands yeux dorés et curieux !'}
        {l < 50 && v >= 31 && v < 36 && 'De belles écailles émeraude !'}
        {l < 50 && v >= 36 && v < 41 && 'Il déploie ses ailes et crache du feu !'}
        {l < 50 && v >= 41 && v < 46 && 'Des gemmes brillent autour de lui !'}
        {l < 50 && v >= 46 && 'Presque légendaire... encore un effort !'}
      </p>
    </div>
  )
}

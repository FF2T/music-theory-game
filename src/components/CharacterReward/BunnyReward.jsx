import { useMemo } from 'react'

/**
 * Cute kawaii bunny that builds up progressively over 50 levels.
 */

const MAX_LEVEL = 50

function op(level, start, end = start + 4) {
  if (level < start) return 0
  if (level >= end) return 1
  return (level - start) / (end - start)
}

export default function BunnyReward({ level = 0, visualCap = 50, badgeTitle = '' }) {
  const l = Math.max(0, Math.min(MAX_LEVEL, level))
  const v = Math.min(l, visualCap)
  const colored = v >= 31
  const animated = v >= 36
  const pct = Math.round((l / MAX_LEVEL) * 100)

  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      x: 20 + Math.random() * 360,
      y: 10 + Math.random() * 270,
      r: 1 + Math.random() * 2,
      d: 1.4 + Math.random() * 2,
    })), [])

  const body   = colored ? '#fce7f3' : '#8b8fa0'
  const stroke = colored ? '#ec4899' : '#6b7280'
  const inner  = colored ? '#fbcfe8' : '#aaa'
  const nose   = colored ? '#f472b6' : '#888'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: l >= 50
                ? 'linear-gradient(90deg,#f9a8d4,#f472b6,#ec4899,#db2777)'
                : l >= 35
                  ? 'linear-gradient(90deg,#f9a8d4,#f472b6)'
                  : 'linear-gradient(90deg,#f472b6,#ec4899)',
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right">{l}/{MAX_LEVEL}</span>
      </div>

      <svg viewBox="0 0 400 300" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg">
            <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fce7f3" stopOpacity="0" />
          </radialGradient>
          <filter id="bf">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ghost */}
        <g opacity={v === 0 ? 0.12 : 0} stroke="#9ca3af" fill="none" strokeWidth="1.2" strokeDasharray="5 5">
          <ellipse cx="200" cy="175" rx="55" ry="50" />
          <circle cx="200" cy="110" r="35" />
          <line x1="185" y1="55" x2="185" y2="15" />
          <line x1="215" y1="55" x2="215" y2="15" />
        </g>

        {v >= 50 && (
          <ellipse cx="200" cy="155" rx="165" ry="130" fill="url(#bg)">
            <animate attributeName="rx" values="165;175;165" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* 1-5: Body */}
        <g opacity={op(v, 1, 5)} style={{ transition: 'all 0.8s' }}>
          <ellipse cx="200" cy="185" rx="58" ry="50" fill={body} stroke={stroke} strokeWidth="1.8" />
          {colored && <ellipse cx="200" cy="190" rx="35" ry="30" fill="white" opacity="0.25" />}
        </g>

        {/* 6-10: Head */}
        <g opacity={op(v, 6, 10)} style={{ transition: 'all 0.8s' }}>
          <circle cx="200" cy="118" r="40" fill={body} stroke={stroke} strokeWidth="1.8" />
          {/* Puffy cheeks */}
          {colored && (
            <>
              <ellipse cx="173" cy="130" rx="9" ry="6" fill="#f9a8d4" opacity="0.45" />
              <ellipse cx="227" cy="130" rx="9" ry="6" fill="#f9a8d4" opacity="0.45" />
            </>
          )}
        </g>

        {/* 11-15: Legs + fluffy tail */}
        <g opacity={op(v, 11, 15)} style={{ transition: 'all 0.8s' }}>
          {/* Back legs (big, round) */}
          {[170, 230].map((x, i) => (
            <g key={i}>
              <ellipse cx={x} cy="230" rx="18" ry="22" fill={body} stroke={stroke} strokeWidth="1.2" />
              <ellipse cx={x + (i === 0 ? -5 : 5)} cy="248" rx="12" ry="6" fill={inner} />
              {/* Paw pads */}
              {colored && (
                <g fill="#f9a8d4" opacity="0.5">
                  <circle cx={x + (i === 0 ? -8 : 2)} cy="246" r="2" />
                  <circle cx={x + (i === 0 ? -2 : 8)} cy="246" r="2" />
                  <circle cx={x + (i === 0 ? -5 : 5)} cy="243" r="2.5" />
                </g>
              )}
            </g>
          ))}
          {/* Front paws (small) */}
          {[185, 215].map((x, i) => (
            <g key={`f${i}`}>
              <ellipse cx={x} cy="225" rx="8" ry="10" fill={body} stroke={stroke} strokeWidth="1" />
              <ellipse cx={x} cy="232" rx="6" ry="4" fill={inner} />
            </g>
          ))}
          {/* Fluffy tail */}
          <circle cx="255" cy="195" r="14" fill={body} stroke={stroke} strokeWidth="1" />
          {colored && <circle cx="255" cy="195" r="8" fill="white" opacity="0.3" />}
        </g>

        {/* 16-20: Long ears */}
        <g opacity={op(v, 16, 20)} style={{ transition: 'all 0.8s' }}>
          {/* Left ear */}
          <path d="M 185 82 C 178 40, 172 5, 178 15 C 172 -5, 188 10, 190 30 C 192 10, 198 -5, 195 15 C 200 5, 196 40, 192 82"
            fill={body} stroke={stroke} strokeWidth="1.5" />
          {colored && (
            <path d="M 186 78 C 180 42, 177 15, 182 20 C 185 12, 191 15, 190 35 C 192 15, 195 12, 192 20 C 196 15, 194 42, 191 78"
              fill={inner} opacity="0.5" />
          )}
          {/* Right ear */}
          <path d="M 208 82 C 202 40, 198 5, 205 15 C 198 -5, 212 10, 215 30 C 218 10, 222 -5, 218 15 C 225 5, 218 40, 212 82"
            fill={body} stroke={stroke} strokeWidth="1.5" />
          {colored && (
            <path d="M 209 78 C 204 42, 201 15, 207 20 C 210 12, 214 15, 214 35 C 216 15, 219 12, 216 20 C 221 15, 217 42, 213 78"
              fill={inner} opacity="0.5" />
          )}
          {/* Ear animation */}
          {animated && (
            <g>
              <animateTransform attributeName="transform" type="rotate"
                values="0 200 80; 3 200 80; 0 200 80; -3 200 80; 0 200 80"
                dur="4s" repeatCount="indefinite" />
            </g>
          )}
        </g>

        {/* 21-25: Buck teeth + nose details */}
        <g opacity={op(v, 21, 25)} style={{ transition: 'all 0.8s' }}>
          {/* Nose */}
          <ellipse cx="200" cy="128" rx="5" ry="4" fill={nose} />
          {/* Nose shine */}
          <circle cx="198" cy="127" r="1.5" fill="white" opacity="0.5" />
          {/* Mouth line */}
          <path d="M 200 132 L 200 138" stroke={colored ? '#be185d' : '#666'} strokeWidth="1" />
          {/* Buck teeth */}
          <rect x="195" y="136" width="4.5" height="6" rx="1.5" fill="white" stroke={colored ? '#e5e7eb' : '#999'} strokeWidth="0.8" />
          <rect x="200.5" y="136" width="4.5" height="6" rx="1.5" fill="white" stroke={colored ? '#e5e7eb' : '#999'} strokeWidth="0.8" />
          {/* Mouth curves */}
          <path d="M 200 138 Q 190 144 185 140" stroke={colored ? '#be185d' : '#666'} strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M 200 138 Q 210 144 215 140" stroke={colored ? '#be185d' : '#666'} strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>

        {/* 26-30: Big kawaii eyes */}
        <g opacity={op(v, 26, 30)} style={{ transition: 'all 0.8s' }}>
          {[184, 216].map((cx, i) => (
            <g key={i}>
              <ellipse cx={cx} cy="115" rx="10" ry="11" fill="white" stroke={colored ? '#9d174d' : '#444'} strokeWidth="1.5" />
              <ellipse cx={cx + 1} cy="114" rx="7" ry="8" fill={colored ? '#7c2d12' : '#333'} />
              <ellipse cx={cx + 1.5} cy="113" rx="4" ry="5" fill="#1a1a2e" />
              <circle cx={cx + 4} cy="111" r="3" fill="white" />
              <circle cx={cx - 2} cy="116" r="1.5" fill="white" opacity="0.7" />
              {/* Lashes */}
              <path d={`M ${cx - 8} ${115 - 7} Q ${cx - 4} ${115 - 11} ${cx} ${115 - 9}`}
                stroke={colored ? '#9d174d' : '#333'} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* 36-40: Animated bounce + nose twitch */}
        {animated && (
          <g opacity={op(v, 36, 40)}>
            {/* Whisker-like motion lines */}
            {[{ x: 168, y: 128, d: -1 }, { x: 232, y: 128, d: 1 }].map((w, i) => (
              <g key={i} opacity="0.3">
                <line x1={w.x} y1={w.y} x2={w.x + w.d * 20} y2={w.y - 3}
                  stroke={nose} strokeWidth="0.8">
                  <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                </line>
                <line x1={w.x} y1={w.y + 4} x2={w.x + w.d * 22} y2={w.y + 4}
                  stroke={nose} strokeWidth="0.8">
                  <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" />
                </line>
              </g>
            ))}
          </g>
        )}

        {/* 41-45: Sparkles + carrots */}
        <g opacity={op(v, 41, 45)} style={{ transition: 'opacity 0.8s' }}>
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill={i % 3 === 0 ? '#f9a8d4' : i % 3 === 1 ? '#fbbf24' : '#f472b6'} opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Carrot */}
          <g transform="translate(55, 220)" opacity="0.6">
            <path d="M 0 -5 L 5 18 L -5 18 Z" fill="#fb923c" />
            <path d="M -3 -8 Q 0 -15 3 -8" stroke="#22c55e" strokeWidth="2" fill="none" />
            <path d="M -5 -6 Q -2 -16 0 -10" stroke="#22c55e" strokeWidth="1.5" fill="none" />
            <path d="M 5 -6 Q 2 -16 0 -10" stroke="#22c55e" strokeWidth="1.5" fill="none" />
          </g>
          <g transform="translate(350, 240)" opacity="0.5">
            <path d="M 0 -4 L 4 15 L -4 15 Z" fill="#fb923c" />
            <path d="M -2 -7 Q 0 -13 2 -7" stroke="#22c55e" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* 46-49: Hearts + clovers */}
        <g opacity={op(v, 46, 49)} style={{ transition: 'opacity 0.8s' }}>
          {[{ x: 50, y: 55, c: '#f472b6', s: 1 }, { x: 355, y: 40, c: '#ec4899', s: 0.8 },
            { x: 365, y: 185, c: '#fb7185', s: 0.7 }].map((h, i) => (
            <path key={i}
              d={`M ${h.x} ${h.y + 4 * h.s} C ${h.x - 6 * h.s} ${h.y - 6 * h.s}, ${h.x - 12 * h.s} ${h.y + 2 * h.s}, ${h.x} ${h.y + 12 * h.s} C ${h.x + 12 * h.s} ${h.y + 2 * h.s}, ${h.x + 6 * h.s} ${h.y - 6 * h.s}, ${h.x} ${h.y + 4 * h.s} Z`}
              fill={h.c} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i * 0.6}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>

        {/* Level 50: Flower crown */}
        {v >= 50 && (
          <g filter="url(#bf)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const cx = 200 + 42 * Math.cos(rad)
              const cy = 82 + 12 * Math.sin(rad)
              const colors = ['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f9a8d4']
              return (
                <g key={i} transform={`translate(${cx},${cy})`}>
                  {[0, 60, 120, 180, 240, 300].map((a) => (
                    <ellipse key={a} cx="0" cy="-4" rx="2.5" ry="4.5" fill={colors[i]} opacity="0.8"
                      transform={`rotate(${a})`} />
                  ))}
                  <circle cx="0" cy="0" r="2" fill="#fbbf24" />
                </g>
              )
            })}
          </g>
        )}
      </svg>

      <p className="text-xs text-center font-medium" style={{
        color: l >= 50 ? '#ec4899' : v >= 30 ? '#f472b6' : '#9ca3af',
      }}>
        {l >= 50 && `✨ ${badgeTitle || 'Lapin'} obtenu ! Roi de la prairie ! ✨`}
        {l < 50 && v === 0 && 'Réponds correctement pour faire apparaître le lapin !'}
        {l < 50 && v >= 1  && v < 6  && 'Une petite boule de poils...'}
        {l < 50 && v >= 6  && v < 11 && 'Oh ! Une tête toute douce !'}
        {l < 50 && v >= 11 && v < 16 && 'Des petites pattes et une queue pompon !'}
        {l < 50 && v >= 16 && v < 21 && 'De grandes oreilles se déplient !'}
        {l < 50 && v >= 21 && v < 26 && 'Un petit nez et des dents trop mignonnes !'}
        {l < 50 && v >= 26 && v < 31 && 'De grands yeux tout ronds !'}
        {l < 50 && v >= 31 && v < 36 && 'Un pelage rose tout doux !'}
        {l < 50 && v >= 36 && v < 41 && 'Son nez frétille de joie !'}
        {l < 50 && v >= 41 && v < 46 && 'Il grignote une carotte !'}
        {l < 50 && v >= 46 && 'Presque légendaire... encore un effort !'}
      </p>
    </div>
  )
}

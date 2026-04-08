import { useMemo } from 'react'

/**
 * Cute kawaii panda that builds up progressively over 50 levels.
 */

const MAX_LEVEL = 50

function op(level, start, end = start + 4) {
  if (level < start) return 0
  if (level >= end) return 1
  return (level - start) / (end - start)
}

export default function PandaReward({ level = 0, visualCap = 50, badgeTitle = '' }) {
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

  const white  = colored ? '#f8fafc' : '#c0c0c0'
  const black  = colored ? '#1e293b' : '#6b7280'
  const stroke = colored ? '#334155' : '#555'
  const cheek  = colored ? '#f9a8d4' : 'transparent'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: l >= 50
                ? 'linear-gradient(90deg,#94a3b8,#64748b,#475569,#334155)'
                : l >= 35
                  ? 'linear-gradient(90deg,#94a3b8,#64748b)'
                  : 'linear-gradient(90deg,#64748b,#475569)',
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right">{l}/{MAX_LEVEL}</span>
      </div>

      <svg viewBox="0 0 400 300" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pg">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
          </radialGradient>
          <filter id="pf">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ghost */}
        <g opacity={v === 0 ? 0.12 : 0} stroke="#9ca3af" fill="none" strokeWidth="1.2" strokeDasharray="5 5">
          <ellipse cx="200" cy="175" rx="60" ry="55" />
          <circle cx="200" cy="105" r="42" />
        </g>

        {v >= 50 && (
          <ellipse cx="200" cy="155" rx="165" ry="130" fill="url(#pg)">
            <animate attributeName="rx" values="165;175;165" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* 1-5: Body */}
        <g opacity={op(v, 1, 5)} style={{ transition: 'all 0.8s' }}>
          <ellipse cx="200" cy="185" rx="62" ry="52" fill={white} stroke={stroke} strokeWidth="1.8" />
          {/* Belly */}
          {colored && <ellipse cx="200" cy="190" rx="38" ry="32" fill="white" opacity="0.3" />}
        </g>

        {/* 6-10: Head */}
        <g opacity={op(v, 6, 10)} style={{ transition: 'all 0.8s' }}>
          <circle cx="200" cy="108" r="45" fill={white} stroke={stroke} strokeWidth="1.8" />
        </g>

        {/* 11-15: Arms + Legs */}
        <g opacity={op(v, 11, 15)} style={{ transition: 'all 0.8s' }}>
          {/* Arms */}
          {[{ x: 148, r: -15 }, { x: 252, r: 15 }].map((arm, i) => (
            <g key={`a${i}`}>
              <ellipse cx={arm.x} cy="185" rx="16" ry="28" fill={black}
                transform={`rotate(${arm.r} ${arm.x} 185)`} />
              {colored && (
                <ellipse cx={arm.x + (i === 0 ? 3 : -3)} cy="205" rx="8" ry="5" fill="#64748b" opacity="0.3"
                  transform={`rotate(${arm.r} ${arm.x} 185)`} />
              )}
            </g>
          ))}
          {/* Legs */}
          {[170, 230].map((x, i) => (
            <g key={`l${i}`}>
              <ellipse cx={x} cy="235" rx="20" ry="16" fill={black} />
              {/* Paw pad */}
              {colored && (
                <g>
                  <ellipse cx={x + (i === 0 ? -2 : 2)} cy="238" rx="10" ry="8" fill="#475569" opacity="0.5" />
                  <circle cx={x + (i === 0 ? -7 : -3)} cy="232" r="3" fill="#64748b" opacity="0.4" />
                  <circle cx={x + (i === 0 ? 1 : 5)} cy="231" r="3" fill="#64748b" opacity="0.4" />
                  <circle cx={x + (i === 0 ? -3 : 1)} cy="229" r="3" fill="#64748b" opacity="0.4" />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* 16-20: Ears */}
        <g opacity={op(v, 16, 20)} style={{ transition: 'all 0.8s' }}>
          <circle cx="165" cy="75" r="18" fill={black} />
          <circle cx="235" cy="75" r="18" fill={black} />
          {colored && (
            <>
              <circle cx="165" cy="75" r="10" fill="#475569" opacity="0.4" />
              <circle cx="235" cy="75" r="10" fill="#475569" opacity="0.4" />
            </>
          )}
        </g>

        {/* 21-25: Nose + mouth */}
        <g opacity={op(v, 21, 25)} style={{ transition: 'all 0.8s' }}>
          {/* Nose */}
          <ellipse cx="200" cy="122" rx="6" ry="4.5" fill={colored ? '#1e293b' : '#777'} />
          <circle cx="198" cy="121" r="1.5" fill="white" opacity="0.4" />
          {/* Mouth */}
          <path d="M 200 126 Q 192 133 187 129" stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 200 126 Q 208 133 213 129" stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <ellipse cx="175" cy="128" rx="8" ry="5.5" fill={cheek} opacity="0.45" />
          <ellipse cx="225" cy="128" rx="8" ry="5.5" fill={cheek} opacity="0.45" />
        </g>

        {/* 26-30: Eyes (with black patches) */}
        <g opacity={op(v, 26, 30)} style={{ transition: 'all 0.8s' }}>
          {[182, 218].map((cx, i) => (
            <g key={i}>
              {/* Black eye patch */}
              <ellipse cx={cx} cy="105" rx="16" ry="14"
                fill={black} transform={`rotate(${i === 0 ? -10 : 10} ${cx} 105)`} />
              {/* Eye */}
              <ellipse cx={cx} cy="105" rx="8" ry="9" fill="white" stroke={stroke} strokeWidth="1" />
              <ellipse cx={cx + 1} cy="104" rx="5" ry="6" fill="#1e293b" />
              <circle cx={cx + 3} cy="102" r="2.5" fill="white" />
              <circle cx={cx - 1} cy="106" r="1.2" fill="white" opacity="0.6" />
            </g>
          ))}
        </g>

        {/* 36-40: Bamboo + animated munch */}
        <g opacity={op(v, 36, 40)} style={{ transition: 'all 0.8s' }}>
          {/* Bamboo stalk */}
          <g transform="translate(138, 155)">
            <rect x="-4" y="-40" width="8" height="80" rx="3" fill={colored ? '#86efac' : '#aaa'} />
            <rect x="-5" y="-15" width="10" height="3" rx="1" fill={colored ? '#4ade80' : '#999'} />
            <rect x="-5" y="10" width="10" height="3" rx="1" fill={colored ? '#4ade80' : '#999'} />
            <rect x="-5" y="30" width="10" height="3" rx="1" fill={colored ? '#4ade80' : '#999'} />
            {/* Leaf */}
            <path d="M 4 -35 Q 20 -45 25 -30 Q 15 -28 4 -35" fill={colored ? '#4ade80' : '#aaa'} />
            <path d="M 4 -10 Q 22 -18 26 -5 Q 15 -3 4 -10" fill={colored ? '#4ade80' : '#aaa'} opacity="0.7" />
          </g>
          {/* Munch animation */}
          {animated && (
            <g opacity="0.4">
              <circle cx="165" cy="130" r="3" fill="#86efac">
                <animate attributeName="opacity" values="0;0.6;0" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="cy" values="130;120;110" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </g>

        {/* 41-45: Sparkles + bamboo forest */}
        <g opacity={op(v, 41, 45)} style={{ transition: 'opacity 0.8s' }}>
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill={i % 3 === 0 ? '#86efac' : i % 3 === 1 ? '#fbbf24' : '#f9a8d4'} opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Mini bamboo shoots */}
          {[{ x: 355, h: 40 }, { x: 370, h: 30 }, { x: 45, h: 35 }].map((b, i) => (
            <g key={i} opacity="0.4">
              <rect x={b.x - 2} y={260 - b.h} width="4" height={b.h} rx="2" fill="#86efac" />
              <path d={`M ${b.x + 2} ${262 - b.h} Q ${b.x + 10} ${258 - b.h} ${b.x + 12} ${264 - b.h}`}
                fill="#4ade80" opacity="0.6" />
            </g>
          ))}
        </g>

        {/* 46-49: Hearts */}
        <g opacity={op(v, 46, 49)} style={{ transition: 'opacity 0.8s' }}>
          {[{ x: 50, y: 50, c: '#f472b6', s: 0.9 }, { x: 355, y: 45, c: '#fb7185', s: 0.8 },
            { x: 370, y: 170, c: '#f9a8d4', s: 0.7 }].map((h, i) => (
            <path key={i}
              d={`M ${h.x} ${h.y + 4 * h.s} C ${h.x - 6 * h.s} ${h.y - 6 * h.s}, ${h.x - 12 * h.s} ${h.y + 2 * h.s}, ${h.x} ${h.y + 12 * h.s} C ${h.x + 12 * h.s} ${h.y + 2 * h.s}, ${h.x + 6 * h.s} ${h.y - 6 * h.s}, ${h.x} ${h.y + 4 * h.s} Z`}
              fill={h.c} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i * 0.6}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>

        {/* Level 50: Flower crown + glow */}
        {v >= 50 && (
          <g filter="url(#pf)">
            {/* Simple crown of flowers */}
            {[170, 185, 200, 215, 230].map((x, i) => {
              const colors = ['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa', '#f472b6']
              return (
                <g key={i} transform={`translate(${x}, ${70 + Math.sin(i) * 3})`}>
                  {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse key={a} cx="0" cy="-3" rx="2" ry="4" fill={colors[i]} opacity="0.8"
                      transform={`rotate(${a})`} />
                  ))}
                  <circle cx="0" cy="0" r="2" fill="#fbbf24" />
                </g>
              )
            })}
            {/* Extra glow */}
            <circle cx="200" cy="108" r="50" fill="#fef3c7" opacity="0.1">
              <animate attributeName="opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>

      <p className="text-xs text-center font-medium" style={{
        color: l >= 50 ? '#64748b' : v >= 30 ? '#475569' : '#9ca3af',
      }}>
        {l >= 50 && `✨ ${badgeTitle || 'Panda'} obtenu ! Maître du bambou ! ✨`}
        {l < 50 && v === 0 && 'Réponds correctement pour faire apparaître le panda !'}
        {l < 50 && v >= 1  && v < 6  && 'Un corps tout rond et blanc...'}
        {l < 50 && v >= 6  && v < 11 && 'Oh ! Une grosse tête adorable !'}
        {l < 50 && v >= 11 && v < 16 && 'Des pattes noires et potelées !'}
        {l < 50 && v >= 16 && v < 21 && 'De petites oreilles rondes !'}
        {l < 50 && v >= 21 && v < 26 && 'Un petit nez et un sourire !'}
        {l < 50 && v >= 26 && v < 31 && 'Les yeux avec leurs taches noires !'}
        {l < 50 && v >= 31 && v < 36 && 'Le noir et blanc classique du panda !'}
        {l < 50 && v >= 36 && v < 41 && 'Il croque son bambou !'}
        {l < 50 && v >= 41 && v < 46 && 'Une forêt de bambou pousse !'}
        {l < 50 && v >= 46 && 'Presque légendaire... encore un effort !'}
      </p>
    </div>
  )
}

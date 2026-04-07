import { useMemo } from 'react'

/**
 * Cute kawaii cat that builds up progressively over 50 levels.
 *
 * Stages:
 *  0      → faint ghost outline
 *  1-5    → round body
 *  6-10   → big head + cute face shape
 *  11-15  → legs + paws
 *  16-20  → fluffy tail
 *  21-25  → pointy ears + whiskers
 *  26-30  → big kawaii eyes + nose + mouth
 *  31-35  → orange/calico colors bloom
 *  36-40  → animated tail swish + purr marks
 *  41-45  → sparkles + yarn ball + paw prints
 *  46-49  → hearts + fish + butterflies
 *  50     → golden bow + full glow
 */

const MAX_LEVEL = 50

function op(level, start, end = start + 4) {
  if (level < start) return 0
  if (level >= end) return 1
  return (level - start) / (end - start)
}

export default function CatReward({ level = 0 }) {
  const l = Math.max(0, Math.min(MAX_LEVEL, level))
  const colored = l >= 31
  const animated = l >= 36
  const pct = Math.round((l / MAX_LEVEL) * 100)

  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      x: 20 + Math.random() * 360,
      y: 10 + Math.random() * 270,
      r: 1 + Math.random() * 2,
      d: 1.5 + Math.random() * 2,
    })), [])

  const body   = colored ? '#ffb366' : '#8b8fa0'
  const stroke = colored ? '#e8943d' : '#6b7280'
  const paw    = colored ? '#f5d0a9' : '#999'
  const tail   = colored ? '#e8943d' : '#9ca3af'

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
                ? 'linear-gradient(90deg,#fbbf24,#fb923c,#f87171,#e879f9,#60a5fa)'
                : l >= 35
                  ? 'linear-gradient(90deg,#fb923c,#f59e0b)'
                  : 'linear-gradient(90deg,#f59e0b,#d97706)',
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right">{l}/{MAX_LEVEL}</span>
      </div>

      {/* SVG Canvas */}
      <svg viewBox="0 0 400 300" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cg">
            <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff7ed" stopOpacity="0" />
          </radialGradient>
          <filter id="cf">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Level 0: Ghost */}
        <g opacity={l === 0 ? 0.12 : 0} stroke="#9ca3af" fill="none" strokeWidth="1.2" strokeDasharray="5 5">
          <ellipse cx="200" cy="170" rx="65" ry="50" />
          <circle cx="200" cy="100" r="40" />
          <line x1="155" y1="215" x2="155" y2="255" />
          <line x1="245" y1="215" x2="245" y2="255" />
        </g>

        {/* Level 50: Background glow */}
        {l >= 50 && (
          <ellipse cx="200" cy="160" rx="170" ry="135" fill="url(#cg)">
            <animate attributeName="rx" values="170;180;170" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* 1-5: Body */}
        <g opacity={op(l, 1, 5)} style={{ transition: 'all 0.8s' }}>
          <ellipse cx="200" cy="175" rx="68" ry="48" fill={body} stroke={stroke} strokeWidth="1.8" />
          {colored && <ellipse cx="200" cy="180" rx="40" ry="25" fill="white" opacity="0.2" />}
        </g>

        {/* 6-10: Head */}
        <g opacity={op(l, 6, 10)} style={{ transition: 'all 0.8s' }}>
          <circle cx="200" cy="105" r="42" fill={body} stroke={stroke} strokeWidth="1.8" />
          {/* Cheeks */}
          {colored && (
            <>
              <ellipse cx="175" cy="118" rx="8" ry="5" fill="#f9a8d4" opacity="0.4" />
              <ellipse cx="225" cy="118" rx="8" ry="5" fill="#f9a8d4" opacity="0.4" />
            </>
          )}
        </g>

        {/* 11-15: Legs */}
        <g opacity={op(l, 11, 15)} style={{ transition: 'all 0.8s' }}>
          {[155, 175, 220, 240].map((x, i) => (
            <g key={i}>
              <rect x={x - 8} y="215" width="16" height="35" rx="8" fill={body} stroke={stroke} strokeWidth="1.2" />
              <ellipse cx={x} cy="252" rx="10" ry="6" fill={paw} />
              {colored && (
                <g fill="#e8943d" opacity="0.4">
                  <circle cx={x - 3} cy="250" r="1.5" />
                  <circle cx={x + 3} cy="250" r="1.5" />
                  <circle cx={x} cy="248" r="1.5" />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* 16-20: Tail */}
        <g opacity={op(l, 16, 20)} style={{ transition: 'all 0.8s' }}>
          <path
            d="M 265 170 C 300 150, 320 130, 310 100 C 330 90, 340 110, 325 130"
            stroke={tail} strokeWidth={animated ? 6 : 4.5} fill="none" strokeLinecap="round"
          >
            {animated && (
              <animate attributeName="d" dur="2s" repeatCount="indefinite"
                values="M 265 170 C 300 150,320 130,310 100 C 330 90,340 110,325 130;
                        M 265 170 C 305 145,325 125,315 95 C 335 85,345 105,330 125;
                        M 265 170 C 300 150,320 130,310 100 C 330 90,340 110,325 130" />
            )}
          </path>
        </g>

        {/* 21-25: Ears + whiskers */}
        <g opacity={op(l, 21, 25)} style={{ transition: 'all 0.8s' }}>
          {/* Ears */}
          <path d="M 172 72 L 162 35 L 190 65 Z" fill={body} stroke={stroke} strokeWidth="1.5" />
          <path d="M 228 72 L 238 35 L 210 65 Z" fill={body} stroke={stroke} strokeWidth="1.5" />
          {colored && (
            <>
              <path d="M 174 70 L 167 43 L 187 65" fill="#fce7f3" opacity="0.6" />
              <path d="M 226 70 L 233 43 L 213 65" fill="#fce7f3" opacity="0.6" />
            </>
          )}
          {/* Whiskers */}
          <g stroke={colored ? '#d97706' : '#888'} strokeWidth="1" opacity="0.5">
            <line x1="170" y1="115" x2="130" y2="108" />
            <line x1="170" y1="118" x2="128" y2="120" />
            <line x1="170" y1="121" x2="132" y2="132" />
            <line x1="230" y1="115" x2="270" y2="108" />
            <line x1="230" y1="118" x2="272" y2="120" />
            <line x1="230" y1="121" x2="268" y2="132" />
          </g>
        </g>

        {/* 26-30: Eyes + nose + mouth */}
        <g opacity={op(l, 26, 30)} style={{ transition: 'all 0.8s' }}>
          {/* Eyes */}
          {[185, 215].map((cx, i) => (
            <g key={i}>
              <ellipse cx={cx} cy="100" rx="9" ry="10" fill="white" stroke={colored ? '#92400e' : '#444'} strokeWidth="1.5" />
              <ellipse cx={cx + 1} cy="99" rx="6" ry="7" fill={colored ? '#16a34a' : '#333'} />
              <ellipse cx={cx + 1.5} cy="98" rx="3.5" ry="4" fill="#1a1a2e" />
              <circle cx={cx + 4} cy="96" r="2.5" fill="white" />
              <circle cx={cx - 2} cy="101" r="1.2" fill="white" opacity="0.7" />
            </g>
          ))}
          {/* Nose */}
          <path d="M 197 112 L 200 116 L 203 112 Z" fill={colored ? '#f472b6' : '#777'} />
          {/* Mouth */}
          <path d="M 200 116 Q 193 123 188 119" stroke={colored ? '#9f1239' : '#666'} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 200 116 Q 207 123 212 119" stroke={colored ? '#9f1239' : '#666'} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>

        {/* 36-40: Purr marks */}
        {animated && (
          <g opacity={op(l, 36, 40)}>
            {[{ x: 150, y: 100 }, { x: 250, y: 100 }].map((p, i) => (
              <g key={i} opacity="0.3">
                <path d={`M ${p.x - 8} ${p.y} Q ${p.x - 4} ${p.y - 4} ${p.x} ${p.y}`} stroke="#f59e0b" strokeWidth="1.5" fill="none">
                  <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                </path>
                <path d={`M ${p.x - 8} ${p.y + 6} Q ${p.x - 4} ${p.y + 2} ${p.x} ${p.y + 6}`} stroke="#f59e0b" strokeWidth="1.5" fill="none">
                  <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" />
                </path>
              </g>
            ))}
            {/* Stripes on body */}
            <g stroke="#d97706" strokeWidth="2" opacity="0.25" strokeLinecap="round">
              <path d="M 180 155 Q 185 150 190 155" />
              <path d="M 195 152 Q 200 147 205 152" />
              <path d="M 210 155 Q 215 150 220 155" />
            </g>
          </g>
        )}

        {/* 41-45: Sparkles + yarn + paw prints */}
        <g opacity={op(l, 41, 45)} style={{ transition: 'opacity 0.8s' }}>
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f9a8d4' : '#fb923c'} opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Yarn ball */}
          <g transform="translate(60, 230)" opacity="0.6">
            <circle cx="0" cy="0" r="14" fill="#f472b6" />
            <path d="M -8 -5 Q 0 -15 8 -5 Q 12 0 8 5 Q 0 15 -8 5 Q -12 0 -8 -5" stroke="#ec4899" strokeWidth="1.5" fill="none" />
            <path d="M 0 -14 Q 5 -20 12 -18" stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
          {/* Paw prints */}
          {[{ x: 340, y: 250 }, { x: 360, y: 230 }].map((p, i) => (
            <g key={i} fill="#f59e0b" opacity="0.35">
              <ellipse cx={p.x} cy={p.y} rx="5" ry="6" />
              <circle cx={p.x - 4} cy={p.y - 7} r="2.5" />
              <circle cx={p.x + 4} cy={p.y - 7} r="2.5" />
              <circle cx={p.x - 6} cy={p.y - 3} r="2" />
              <circle cx={p.x + 6} cy={p.y - 3} r="2" />
            </g>
          ))}
        </g>

        {/* 46-49: Hearts + fish + butterflies */}
        <g opacity={op(l, 46, 49)} style={{ transition: 'opacity 0.8s' }}>
          {[{ x: 50, y: 50, c: '#f472b6', s: 1 }, { x: 350, y: 45, c: '#fb7185', s: 0.8 }].map((h, i) => (
            <path key={i}
              d={`M ${h.x} ${h.y + 4 * h.s} C ${h.x - 6 * h.s} ${h.y - 6 * h.s}, ${h.x - 12 * h.s} ${h.y + 2 * h.s}, ${h.x} ${h.y + 12 * h.s} C ${h.x + 12 * h.s} ${h.y + 2 * h.s}, ${h.x + 6 * h.s} ${h.y - 6 * h.s}, ${h.x} ${h.y + 4 * h.s} Z`}
              fill={h.c} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i}s`} repeatCount="indefinite" />
            </path>
          ))}
          {/* Fish */}
          <g transform="translate(350, 170)" opacity="0.5" fill="#60a5fa">
            <ellipse cx="0" cy="0" rx="12" ry="7" />
            <path d="M 12 0 L 20 -8 L 20 8 Z" />
            <circle cx="-5" cy="-2" r="1.5" fill="white" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.8s" repeatCount="indefinite" />
          </g>
        </g>

        {/* Level 50: Golden bow + glow */}
        {l >= 50 && (
          <g filter="url(#cf)">
            <path d="M 190 135 Q 200 130 210 135 Q 215 140 210 145 Q 200 150 190 145 Q 185 140 190 135 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
            <path d="M 190 135 Q 200 130 210 135 Q 205 140 200 140 Q 195 140 190 135 Z" fill="#fde68a" opacity="0.6" />
            <rect x="197" y="135" width="6" height="10" rx="2" fill="#f59e0b" />
          </g>
        )}
      </svg>

      {/* Status text */}
      <p className="text-xs text-center font-medium" style={{
        color: l >= 50 ? '#f59e0b' : l >= 30 ? '#fb923c' : '#9ca3af',
      }}>
        {l === 0 && 'Réponds correctement pour faire apparaître le chaton !'}
        {l >= 1  && l < 6  && 'Un petit corps tout rond...'}
        {l >= 6  && l < 11 && 'Oh ! Une tête toute ronde !'}
        {l >= 11 && l < 16 && 'Il se tient sur ses pattes !'}
        {l >= 16 && l < 21 && 'Une jolie queue touffue...'}
        {l >= 21 && l < 26 && 'Des oreilles pointues et des moustaches !'}
        {l >= 26 && l < 31 && 'De grands yeux curieux !'}
        {l >= 31 && l < 36 && 'Un beau pelage orange apparaît !'}
        {l >= 36 && l < 41 && 'Il ronronne de bonheur !'}
        {l >= 41 && l < 46 && 'Il joue avec sa pelote !'}
        {l >= 46 && l < 50 && 'Presque un chat royal... encore un effort !'}
        {l >= 50 && '\u2728 Chat Légendaire ! Miaou champion(ne) ! \u2728'}
      </p>
    </div>
  )
}

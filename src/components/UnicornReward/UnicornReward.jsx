import { useMemo } from 'react'

/**
 * Cute kawaii unicorn that builds up progressively over 50 levels.
 *
 * Stages:
 *  0      → faint ghost outline
 *  1-5    → chubby body appears
 *  6-10   → big kawaii head + neck
 *  11-15  → short cute legs + hooves
 *  16-20  → flowing tail
 *  21-25  → wavy mane
 *  26-30  → spiral horn + ears + big kawaii eye
 *  31-35  → pastel colors bloom (body, cheeks, inner ear)
 *  36-40  → rainbow mane + tail + animated flow
 *  41-45  → sparkles + stars + musical notes
 *  46-49  → flowers + hearts + butterflies
 *  50     → golden crown + fairy wings + rainbow + full glow
 */

const MAX_LEVEL = 50

function op(level, start, end = start + 4) {
  if (level < start) return 0
  if (level >= end) return 1
  return (level - start) / (end - start)
}

/** SVG 5-point star path */
function starPoints(cx, cy, R, r) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? R : r
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`)
  }
  return pts.join(' ')
}

export default function UnicornReward({ level = 0 }) {
  const l = Math.max(0, Math.min(MAX_LEVEL, level))
  const colored = l >= 31
  const rainbow = l >= 36
  const pct = Math.round((l / MAX_LEVEL) * 100)

  // stable sparkle positions
  const sparkles = useMemo(() =>
    Array.from({ length: 16 }, () => ({
      x: 15 + Math.random() * 370,
      y: 5 + Math.random() * 280,
      r: 1 + Math.random() * 2.5,
      d: 1.2 + Math.random() * 2,
    })), [])

  // colors
  const body   = colored ? 'url(#ub)' : '#8b8fa0'
  const stroke = colored ? '#c4b5fd' : '#6b7280'
  const hoof   = colored ? '#a78bfa' : '#555'
  const mane   = rainbow ? 'url(#ur)' : colored ? '#c084fc' : '#9ca3af'
  const horn   = colored ? 'url(#uh)' : '#bbb'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* ── Progress bar ── */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: l >= 50
                ? 'linear-gradient(90deg,#f9a8d4,#c084fc,#60a5fa,#34d399,#fbbf24,#fb923c,#f87171)'
                : l >= 35
                  ? 'linear-gradient(90deg,#c084fc,#818cf8)'
                  : 'linear-gradient(90deg,#818cf8,#6366f1)',
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-400 tabular-nums w-12 text-right">{l}/{MAX_LEVEL}</span>
      </div>

      {/* ── SVG Canvas ── */}
      <svg viewBox="0 0 400 300" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Body pastel gradient */}
          <linearGradient id="ub" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="50%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
          {/* Rainbow gradient */}
          <linearGradient id="ur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f87171" />
            <stop offset="17%"  stopColor="#fb923c" />
            <stop offset="33%"  stopColor="#fbbf24" />
            <stop offset="50%"  stopColor="#4ade80" />
            <stop offset="67%"  stopColor="#60a5fa" />
            <stop offset="83%"  stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          {/* Horn gold */}
          <linearGradient id="uh" x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef9c3" />
          </linearGradient>
          {/* Glow filters */}
          <filter id="ug">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="ugSoft">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="ugr">
            <stop offset="0%"  stopColor="#e9d5ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0" />
          </radialGradient>
          {/* Wing gradient */}
          <linearGradient id="uw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#e0e7ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* ════════ LEVEL 0 : Ghost outline ════════ */}
        <g opacity={l === 0 ? 0.12 : 0} stroke="#9ca3af" fill="none" strokeWidth="1.2" strokeDasharray="5 5">
          {/* body */}
          <ellipse cx="190" cy="162" rx="72" ry="48" />
          {/* head */}
          <circle cx="275" cy="100" r="36" />
          {/* legs */}
          <line x1="140" y1="205" x2="140" y2="255" />
          <line x1="165" y1="205" x2="165" y2="255" />
          <line x1="210" y1="205" x2="210" y2="255" />
          <line x1="235" y1="205" x2="235" y2="255" />
          {/* horn */}
          <line x1="290" y1="68" x2="300" y2="25" />
        </g>

        {/* ════════ LEVEL 50 : Background glow ════════ */}
        {l >= 50 && (
          <ellipse cx="200" cy="155" rx="175" ry="140" fill="url(#ugr)">
            <animate attributeName="rx" values="175;185;175" dur="3s" repeatCount="indefinite" />
            <animate attributeName="ry" values="140;150;140" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* ════════ LEVEL 50 : Wings (behind body) ════════ */}
        {l >= 50 && (
          <g opacity="0.85">
            {/* Upper wing */}
            <path
              d="M 175 140 C 145 85, 95 60, 70 80 C 50 45, 30 50, 35 80 C 10 55, 8 75, 25 100
                 C 15 95, 18 115, 40 118 C 55 125, 100 128, 140 140 Z"
              fill="url(#uw)" stroke="#c4b5fd" strokeWidth="1"
              filter="url(#ugSoft)"
            >
              <animate attributeName="d" dur="2.8s" repeatCount="indefinite"
                values="M 175 140 C 145 85, 95 60, 70 80 C 50 45, 30 50, 35 80 C 10 55, 8 75, 25 100 C 15 95, 18 115, 40 118 C 55 125, 100 128, 140 140 Z;
                        M 175 140 C 148 80, 98 55, 73 75 C 53 40, 33 45, 38 75 C 13 50, 11 70, 28 95 C 18 90, 21 110, 43 113 C 58 120, 103 125, 143 138 Z;
                        M 175 140 C 145 85, 95 60, 70 80 C 50 45, 30 50, 35 80 C 10 55, 8 75, 25 100 C 15 95, 18 115, 40 118 C 55 125, 100 128, 140 140 Z" />
            </path>
            {/* Wing veins */}
            <path d="M 130 125 Q 90 100 60 90" stroke="#d8b4fe" strokeWidth="0.6" fill="none" opacity="0.5" />
            <path d="M 140 130 Q 95 110 45 105" stroke="#d8b4fe" strokeWidth="0.6" fill="none" opacity="0.4" />
            <path d="M 145 135 Q 90 120 35 95" stroke="#d8b4fe" strokeWidth="0.6" fill="none" opacity="0.3" />
          </g>
        )}

        {/* ════════ LEVEL 1-5 : Body ════════ */}
        <g opacity={op(l, 1, 5)} style={{ transition: 'all 0.8s' }}>
          {/* Main body — chubby bean */}
          <path
            d="M 120 155 C 120 120, 165 108, 210 115 C 255 122, 270 145, 265 165
               C 260 188, 220 200, 185 198 C 145 196, 120 185, 120 155 Z"
            fill={body} stroke={stroke} strokeWidth="1.8"
          />
          {/* Belly highlight */}
          {colored && (
            <ellipse cx="195" cy="158" rx="38" ry="22" fill="white" opacity="0.15" />
          )}
        </g>

        {/* ════════ LEVEL 6-10 : Head + Neck ════════ */}
        <g opacity={op(l, 6, 10)} style={{ transition: 'all 0.8s' }}>
          {/* Neck — thick soft connector */}
          <path
            d="M 240 135 C 255 125, 265 112, 272 100"
            stroke={body === 'url(#ub)' ? '#e9d5ff' : '#8b8fa0'}
            strokeWidth="36" strokeLinecap="round" fill="none"
          />
          {/* Head — big kawaii circle */}
          <circle cx="280" cy="95" r="38" fill={body} stroke={stroke} strokeWidth="1.8" />
          {/* Snout bump */}
          <ellipse cx="310" cy="105" rx="18" ry="14"
            fill={colored ? '#fce7f3' : '#9ca3af'} stroke={stroke} strokeWidth="1.2" />
          {/* Nostrils */}
          <ellipse cx="318" cy="107" rx="2.2" ry="2.8"
            fill={colored ? '#d946ef' : '#555'} opacity="0.5" />
          <ellipse cx="312" cy="109" rx="1.8" ry="2.2"
            fill={colored ? '#d946ef' : '#555'} opacity="0.4" />
          {/* Smile */}
          <path d="M 314 114 Q 308 120 300 117" stroke={colored ? '#d946ef' : '#666'}
            strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* ════════ LEVEL 11-15 : Legs ════════ */}
        <g opacity={op(l, 11, 15)} style={{ transition: 'all 0.8s' }}>
          {/* Front legs */}
          {[{ x: 225, a: 2 }, { x: 242, a: 0 }].map((leg, i) => (
            <g key={`f${i}`}>
              <rect x={leg.x - 7} y="192" width="14" height="46" rx="7"
                fill={body} stroke={stroke} strokeWidth="1.2"
                transform={`rotate(${leg.a} ${leg.x} 215)`} />
              <ellipse cx={leg.x} cy="240" rx="9" ry="5.5" fill={hoof} />
              {colored && <ellipse cx={leg.x} cy="240" rx="5" ry="3" fill="white" opacity="0.2" />}
            </g>
          ))}
          {/* Back legs */}
          {[{ x: 145, a: -2 }, { x: 162, a: 0 }].map((leg, i) => (
            <g key={`b${i}`}>
              <rect x={leg.x - 7} y="190" width="14" height="48" rx="7"
                fill={body} stroke={stroke} strokeWidth="1.2"
                transform={`rotate(${leg.a} ${leg.x} 214)`} />
              <ellipse cx={leg.x} cy="240" rx="9" ry="5.5" fill={hoof} />
              {colored && <ellipse cx={leg.x} cy="240" rx="5" ry="3" fill="white" opacity="0.2" />}
            </g>
          ))}
        </g>

        {/* ════════ LEVEL 16-20 : Tail ════════ */}
        <g opacity={op(l, 16, 20)} style={{ transition: 'all 0.8s' }}>
          {/* Thick flowing tail with 3 waves */}
          <path
            d="M 125 150 C 100 125, 80 130, 72 148
               C 62 128, 48 135, 50 155
               C 38 140, 28 148, 35 168
               C 22 158, 18 170, 30 182"
            stroke={mane} strokeWidth={rainbow ? 7 : 5} fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          >
            {rainbow && (
              <animate attributeName="d" dur="3s" repeatCount="indefinite"
                values="M 125 150 C 100 125,80 130,72 148 C 62 128,48 135,50 155 C 38 140,28 148,35 168 C 22 158,18 170,30 182;
                        M 125 150 C 102 120,82 125,74 143 C 64 123,50 130,52 150 C 40 135,30 143,37 163 C 24 153,20 165,32 177;
                        M 125 150 C 100 125,80 130,72 148 C 62 128,48 135,50 155 C 38 140,28 148,35 168 C 22 158,18 170,30 182" />
            )}
          </path>
          {/* Second tail strand for fullness */}
          <path
            d="M 123 156 C 95 138, 75 145, 65 160
               C 52 148, 40 155, 45 172"
            stroke={mane} strokeWidth={rainbow ? 5 : 3.5} fill="none"
            strokeLinecap="round" opacity="0.7"
          >
            {rainbow && (
              <animate attributeName="d" dur="3.4s" repeatCount="indefinite"
                values="M 123 156 C 95 138,75 145,65 160 C 52 148,40 155,45 172;
                        M 123 156 C 97 133,77 140,67 155 C 54 143,42 150,47 167;
                        M 123 156 C 95 138,75 145,65 160 C 52 148,40 155,45 172" />
            )}
          </path>
        </g>

        {/* ════════ LEVEL 21-25 : Mane ════════ */}
        <g opacity={op(l, 21, 25)} style={{ transition: 'all 0.8s' }}>
          {/* Main mane flow — cascading waves */}
          <path
            d="M 278 60 C 260 55, 252 65, 255 80
               C 240 70, 232 80, 238 95
               C 225 88, 218 98, 226 110
               C 215 105, 210 115, 220 125
               C 212 122, 208 132, 218 138"
            stroke={mane} strokeWidth={rainbow ? 7 : 5} fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          >
            {rainbow && (
              <animate attributeName="d" dur="2.8s" repeatCount="indefinite"
                values="M 278 60 C 260 55,252 65,255 80 C 240 70,232 80,238 95 C 225 88,218 98,226 110 C 215 105,210 115,220 125 C 212 122,208 132,218 138;
                        M 278 60 C 258 52,250 62,253 77 C 238 67,230 77,236 92 C 223 85,216 95,224 107 C 213 102,208 112,218 122 C 210 119,206 129,216 135;
                        M 278 60 C 260 55,252 65,255 80 C 240 70,232 80,238 95 C 225 88,218 98,226 110 C 215 105,210 115,220 125 C 212 122,208 132,218 138" />
            )}
          </path>
          {/* Forelock — cute tuft on forehead */}
          <path
            d="M 285 62 C 275 50, 265 55, 270 68"
            stroke={mane} strokeWidth={rainbow ? 5 : 3.5} fill="none"
            strokeLinecap="round"
          />
          {/* Second mane strand */}
          <path
            d="M 275 65 C 255 62, 248 72, 250 85
               C 238 78, 230 88, 235 100"
            stroke={mane} strokeWidth={rainbow ? 5 : 3.5} fill="none"
            strokeLinecap="round" opacity="0.65"
          />
        </g>

        {/* ════════ LEVEL 26-30 : Horn + Ears + Eye ════════ */}
        <g opacity={op(l, 26, 30)} style={{ transition: 'all 0.8s' }}>
          {/* Ears */}
          <path d="M 268 62 L 262 42 L 280 58 Z"
            fill={colored ? '#f3e8ff' : '#8b8fa0'} stroke={stroke} strokeWidth="1.2"
            strokeLinejoin="round" />
          {colored && (
            <path d="M 268 60 L 265 48 L 276 58" fill="#fce7f3" opacity="0.6" />
          )}
          <path d="M 290 66 L 292 46 L 302 64 Z"
            fill={colored ? '#f3e8ff' : '#8b8fa0'} stroke={stroke} strokeWidth="1.2"
            strokeLinejoin="round" />
          {colored && (
            <path d="M 291 64 L 293 50 L 300 63" fill="#fce7f3" opacity="0.6" />
          )}

          {/* Horn — elegant spiral */}
          <path d="M 282 60 C 284 42, 290 28, 295 10"
            stroke={colored ? '#f59e0b' : '#999'} strokeWidth="3.5"
            fill="none" strokeLinecap="round"
            filter={l >= 50 ? 'url(#ugSoft)' : undefined}
          />
          <path d="M 282 60 C 286 42, 292 28, 295 10"
            stroke={horn} strokeWidth="7" fill="none" strokeLinecap="round"
          />
          {/* Spiral lines on horn */}
          {colored && (
            <g stroke="#fbbf24" strokeWidth="0.8" opacity="0.6">
              <path d="M 283 55 Q 289 53 287 55" />
              <path d="M 285 46 Q 291 44 289 46" />
              <path d="M 287 37 Q 293 35 291 37" />
              <path d="M 289 28 Q 294 26 292 28" />
              <path d="M 291 20 Q 295 18 293 20" />
            </g>
          )}
          {/* Horn tip sparkle */}
          {colored && (
            <circle cx="295" cy="8" r="3" fill="#fef3c7" opacity="0.7">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Big kawaii eye */}
          <g>
            {/* Eye white */}
            <ellipse cx="293" cy="92" rx="10" ry="11.5"
              fill="white" stroke={colored ? '#7c3aed' : '#444'} strokeWidth="1.5" />
            {/* Iris */}
            <ellipse cx="295" cy="91" rx="6.5" ry="7.5"
              fill={colored ? '#7c3aed' : '#333'} />
            {/* Pupil */}
            <ellipse cx="296" cy="90" rx="3.5" ry="4" fill="#1e1b4b" />
            {/* Big sparkle */}
            <circle cx="299" cy="86" r="3" fill="white" />
            {/* Small sparkle */}
            <circle cx="291" cy="93" r="1.5" fill="white" opacity="0.8" />
            {/* Top lashes */}
            <path d="M 283 85 Q 287 80 293 82" stroke={colored ? '#581c87' : '#333'}
              strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 284 82 Q 282 78 280 77" stroke={colored ? '#581c87' : '#333'}
              strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 287 80 Q 286 76 285 74" stroke={colored ? '#581c87' : '#333'}
              strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>

          {/* Rosy cheeks */}
          {colored && (
            <>
              <ellipse cx="305" cy="104" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.45" />
              <ellipse cx="305" cy="104" rx="4" ry="2.5" fill="#fb7185" opacity="0.15" />
            </>
          )}
        </g>

        {/* ════════ LEVEL 41-45 : Stars + Sparkles + Musical notes ════════ */}
        <g opacity={op(l, 41, 45)} style={{ transition: 'opacity 0.8s' }}>
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f9a8d4' : '#a5b4fc'} opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.9;0.2"
                dur={`${s.d}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${s.r * 0.5};${s.r * 1.2};${s.r * 0.5}`}
                dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Big stars */}
          {[{ x: 55, y: 45, R: 10, c: '#fbbf24' }, { x: 355, y: 60, R: 8, c: '#f472b6' },
            { x: 40, y: 220, R: 7, c: '#a78bfa' }, { x: 365, y: 200, R: 9, c: '#fbbf24' }].map((s, i) => (
            <polygon key={i} points={starPoints(s.x, s.y, s.R, s.R * 0.4)} fill={s.c} opacity="0.55">
              <animate attributeName="opacity" values="0.3;0.7;0.3"
                dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate"
                from={`0 ${s.x} ${s.y}`} to={`360 ${s.x} ${s.y}`}
                dur={`${8 + i * 3}s`} repeatCount="indefinite" />
            </polygon>
          ))}
          {/* Musical notes */}
          {[{ x: 340, y: 35 }, { x: 60, y: 140 }].map((p, i) => (
            <g key={`n${i}`} opacity="0.5" fill={i === 0 ? '#f472b6' : '#a78bfa'}>
              <circle cx={p.x} cy={p.y} r="4.5" />
              <rect x={p.x + 3.5} y={p.y - 18} width="1.8" height="18" rx="0.9" />
              <path d={`M ${p.x + 4.4} ${p.y - 18} Q ${p.x + 12} ${p.y - 20} ${p.x + 10} ${p.y - 14}`}
                stroke={i === 0 ? '#f472b6' : '#a78bfa'} strokeWidth="1.5" fill="none" />
              <animate attributeName="opacity" values="0.3;0.6;0.3"
                dur={`${2.2 + i * 0.8}s`} repeatCount="indefinite" />
            </g>
          ))}
        </g>

        {/* ════════ LEVEL 46-49 : Flowers + Hearts + Butterflies ════════ */}
        <g opacity={op(l, 46, 49)} style={{ transition: 'opacity 0.8s' }}>
          {/* Flowers */}
          {[{ x: 370, y: 245, c: '#f9a8d4' }, { x: 20, y: 260, c: '#c4b5fd' }, { x: 50, y: 80, c: '#93c5fd' }].map((f, i) => (
            <g key={`fl${i}`} transform={`translate(${f.x},${f.y})`}>
              {[0, 60, 120, 180, 240, 300].map(a => (
                <ellipse key={a} cx="0" cy="-7" rx="4" ry="7.5"
                  fill={f.c} opacity="0.75" transform={`rotate(${a})`} />
              ))}
              <circle cx="0" cy="0" r="4" fill="#fbbf24" opacity="0.9" />
              <circle cx="0" cy="0" r="2" fill="#fef3c7" opacity="0.7" />
            </g>
          ))}
          {/* Hearts */}
          {[{ x: 355, y: 30, c: '#f472b6', s: 1 }, { x: 15, y: 170, c: '#c084fc', s: 0.8 },
            { x: 375, y: 140, c: '#fb7185', s: 0.7 }].map((h, i) => (
            <path key={`h${i}`}
              d={`M ${h.x} ${h.y + 4 * h.s}
                  C ${h.x - 6 * h.s} ${h.y - 6 * h.s}, ${h.x - 12 * h.s} ${h.y + 2 * h.s}, ${h.x} ${h.y + 12 * h.s}
                  C ${h.x + 12 * h.s} ${h.y + 2 * h.s}, ${h.x + 6 * h.s} ${h.y - 6 * h.s}, ${h.x} ${h.y + 4 * h.s} Z`}
              fill={h.c} opacity="0.6"
            >
              <animate attributeName="opacity" values="0.4;0.75;0.4"
                dur={`${2.5 + i * 0.7}s`} repeatCount="indefinite" />
            </path>
          ))}
          {/* Butterfly */}
          <g transform="translate(340, 100)" opacity="0.65">
            <ellipse cx="-8" cy="-3" rx="7" ry="9" fill="#c4b5fd" transform="rotate(-20)">
              <animate attributeName="rx" values="7;4;7" dur="0.8s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="8" cy="-3" rx="7" ry="9" fill="#fbcfe8" transform="rotate(20)">
              <animate attributeName="rx" values="7;4;7" dur="0.8s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="-5" cy="5" rx="5" ry="6" fill="#ddd6fe" transform="rotate(-10)">
              <animate attributeName="rx" values="5;3;5" dur="0.8s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="5" cy="5" rx="5" ry="6" fill="#fce7f3" transform="rotate(10)">
              <animate attributeName="rx" values="5;3;5" dur="0.8s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="0" cy="2" rx="1.5" ry="8" fill="#7c3aed" />
            <line x1="-3" y1="-8" x2="-6" y2="-14" stroke="#7c3aed" strokeWidth="0.8" />
            <line x1="3" y1="-8" x2="6" y2="-14" stroke="#7c3aed" strokeWidth="0.8" />
            <circle cx="-6" cy="-14" r="1.2" fill="#7c3aed" />
            <circle cx="6" cy="-14" r="1.2" fill="#7c3aed" />
          </g>
        </g>

        {/* ════════ LEVEL 50 : Crown + extra glow ════════ */}
        {l >= 50 && (
          <g>
            {/* Crown */}
            <g filter="url(#ugSoft)">
              <path
                d="M 265 55 L 260 35 L 270 45 L 275 22 L 282 42 L 290 18 L 295 40 L 302 28 L 300 48 L 308 38 L 305 55 Z"
                fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
              {/* Crown jewels */}
              <circle cx="275" cy="28" r="3" fill="#f87171" />
              <circle cx="290" cy="22" r="3.5" fill="#60a5fa" />
              <circle cx="263" cy="38" r="2.5" fill="#34d399" />
              <circle cx="305" cy="40" r="2.5" fill="#e879f9" />
              {/* Crown base band */}
              <path d="M 265 55 Q 285 60 305 55" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
            </g>

            {/* Rainbow arc behind */}
            <g opacity="0.3">
              <path d="M 30 280 Q 200 195 370 280" stroke="url(#ur)" strokeWidth="6" fill="none" />
              <path d="M 35 286 Q 200 205 365 286" stroke="url(#ur)" strokeWidth="3.5" fill="none" opacity="0.6" />
            </g>

            {/* Extra horn glow */}
            <circle cx="295" cy="8" r="8" fill="#fef3c7" filter="url(#ug)" opacity="0.5">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>

      {/* ── Status text ── */}
      <p className="text-xs text-center font-medium" style={{
        color: l >= 50 ? '#fbbf24' : l >= 30 ? '#c084fc' : '#9ca3af',
      }}>
        {l === 0 && 'Réponds correctement pour faire apparaître la licorne !'}
        {l >= 1  && l < 6  && 'Un corps apparaît dans la brume...'}
        {l >= 6  && l < 11 && 'Oh ! Une tête toute mignonne !'}
        {l >= 11 && l < 16 && 'Elle se tient sur ses pattes !'}
        {l >= 16 && l < 21 && 'Une belle queue ondulante...'}
        {l >= 21 && l < 26 && 'Sa crinière se déploie !'}
        {l >= 26 && l < 31 && 'Une corne magique et de grands yeux !'}
        {l >= 31 && l < 36 && 'Les couleurs pastel la rendent magnifique !'}
        {l >= 36 && l < 41 && 'Sa crinière brille de toutes les couleurs !'}
        {l >= 41 && l < 46 && 'Des étoiles dansent autour d\'elle !'}
        {l >= 46 && l < 50 && 'Presque légendaire... encore un effort !'}
        {l >= 50 && '✨ Licorne Légendaire ! Tu es un(e) champion(ne) ! ✨'}
      </p>
    </div>
  )
}

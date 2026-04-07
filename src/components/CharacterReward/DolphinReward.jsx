import { useMemo } from 'react'

/**
 * Cute kawaii dolphin that builds up progressively over 50 levels.
 */

const MAX_LEVEL = 50

function op(level, start, end = start + 4) {
  if (level < start) return 0
  if (level >= end) return 1
  return (level - start) / (end - start)
}

export default function DolphinReward({ level = 0 }) {
  const l = Math.max(0, Math.min(MAX_LEVEL, level))
  const colored = l >= 31
  const animated = l >= 36
  const pct = Math.round((l / MAX_LEVEL) * 100)

  const sparkles = useMemo(() =>
    Array.from({ length: 14 }, () => ({
      x: 20 + Math.random() * 360,
      y: 10 + Math.random() * 270,
      r: 1 + Math.random() * 2,
      d: 1.3 + Math.random() * 2,
    })), [])

  const bubbles = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      x: 100 + Math.random() * 200,
      y: 50 + Math.random() * 200,
      r: 2 + Math.random() * 4,
      d: 2 + Math.random() * 3,
    })), [])

  const body   = colored ? '#38bdf8' : '#8b8fa0'
  const stroke = colored ? '#0284c7' : '#6b7280'
  const belly  = colored ? '#e0f2fe' : '#bbb'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: l >= 50
                ? 'linear-gradient(90deg,#38bdf8,#818cf8,#c084fc,#f472b6)'
                : l >= 35
                  ? 'linear-gradient(90deg,#38bdf8,#0ea5e9)'
                  : 'linear-gradient(90deg,#0ea5e9,#0284c7)',
            }}
          />
        </div>
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums w-12 text-right">{l}/{MAX_LEVEL}</span>
      </div>

      <svg viewBox="0 0 400 300" className="w-full max-w-[340px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dolg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <radialGradient id="dolbg">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
          </radialGradient>
          <filter id="dolsf">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ghost */}
        <g opacity={l === 0 ? 0.12 : 0} stroke="#9ca3af" fill="none" strokeWidth="1.2" strokeDasharray="5 5">
          <path d="M 120 155 C 120 110, 200 90, 270 120 C 310 135, 320 165, 280 180 C 240 195, 140 190, 120 155" />
          <path d="M 280 120 C 310 100, 330 105, 320 125" />
        </g>

        {l >= 50 && (
          <ellipse cx="200" cy="155" rx="170" ry="130" fill="url(#dolbg)">
            <animate attributeName="rx" values="170;180;170" dur="3s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Water background */}
        {animated && (
          <g opacity="0.15">
            <path d="M 0 260 Q 50 250 100 260 Q 150 270 200 260 Q 250 250 300 260 Q 350 270 400 260 L 400 300 L 0 300 Z"
              fill={colored ? '#0ea5e9' : '#9ca3af'}>
              <animate attributeName="d" dur="4s" repeatCount="indefinite"
                values="M 0 260 Q 50 250 100 260 Q 150 270 200 260 Q 250 250 300 260 Q 350 270 400 260 L 400 300 L 0 300 Z;
                        M 0 265 Q 50 275 100 265 Q 150 255 200 265 Q 250 275 300 265 Q 350 255 400 265 L 400 300 L 0 300 Z;
                        M 0 260 Q 50 250 100 260 Q 150 270 200 260 Q 250 250 300 260 Q 350 270 400 260 L 400 300 L 0 300 Z" />
            </path>
          </g>
        )}

        {/* 1-5: Body */}
        <g opacity={op(l, 1, 5)} style={{ transition: 'all 0.8s' }}>
          <path
            d="M 130 150 C 130 115, 185 95, 240 115 C 280 128, 295 150, 285 170 C 275 192, 220 200, 185 198 C 150 196, 130 180, 130 150 Z"
            fill={colored ? 'url(#dolg)' : body} stroke={stroke} strokeWidth="1.8"
          />
          {/* Belly */}
          <path
            d="M 150 165 C 155 145, 210 140, 255 155 C 270 160, 270 175, 250 182 C 220 192, 160 188, 150 165 Z"
            fill={belly} opacity={colored ? 0.7 : 0.25}
          />
        </g>

        {/* 6-10: Head / beak (rostrum) */}
        <g opacity={op(l, 6, 10)} style={{ transition: 'all 0.8s' }}>
          {/* Rostrum (beak) */}
          <path d="M 270 140 C 300 128, 330 130, 340 140 C 330 145, 300 148, 270 148"
            fill={colored ? 'url(#dolg)' : body} stroke={stroke} strokeWidth="1.5" />
          {/* Mouth line */}
          <path d="M 340 140 C 320 142, 290 144, 270 144" stroke={colored ? '#0369a1' : '#555'} strokeWidth="1" fill="none" opacity="0.5" />
          {/* Melon (forehead) */}
          <path d="M 255 125 C 260 115, 275 110, 280 118"
            fill={colored ? '#7dd3fc' : '#aaa'} opacity="0.4" />
        </g>

        {/* 11-15: Flippers (pectoral fins) */}
        <g opacity={op(l, 11, 15)} style={{ transition: 'all 0.8s' }}>
          {/* Pectoral fin */}
          <path d="M 200 175 C 190 195, 165 215, 155 225 C 150 220, 170 200, 190 178"
            fill={colored ? '#0284c7' : '#888'} stroke={stroke} strokeWidth="1" />
          {colored && (
            <path d="M 195 180 C 188 195, 170 210, 162 218" stroke="#7dd3fc" strokeWidth="0.6" fill="none" opacity="0.4" />
          )}
        </g>

        {/* 16-20: Dorsal fin */}
        <g opacity={op(l, 16, 20)} style={{ transition: 'all 0.8s' }}>
          <path d="M 210 120 C 215 95, 225 80, 230 75 C 235 80, 240 100, 235 120"
            fill={colored ? '#0284c7' : '#888'} stroke={stroke} strokeWidth="1.2" />
          {colored && (
            <path d="M 215 115 C 218 98, 225 85, 228 80" stroke="#7dd3fc" strokeWidth="0.6" fill="none" opacity="0.4" />
          )}
        </g>

        {/* 21-25: Tail fluke */}
        <g opacity={op(l, 21, 25)} style={{ transition: 'all 0.8s' }}>
          <path
            d="M 135 155 C 115 145, 90 130, 75 115 C 85 118, 95 128, 110 140
               M 135 155 C 115 165, 90 175, 75 190 C 85 185, 95 175, 110 165"
            fill={colored ? '#0284c7' : '#888'} stroke={stroke} strokeWidth="1.2"
          >
            {animated && (
              <animate attributeName="d" dur="2s" repeatCount="indefinite"
                values="M 135 155 C 115 145,90 130,75 115 C 85 118,95 128,110 140 M 135 155 C 115 165,90 175,75 190 C 85 185,95 175,110 165;
                        M 135 155 C 118 140,93 125,78 110 C 88 113,98 123,113 135 M 135 155 C 118 170,93 180,78 195 C 88 190,98 180,113 170;
                        M 135 155 C 115 145,90 130,75 115 C 85 118,95 128,110 140 M 135 155 C 115 165,90 175,75 190 C 85 185,95 175,110 165" />
            )}
          </path>
          {/* Upper fluke */}
          <path d="M 75 115 C 60 105, 50 98, 55 110 C 50 100, 60 95, 75 115"
            fill={colored ? '#0ea5e9' : '#999'} />
          {/* Lower fluke */}
          <path d="M 75 190 C 60 200, 50 205, 55 192 C 50 202, 60 208, 75 190"
            fill={colored ? '#0ea5e9' : '#999'} />
        </g>

        {/* 26-30: Eye + blowhole */}
        <g opacity={op(l, 26, 30)} style={{ transition: 'all 0.8s' }}>
          {/* Eye */}
          <ellipse cx="268" cy="130" rx="8" ry="9" fill="white" stroke={colored ? '#0c4a6e' : '#444'} strokeWidth="1.5" />
          <ellipse cx="269" cy="129" rx="5.5" ry="6.5" fill={colored ? '#1e3a5f' : '#333'} />
          <ellipse cx="270" cy="128" rx="3" ry="4" fill="#0f172a" />
          <circle cx="272" cy="126" r="2.5" fill="white" />
          <circle cx="266" cy="131" r="1.2" fill="white" opacity="0.6" />
          {/* Eye shine / happy crescent */}
          {colored && (
            <path d="M 261 126 Q 264 122 268 125" stroke="#0c4a6e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
          {/* Blowhole */}
          <ellipse cx="248" cy="108" rx="4" ry="2.5" fill={colored ? '#0369a1' : '#777'} opacity="0.5" />
          {/* Smile line */}
          <path d="M 315 138 Q 300 146 285 142" stroke={colored ? '#0369a1' : '#666'} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Cheek */}
          {colored && <ellipse cx="285" cy="140" rx="7" ry="4.5" fill="#f9a8d4" opacity="0.3" />}
        </g>

        {/* 36-40: Animated swimming + water splash */}
        {animated && (
          <g opacity={op(l, 36, 40)}>
            {/* Water splash from blowhole */}
            <g opacity="0.5">
              <path d="M 248 105 Q 245 90 240 80" stroke="#7dd3fc" strokeWidth="1.5" fill="none" strokeLinecap="round">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 248 105 Q 250 88 255 78" stroke="#7dd3fc" strokeWidth="1.5" fill="none" strokeLinecap="round">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.3s" repeatCount="indefinite" />
              </path>
              <circle cx="240" cy="78" r="2" fill="#bae6fd">
                <animate attributeName="cy" values="78;70;78" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="255" cy="76" r="1.5" fill="#bae6fd">
                <animate attributeName="cy" values="76;66;76" dur="2.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.3s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        )}

        {/* 41-45: Sparkles + bubbles */}
        <g opacity={op(l, 41, 45)} style={{ transition: 'opacity 0.8s' }}>
          {sparkles.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill={i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#fbbf24' : '#c084fc'} opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* Bubbles */}
          {bubbles.map((b, i) => (
            <circle key={`b${i}`} cx={b.x} cy={b.y} r={b.r}
              fill="none" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.4">
              <animate attributeName="cy" values={`${b.y};${b.y - 30};${b.y}`} dur={`${b.d}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${b.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* 46-49: Hearts + stars + fish friends */}
        <g opacity={op(l, 46, 49)} style={{ transition: 'opacity 0.8s' }}>
          {[{ x: 50, y: 50, c: '#f472b6', s: 0.9 }, { x: 360, y: 35, c: '#38bdf8', s: 0.8 }].map((h, i) => (
            <path key={i}
              d={`M ${h.x} ${h.y + 4 * h.s} C ${h.x - 6 * h.s} ${h.y - 6 * h.s}, ${h.x - 12 * h.s} ${h.y + 2 * h.s}, ${h.x} ${h.y + 12 * h.s} C ${h.x + 12 * h.s} ${h.y + 2 * h.s}, ${h.x + 6 * h.s} ${h.y - 6 * h.s}, ${h.x} ${h.y + 4 * h.s} Z`}
              fill={h.c} opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i}s`} repeatCount="indefinite" />
            </path>
          ))}
          {/* Small fish friends */}
          {[{ x: 340, y: 220, c: '#fbbf24', d: 1 }, { x: 55, y: 200, c: '#f472b6', d: -1 }].map((f, i) => (
            <g key={i} transform={`translate(${f.x}, ${f.y}) scale(${f.d}, 1)`} opacity="0.5">
              <ellipse cx="0" cy="0" rx="10" ry="5" fill={f.c} />
              <path d="M -10 0 L -16 -5 L -16 5 Z" fill={f.c} />
              <circle cx="5" cy="-1.5" r="1.5" fill="white" />
              <circle cx="5.5" cy="-1.5" r="0.8" fill="#1a1a2e" />
            </g>
          ))}
        </g>

        {/* Level 50: Crown + rainbow wave */}
        {l >= 50 && (
          <g>
            <g filter="url(#dolsf)">
              {/* Crown / tiara */}
              <path d="M 250 105 L 248 90 L 254 98 L 258 85 L 264 95 L 268 82 L 272 93 L 276 88 L 274 103 Z"
                fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
              <circle cx="258" cy="88" r="2" fill="#f87171" />
              <circle cx="268" cy="86" r="2" fill="#60a5fa" />
            </g>
            {/* Rainbow arc */}
            <g opacity="0.25">
              <path d="M 40 270 Q 200 200 360 270" stroke="url(#dolg)" strokeWidth="5" fill="none" />
            </g>
          </g>
        )}
      </svg>

      <p className="text-xs text-center font-medium" style={{
        color: l >= 50 ? '#0ea5e9' : l >= 30 ? '#38bdf8' : '#9ca3af',
      }}>
        {l === 0 && 'Réponds correctement pour faire apparaître le dauphin !'}
        {l >= 1  && l < 6  && 'Un corps hydrodynamique se forme...'}
        {l >= 6  && l < 11 && 'Un joli bec apparaît !'}
        {l >= 11 && l < 16 && 'Des nageoires pour glisser dans l\'eau !'}
        {l >= 16 && l < 21 && 'Un aileron dorsal majestueux !'}
        {l >= 21 && l < 26 && 'Une belle nageoire caudale !'}
        {l >= 26 && l < 31 && 'Un \u0153il rieur et un sourire !'}
        {l >= 31 && l < 36 && 'Un magnifique bleu océan !'}
        {l >= 36 && l < 41 && 'Il fait des éclaboussures !'}
        {l >= 41 && l < 46 && 'Des bulles et des étoiles dansent !'}
        {l >= 46 && l < 50 && 'Presque légendaire... encore un effort !'}
        {l >= 50 && '\u2728 Dauphin Légendaire ! Prince des océans ! \u2728'}
      </p>
    </div>
  )
}

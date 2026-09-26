/** Monochrome scenes for the job-search-stage cards. Pure SVG. */

const INK = "#161616";
const SOFT = "#e7e7e3";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 150" className="h-full w-full" aria-hidden>
      <rect width="240" height="150" fill="#fafaf8" />
      <circle cx="130" cy="78" r="58" fill={SOFT} />
      {/* City skyline */}
      {[[40, 70, 14], [58, 60, 10], [180, 66, 12], [196, 56, 10], [210, 74, 12]].map(([x, h, w], i) => (
        <rect key={i} x={x} y={118 - h} width={w} height={h} fill="#dcdcd7" />
      ))}
      {/* Open hand holding the scene */}
      <path d="M20 150 L20 128 Q60 118 110 124 L186 118 Q214 116 206 130 Q196 142 150 146 L20 150Z" fill={INK} />
      <path d="M150 146 Q176 134 204 128" stroke="#fafaf8" strokeWidth="2" fill="none" />
      {children}
    </svg>
  );
}

export function ActiveArt() {
  return (
    <Frame>
      {/* Road rising to a signpost */}
      <path d="M60 124 Q110 116 140 104 Q162 96 170 90" stroke="#bdbdb8" strokeWidth="10" fill="none" strokeLinecap="round" />
      <rect x="166" y="46" width="3" height="46" fill={INK} />
      <path d="M168 50 h36 l7 7 l-7 7 h-36z" fill={INK} />
      <text x="172" y="60" fontSize="5.5" fill="#fff" fontWeight="700">NEW OPPORTUNITIES</text>
      <path d="M168 68 h-26 l-6 5 l6 5 h26z" fill={INK} />
      {/* Walking figure with briefcase */}
      <circle cx="122" cy="46" r="7" fill={INK} />
      <path d="M116 55 h12 l3 26 h-18z" fill={INK} />
      <path d="M118 80 l-8 26 M127 80 l10 24" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M128 60 l12 12" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M116 60 l-8 16" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <rect x="100" y="76" width="14" height="11" rx="2" fill={INK} />
    </Frame>
  );
}

export function PassiveArt() {
  return (
    <Frame>
      {/* Stairs up to a door with a star */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={150 + i * 10} y={112 - i * 11} width="40" height="6" fill="#bdbdb8" />
      ))}
      <rect x="192" y="40" width="14" height="24" fill={INK} />
      <circle cx="180" cy="44" r="6" fill="none" stroke={INK} strokeWidth="1.5" />
      <path d="M180 40 l1.2 2.6 2.8.3-2 1.9.6 2.8-2.6-1.4-2.6 1.4.6-2.8-2-1.9 2.8-.3z" fill={INK} />
      {/* Armchair and relaxed figure with a mug */}
      <path d="M92 92 h46 v24 h-46z" fill={INK} />
      <path d="M88 76 q0-8 8-8 h6 v28 h-14z" fill={INK} />
      <circle cx="118" cy="56" r="7" fill={INK} />
      <path d="M110 64 h14 l2 26 h-18z" fill={INK} />
      <path d="M124 88 l18 4 l2 20" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M124 70 l12 -6" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <rect x="135" y="58" width="7" height="8" rx="1.5" fill={INK} />
    </Frame>
  );
}

export function ExploringArt() {
  return (
    <Frame>
      {/* Topic cards floating above */}
      {[[104, 18, "DSA"], [140, 30, "SYSTEM"], [72, 34, "RESUME"], [160, 50, "MOCK"]].map(([x, y, t]) => (
        <g key={t as string}>
          <rect x={x as number} y={y as number} width="30" height="14" rx="2" fill="#fff" stroke={INK} strokeWidth="1" />
          <text x={(x as number) + 15} y={(y as number) + 9} fontSize="5" textAnchor="middle" fill={INK} fontWeight="700">
            {t}
          </text>
        </g>
      ))}
      <path d="M119 32 v14 M104 48 h52" stroke={INK} strokeWidth="0.8" strokeDasharray="2 2" />
      {/* Desk, laptop, books, lamp */}
      <circle cx="104" cy="70" r="7" fill={INK} />
      <path d="M97 78 h14 l4 22 h-20z" fill={INK} />
      <path d="M110 84 l18 8" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M124 84 h24 l-4 14 h-24z" fill={INK} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="160" y={104 - i * 7} width="28" height="6" fill={i % 2 ? INK : "#555"} />
      ))}
      <path d="M200 110 v-26 l-10 -12" stroke={INK} strokeWidth="2" fill="none" />
      <path d="M184 66 l14 4 l-6 8z" fill={INK} />
    </Frame>
  );
}

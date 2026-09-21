/**
 * Faint line-art motif bleeding off a card's bottom-right corner.
 * Purely decorative: sits behind content and never intercepts clicks.
 */
export type Motif =
  | "gauge"
  | "link"
  | "bird"
  | "play"
  | "cloud"
  | "pin"
  | "database"
  | "queue"
  | "feed"
  | "document"
  | "spider"
  | "spark"
  | "film"
  | "chat"
  | "car"
  | "message"
  | "camera"
  | "bell"
  | "search"
  | "card"
  | "parking"
  | "elevator"
  | "vending"
  | "stack"
  | "grid"
  | "music"
  | "heart"
  | "basket";

const PATHS: Record<Motif, React.ReactNode> = {
  gauge: (
    <>
      <path d="M20 100a60 60 0 0 1 120 0" />
      <path d="M80 100 116 64" />
      <circle cx="80" cy="100" r="6" />
    </>
  ),
  link: (
    <>
      <rect x="18" y="52" width="70" height="36" rx="18" />
      <rect x="72" y="52" width="70" height="36" rx="18" />
      <path d="M60 70h40" />
    </>
  ),
  bird: (
    <>
      <path d="M22 96c34 14 82 6 100-30" />
      <path d="M40 60c22 22 58 26 84 10" />
    </>
  ),
  play: (
    <>
      <rect x="20" y="34" width="122" height="84" rx="16" />
      <path d="M70 60v32l30-16z" />
    </>
  ),
  cloud: (
    <>
      <path d="M46 104h68a26 26 0 0 0 0-52 38 38 0 0 0-72 10 22 22 0 0 0 4 42z" />
    </>
  ),
  pin: (
    <>
      <path d="M80 26c-20 0-36 16-36 36 0 28 36 64 36 64s36-36 36-64c0-20-16-36-36-36z" />
      <circle cx="80" cy="62" r="13" />
    </>
  ),
  database: (
    <>
      <ellipse cx="80" cy="42" rx="52" ry="18" />
      <path d="M28 42v56c0 10 23 18 52 18s52-8 52-18V42" />
      <path d="M28 70c0 10 23 18 52 18s52-8 52-18" />
    </>
  ),
  queue: (
    <>
      <rect x="14" y="58" width="36" height="36" rx="6" />
      <rect x="62" y="58" width="36" height="36" rx="6" />
      <rect x="110" y="58" width="36" height="36" rx="6" />
      <path d="M50 76h12M98 76h12" />
    </>
  ),
  feed: (
    <>
      <rect x="22" y="28" width="116" height="26" rx="6" />
      <rect x="22" y="66" width="116" height="26" rx="6" />
      <rect x="22" y="104" width="116" height="26" rx="6" />
    </>
  ),
  document: (
    <>
      <path d="M40 20h58l26 26v86a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" />
      <path d="M96 20v28h28M52 74h56M52 96h40" />
    </>
  ),
  spider: (
    <>
      <circle cx="80" cy="76" r="46" />
      <ellipse cx="80" cy="76" rx="20" ry="46" />
      <path d="M34 76h92M44 46c20 14 52 14 72 0M44 106c20-14 52-14 72 0" />
    </>
  ),
  spark: (
    <>
      <path d="M80 22l14 40 40 14-40 14-14 40-14-40-40-14 40-14z" />
    </>
  ),
  film: (
    <>
      <rect x="18" y="38" width="124" height="76" rx="10" />
      <path d="M40 38v76M120 38v76" />
      <circle cx="80" cy="76" r="16" />
    </>
  ),
  chat: (
    <>
      <path d="M26 40h108v60H70l-26 24v-24H26z" />
      <path d="M52 64h56M52 82h34" />
    </>
  ),
  car: (
    <>
      <path d="M24 92l10-30a12 12 0 0 1 11-8h70a12 12 0 0 1 11 8l10 30" />
      <rect x="20" y="88" width="120" height="26" rx="8" />
      <circle cx="48" cy="114" r="10" />
      <circle cx="112" cy="114" r="10" />
    </>
  ),
  message: (
    <>
      <circle cx="80" cy="76" r="50" />
      <path d="M52 92l8-20a34 34 0 1 1 14 14l-22 6z" />
    </>
  ),
  camera: (
    <>
      <rect x="20" y="40" width="120" height="86" rx="18" />
      <circle cx="80" cy="83" r="26" />
      <circle cx="116" cy="60" r="5" />
    </>
  ),
  bell: (
    <>
      <path d="M80 24a34 34 0 0 1 34 34v26l12 18H34l12-18V58a34 34 0 0 1 34-34z" />
      <path d="M66 116a14 14 0 0 0 28 0" />
    </>
  ),
  search: (
    <>
      <circle cx="70" cy="66" r="38" />
      <path d="M98 94l34 34" />
    </>
  ),
  card: (
    <>
      <rect x="14" y="44" width="132" height="76" rx="12" />
      <path d="M14 70h132M38 98h28" />
    </>
  ),
  parking: (
    <>
      <rect x="28" y="24" width="104" height="104" rx="14" />
      <path d="M64 104V48h22a18 18 0 0 1 0 36H64" />
    </>
  ),
  elevator: (
    <>
      <rect x="30" y="20" width="100" height="112" rx="8" />
      <path d="M80 20v112" />
      <path d="M52 56l10-12 10 12M88 96l10 12 10-12" />
    </>
  ),
  vending: (
    <>
      <rect x="32" y="16" width="96" height="124" rx="10" />
      <path d="M46 34h34v34H46zM46 78h34v34H46z" />
      <path d="M96 34h18M96 52h18M96 96h18v22H96z" />
    </>
  ),
  stack: (
    <>
      <path d="M80 26l60 26-60 26-60-26z" />
      <path d="M20 78l60 26 60-26M20 104l60 26 60-26" />
    </>
  ),
  grid: (
    <>
      <rect x="22" y="22" width="48" height="48" rx="8" />
      <rect x="90" y="22" width="48" height="48" rx="8" />
      <rect x="22" y="90" width="48" height="48" rx="8" />
      <rect x="90" y="90" width="48" height="48" rx="8" />
    </>
  ),
  music: (
    <>
      <path d="M62 110V38l58-14v72" />
      <circle cx="48" cy="112" r="16" />
      <circle cx="106" cy="98" r="16" />
    </>
  ),
  heart: (
    <>
      <path d="M80 126S22 92 22 58a30 30 0 0 1 58-10 30 30 0 0 1 58 10c0 34-58 68-58 68z" />
    </>
  ),
  basket: (
    <>
      <path d="M22 54h116l-12 68a12 12 0 0 1-12 10H46a12 12 0 0 1-12-10z" />
      <path d="M54 54l16-30M106 54L90 24" />
    </>
  ),
};

export function CardWatermark({ motif }: { motif: Motif }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 160 160"
      className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-current opacity-[0.07]"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[motif]}
    </svg>
  );
}

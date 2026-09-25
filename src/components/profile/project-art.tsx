import type { Project } from "@/lib/profile/types";

/**
 * Animated SVG banner for a project card. The drawing is picked from what
 * the project is about (AI, web, data, 3D, realtime, mobile, general code)
 * and the colour from its name, so every card looks different but stays
 * the same between visits. Pure SVG + CSS: no JS, works server-rendered.
 */

type Kind = "ai" | "web" | "data" | "3d" | "chat" | "mobile" | "code";

const RULES: [Kind, RegExp][] = [
  ["ai", /\b(ai|llm|gpt|openai|gemini|claude|langchain|langgraph|crewai|rag|agent|agents|ml|machine learning|deep learning|nlp|pytorch|tensorflow|embedding|vector|prompt)\b/i],
  ["3d", /\b(3d|three\.?js|webgl|gsap|blender|unity|game|room|floor plan)\b/i],
  ["chat", /\b(chat|real-?time|websocket|socket\.io|stream\.io|video|call|messag\w*|live|interview)\b/i],
  ["mobile", /\b(react native|flutter|android|ios|mobile|app store|kotlin|swift)\b/i],
  ["data", /\b(data|database|sql|postgres\w*|mongo\w*|redis|analytics|dashboard|etl|pipeline|scraper|scraping|crawler|power bi|pandas)\b/i],
  ["web", /\b(web|website|store|e-?commerce|shop|landing|portfolio|react|next\.?js|vue|angular|html|css|tailwind|frontend|saas)\b/i],
];

function kindOf(p: Project): Kind {
  const text = `${p.name} ${p.description} ${p.stack.join(" ")}`;
  return RULES.find(([, re]) => re.test(text))?.[0] ?? "code";
}

function hueOf(s: string): number {
  let h = 7;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function ProjectArt({ project, className = "h-24" }: { project: Project; className?: string }) {
  const kind = kindOf(project);
  const h = hueOf(project.name || project.id);
  const c = `hsl(${h} 85% 62%)`;
  const c2 = `hsl(${(h + 55) % 360} 80% 66%)`;
  const soft = `hsl(${h} 70% 70% / 0.35)`;
  const gid = `pa-${project.id.replace(/[^a-z0-9]/gi, "").slice(0, 12) || h}`;

  return (
    <div
      className={`pa relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 45% 11%), hsl(${(h + 40) % 360} 50% 19%))` }}
      aria-hidden
    >
      <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`${gid}-glow`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={c} stopOpacity="0.35" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
          <pattern id={`${gid}-grid`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="white" strokeOpacity="0.05" />
          </pattern>
        </defs>
        <rect width="320" height="120" fill={`url(#${gid}-grid)`} />
        <ellipse cx="160" cy="60" rx="150" ry="70" fill={`url(#${gid}-glow)`} />
        {kind === "ai" && <Ai c={c} c2={c2} soft={soft} />}
        {kind === "web" && <Web c={c} c2={c2} soft={soft} />}
        {kind === "data" && <Data c={c} c2={c2} soft={soft} />}
        {kind === "3d" && <Cube c={c} c2={c2} soft={soft} />}
        {kind === "chat" && <Chat c={c} c2={c2} soft={soft} />}
        {kind === "mobile" && <Mobile c={c} c2={c2} soft={soft} />}
        {kind === "code" && <Code c={c} c2={c2} soft={soft} />}
      </svg>
    </div>
  );
}

type P = { c: string; c2: string; soft: string };

/** Neural network: three layers, signals flowing along the edges. */
function Ai({ c, c2, soft }: P) {
  const layers = [
    [110, [30, 60, 90]],
    [160, [22, 46, 74, 98]],
    [210, [40, 80]],
  ] as const;
  const edges: [number, number, number, number][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const y1 of layers[l][1]) for (const y2 of layers[l + 1][1]) edges.push([layers[l][0], y1, layers[l + 1][0], y2]);
  }
  return (
    <g>
      {edges.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={soft} strokeWidth="1" />
      ))}
      {edges.filter((_, i) => i % 3 === 0).map(([x1, y1, x2, y2], i) => (
        <line
          key={`f${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={c2}
          strokeWidth="1.4"
          className="pa-flow"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
      {layers.flatMap(([x, ys], l) =>
        ys.map((y, i) => (
          <circle
            key={`${l}-${i}`}
            cx={x}
            cy={y}
            r={l === 1 ? 4.5 : 5.5}
            fill={l === 1 ? c2 : c}
            className="pa-pulse"
            style={{ animationDelay: `${(l * 3 + i) * 0.25}s` }}
          />
        )),
      )}
      <text x="250" y="66" fill={c} fontSize="16" fontFamily="monospace" opacity="0.8" className="pa-blink">
        ✦
      </text>
    </g>
  );
}

/** Browser window with code lines typing in. */
function Web({ c, c2, soft }: P) {
  const lines = [
    [118, 40, 70, c],
    [130, 52, 90, c2],
    [130, 64, 60, soft],
    [118, 76, 80, c],
    [130, 88, 50, c2],
  ] as const;
  return (
    <g className="pa-float">
      <rect x="100" y="16" width="120" height="90" rx="8" fill="#0b0e0b" fillOpacity="0.75" stroke={soft} />
      <line x1="100" y1="30" x2="220" y2="30" stroke={soft} />
      {["#ff5f57", "#febc2e", "#28c840"].map((col, i) => (
        <circle key={col} cx={110 + i * 8} cy="23" r="2.5" fill={col} opacity="0.8" />
      ))}
      {lines.map(([x, y, w, col], i) => (
        <rect key={i} x={x} y={y} width={w} height="5" rx="2.5" fill={col} className="pa-grow" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
      <rect x="186" y="86" width="2" height="9" fill={c} className="pa-blink" />
    </g>
  );
}

/** Database stack with data points flowing in. */
function Data({ c, c2, soft }: P) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} className="pa-float" style={{ animationDelay: `${i * 0.3}s` }}>
          <ellipse cx="190" cy={34 + i * 22} rx="34" ry="9" fill="#0b0e0b" fillOpacity="0.7" stroke={i === 0 ? c : soft} strokeWidth="1.5" />
          <path d={`M156 ${34 + i * 22} v14 a34 9 0 0 0 68 0 v-14`} fill="none" stroke={soft} strokeWidth="1.2" />
        </g>
      ))}
      <path d="M40 60 C 80 20, 110 100, 150 58" fill="none" stroke={soft} strokeWidth="1.2" />
      <path d="M40 60 C 80 20, 110 100, 150 58" fill="none" stroke={c2} strokeWidth="1.6" className="pa-flow" />
      {[40, 62, 84].map((x, i) => (
        <circle key={x} cx={x} cy={i % 2 ? 72 : 48} r="3.5" fill={i % 2 ? c2 : c} className="pa-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      {[250, 268, 286].map((x, i) => (
        <rect key={x} x={x} y={90 - (i + 1) * 16} width="10" height={(i + 1) * 16} rx="2" fill={i === 2 ? c : soft} className="pa-float" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

/** Wireframe cube on a floor grid, slowly turning. */
function Cube({ c, c2, soft }: P) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={60 + i * 50} y1="104" x2={120 + i * 20} y2="78" stroke={soft} strokeWidth="0.8" />
      ))}
      <line x1="40" y1="104" x2="280" y2="104" stroke={soft} strokeWidth="0.8" />
      <g className="pa-float">
        <g className="pa-spin">
          <polygon points="160,20 196,40 196,80 160,100 124,80 124,40" fill="none" stroke={c} strokeWidth="1.8" />
          <polyline points="124,40 160,60 196,40" fill="none" stroke={c2} strokeWidth="1.4" />
          <line x1="160" y1="60" x2="160" y2="100" stroke={c2} strokeWidth="1.4" />
        </g>
      </g>
      <circle cx="232" cy="34" r="4" fill={c2} className="pa-pulse" />
      <circle cx="88" cy="44" r="3" fill={c} className="pa-pulse" style={{ animationDelay: "0.8s" }} />
    </g>
  );
}

/** Two chat bubbles with typing dots and a live signal. */
function Chat({ c, c2, soft }: P) {
  return (
    <g>
      <g className="pa-float">
        <rect x="70" y="26" width="92" height="30" rx="12" fill={c} fillOpacity="0.85" />
        <path d="M84 56 l-6 10 l14 -10z" fill={c} fillOpacity="0.85" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={104 + i * 12} cy="41" r="3.5" fill="#0b0e0b" className="pa-pulse" style={{ animationDelay: `${i * 0.25}s` }} />
        ))}
      </g>
      <g className="pa-float" style={{ animationDelay: "1.2s" }}>
        <rect x="160" y="62" width="100" height="30" rx="12" fill="#0b0e0b" fillOpacity="0.75" stroke={c2} />
        <path d="M244 92 l8 10 l-2 -10z" fill={c2} />
        <rect x="174" y="72" width="60" height="4" rx="2" fill={c2} className="pa-grow" />
        <rect x="174" y="81" width="40" height="4" rx="2" fill={soft} className="pa-grow" style={{ animationDelay: "0.4s" }} />
      </g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="282" cy="30" r={6 + i * 7} fill="none" stroke={c} strokeOpacity={0.6 - i * 0.18} className="pa-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </g>
  );
}

/** Phone with cards sliding and a notification. */
function Mobile({ c, c2, soft }: P) {
  return (
    <g className="pa-float">
      <rect x="136" y="10" width="48" height="100" rx="9" fill="#0b0e0b" fillOpacity="0.8" stroke={c} strokeWidth="1.6" />
      <rect x="152" y="15" width="16" height="3" rx="1.5" fill={soft} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="142" y={28 + i * 24} width="36" height="18" rx="4" fill={i === 1 ? c2 : soft} className="pa-slide" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <circle cx="194" cy="18" r="6" fill={c2} className="pa-pulse" />
      <rect x="210" y="40" width="50" height="6" rx="3" fill={soft} className="pa-grow" />
      <rect x="60" y="70" width="50" height="6" rx="3" fill={soft} className="pa-grow" style={{ animationDelay: "0.8s" }} />
    </g>
  );
}

/** Code brackets with orbiting particles and rising sparks. */
function Code({ c, c2, soft }: P) {
  return (
    <g>
      <text x="160" y="74" textAnchor="middle" fill={c} fontSize="40" fontFamily="monospace" fontWeight="bold" className="pa-float">
        {"</>"}
      </text>
      <g className="pa-spin" style={{ transformOrigin: "160px 60px", transformBox: "view-box" }}>
        <ellipse cx="160" cy="60" rx="70" ry="26" fill="none" stroke={soft} />
        <circle cx="230" cy="60" r="4" fill={c2} />
        <circle cx="90" cy="60" r="3" fill={c} />
      </g>
      {[70, 110, 210, 250].map((x, i) => (
        <circle key={x} cx={x} cy="104" r="2" fill={i % 2 ? c : c2} className="pa-rise" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </g>
  );
}

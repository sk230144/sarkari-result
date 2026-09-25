import { Radar } from "lucide-react";

export type SkillAxis = { label: string; score: number; detail: string };

const LEVELS = [
  { min: 75, name: "Interview-ready", n: 4 },
  { min: 50, name: "Proficient", n: 3 },
  { min: 25, name: "Building", n: 2 },
  { min: 0, name: "Foundation", n: 1 },
];

const CX = 150;
const CY = 135;
const R = 110;

function point(i: number, n: number, r: number): [number, number] {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Radar of five tracks, each scored 0–100 against a stated target. */
export function SkillAnalysis({ axes }: { axes: SkillAxis[] }) {
  const n = axes.length;
  const lead = axes.reduce((best, a) => (a.score > best.score ? a : best), axes[0]);
  const level = LEVELS.find((l) => lead.score >= l.min)!;
  const values = axes.map((a, i) => point(i, n, Math.max(4, (a.score / 100) * R)));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-c-text)]">Skill Analysis</span>
        <Radar className="h-5 w-5 text-[var(--color-c-muted)]" />
      </div>

      <div className="flex w-full items-center justify-center py-4">
        <svg
          className="h-64 w-full max-w-[20rem] overflow-visible"
          viewBox="0 0 300 260"
          role="img"
          aria-label={axes.map((a) => `${a.label} ${a.score}%`).join(", ")}
        >
          <defs>
            <radialGradient cx="50%" cy="50%" id="radarGlow" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          {[1, 0.66, 0.33].map((f, i) => (
            <polygon
              key={f}
              fill="none"
              points={poly(axes.map((_, j) => point(j, n, R * f)))}
              stroke={["#223525", "#1b2b1d", "#152117"][i]}
              strokeWidth={1.5 - i * 0.25}
            />
          ))}
          {axes.map((_, i) => {
            const [x, y] = point(i, n, R);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#223525" strokeDasharray="2 2" strokeWidth="1" />;
          })}
          <polygon
            fill="url(#radarGlow)"
            points={poly(values)}
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ transition: "all 0.8s ease" }}
          />
          {values.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={axes[i].score ? 4 : 2.5} fill={axes[i].score ? "#22c55e" : "#647668"}>
              <title>
                {axes[i].label}: {axes[i].score}% ({axes[i].detail})
              </title>
            </circle>
          ))}
          {axes.map((a, i) => {
            const [x, y] = point(i, n, R + 18);
            const anchor = Math.abs(x - CX) < 10 ? "middle" : x > CX ? "start" : "end";
            return (
              <text
                key={a.label}
                x={x}
                y={y + 4}
                fill={a === lead && a.score > 0 ? "#22c55e" : "#8c9c90"}
                fontSize={a === lead && a.score > 0 ? 11 : 10}
                fontWeight={a === lead && a.score > 0 ? 600 : 400}
                textAnchor={anchor}
              >
                {a.label} {a.score}%
              </text>
            );
          })}
        </svg>
      </div>

      <div className="text-center text-xs text-[var(--color-c-muted)]">
        {lead.score > 0 ? (
          <>
            Strongest area, {lead.label}:{" "}
            <span className="font-semibold text-[var(--color-c-accent)]">
              Level {level.n} ({level.name})
            </span>
          </>
        ) : (
          "Solve a problem or try a tool to see your radar grow."
        )}
      </div>
    </div>
  );
}

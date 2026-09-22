import { Radar } from "lucide-react";

export function SkillAnalysis() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-c-text)]">Skill Analysis</span>
        <Radar className="h-5 w-5 text-[var(--color-c-muted)]" />
      </div>

      <div className="flex w-full items-center justify-center py-4">
        <svg
          className="h-64 w-72 overflow-visible"
          viewBox="0 0 300 260"
          role="img"
          aria-label="Skill radar: DSA at foundation level, other tracks not started"
        >
          <defs>
            <radialGradient cx="50%" cy="50%" id="radarGlow" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Concentric rings */}
          <polygon
            fill="none"
            points="150,20 265,95 220,230 80,230 35,95"
            stroke="#223525"
            strokeWidth="1.5"
          />
          <polygon
            fill="none"
            points="150,60 227,110 197,200 103,200 73,110"
            stroke="#1b2b1d"
            strokeWidth="1.2"
          />
          <polygon
            fill="none"
            points="150,95 188,125 173,170 127,170 112,125"
            stroke="#152117"
            strokeWidth="1"
          />

          {/* Axes */}
          {[
            [150, 20],
            [265, 95],
            [220, 230],
            [80, 230],
            [35, 95],
          ].map(([x, y]) => (
            <line
              key={`${x}-${y}`}
              x1="150"
              y1="135"
              x2={x}
              y2={y}
              stroke="#223525"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          ))}

          {/* Active values — DSA spikes, everything else near origin */}
          <polygon
            fill="url(#radarGlow)"
            points="150,35 160,135 155,145 145,145 140,135"
            stroke="#22c55e"
            strokeWidth="2.5"
          />
          <circle cx="150" cy="35" r="4.5" fill="#22c55e" />
          <circle cx="150" cy="135" r="3" fill="#647668" />

          <text
            x="150"
            y="10"
            fill="#22c55e"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            DSA
          </text>
          <text x="275" y="100" fill="#8c9c90" fontSize="10" textAnchor="start">
            System Design
          </text>
          <text x="225" y="245" fill="#8c9c90" fontSize="10" textAnchor="middle">
            Cover Letters
          </text>
          <text x="75" y="245" fill="#8c9c90" fontSize="10" textAnchor="middle">
            Mock Interviews
          </text>
          <text x="25" y="100" fill="#8c9c90" fontSize="10" textAnchor="end">
            Resume Analyses
          </text>
        </svg>
      </div>

      <div className="text-center text-xs text-[var(--color-c-muted)]">
        DSA mastery lead:{" "}
        <span className="font-semibold text-[var(--color-c-accent)]">
          Level 1 (Foundation)
        </span>
      </div>
    </div>
  );
}

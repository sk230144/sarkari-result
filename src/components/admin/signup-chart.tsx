"use client";

interface ChartData {
  date: string;
  count: number;
}

export function SignupChart({ data }: { data: ChartData[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 200;
  const barWidth = 100 / data.length;

  return (
    <div>
      <div className="relative h-[200px] w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <div
            key={pct}
            className="absolute left-0 right-0 border-t border-slate-100"
            style={{ top: `${(1 - pct) * 100}%` }}
          >
            <span className="absolute -left-1 -top-2.5 text-[9px] text-slate-400 font-medium -translate-x-full">
              {Math.round(max * pct)}
            </span>
          </div>
        ))}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end pl-6">
          {data.map((item, i) => {
            const height = (item.count / max) * chartHeight;
            return (
              <div
                key={item.date}
                className="flex flex-col items-center justify-end h-full group"
                style={{ width: `${barWidth}%` }}
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded mb-1 whitespace-nowrap pointer-events-none">
                  {item.date.slice(5)}: {item.count}
                </div>
                <div
                  className="w-[60%] min-w-[4px] rounded-t bg-blue-500 hover:bg-blue-600 transition-colors"
                  style={{ height: `${Math.max(height, 2)}px` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels - show every 5th */}
      <div className="flex pl-6 mt-1">
        {data.map((item, i) => (
          <div
            key={item.date}
            className="text-center"
            style={{ width: `${barWidth}%` }}
          >
            {i % 5 === 0 && (
              <span className="text-[8px] text-slate-400 font-medium">
                {item.date.slice(5)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

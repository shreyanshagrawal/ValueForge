import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";

const STEPS = [
  { num: 1, label: "Failures",  path: "failures"     },
  { num: 2, label: "Whitespace",path: "grid"         },
  { num: 3, label: "Territory", path: "territory"    },
  { num: 4, label: "Propositions", path: "value-props" },
];

interface StepperNavProps {
  /** Which step is currently active: 1–4 */
  currentStep: 1 | 2 | 3 | 4;
}

export default function StepperNav({ currentStep }: StepperNavProps) {
  const { scanId } = useParams<{ scanId: string }>();
  const [dataSource, setDataSource] = useState<"live" | "demo" | null>(null);

  useEffect(() => {
    if (!scanId) return;
    api.getScanStatus(scanId)
      .then((res: any) => {
        const src = res.data_source ?? res.dataSource;
        setDataSource(src === "live" ? "live" : "demo");
      })
      .catch(() => setDataSource("demo"));
  }, [scanId]);

  const base = scanId ? `/scan/${scanId}` : "";

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-[#E8DFF5] sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">

        {/* Steps */}
        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto hide-scrollbar">
          {STEPS.map((step) => {
            const isActive   = step.num === currentStep;
            const isComplete = step.num < currentStep;
            return (
              <Link
                key={step.num}
                to={`${base}/${step.path}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-[#8B4CFF] text-white shadow-sm"
                    : isComplete
                    ? "bg-[#8B4CFF]/10 text-[#8B4CFF] hover:bg-[#8B4CFF]/20"
                    : "text-[#7D7098] hover:text-[#8B4CFF] hover:bg-[#8B4CFF]/08"
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0
                    ${isActive ? "bg-white/20" : isComplete ? "bg-[#8B4CFF]/20" : "bg-[#E8DFF5]"}`}
                >
                  {isComplete ? "✓" : step.num}
                </span>
                {step.label}
              </Link>
            );
          })}
        </nav>

        {/* Data source badge */}
        {dataSource && (
          <span
            className={`shrink-0 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full border
              ${dataSource === "live"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-[#8B4CFF]/08 text-[#8B4CFF] border-[#8B4CFF]/20"
              }`}
          >
            {dataSource === "live" ? "⚡ Live Market Data" : "🔮 Demo Dataset"}
          </span>
        )}
      </div>
    </div>
  );
}

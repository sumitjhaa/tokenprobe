import type { AnalyzeResult, SeverityLevel } from "../types";
import { SEVERITY_COLORS, SEVERITY_LABELS } from "../types";
import FindingCard from "./FindingCard";

interface Props {
  result: AnalyzeResult;
}

export default function ResultsPanel({ result }: Props) {
  if (!result.token_valid_structure && result.error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl">
        <h2 className="text-lg font-bold text-red-700 dark:text-red-300">Invalid Token</h2>
        <p className="mt-2 text-red-600 dark:text-red-400">{result.error}</p>
      </div>
    );
  }

  if (result.findings.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-800 rounded-xl text-center">
        <h2 className="text-lg font-bold text-green-700 dark:text-green-300">No Issues Found</h2>
        <p className="mt-1 text-green-600 dark:text-green-400">This token appears to be well-configured.</p>
      </div>
    );
  }

  const severityOrder: SeverityLevel[] = ["critical", "high", "medium", "low", "info"];
  const grouped = severityOrder
    .map((s) => ({ severity: s, findings: result.findings.filter((f) => f.severity === s) }))
    .filter((g) => g.findings.length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Found {result.summary.total} security issue{result.summary.total !== 1 ? "s" : ""}
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {result.token_type.toUpperCase()} token
        </span>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {severityOrder.map((s) => {
          const count = result.summary[s as keyof typeof result.summary] as number;
          if (count === 0) return null;
          const colors = SEVERITY_COLORS[s];
          return (
            <div key={s} className={`flex items-center gap-1 px-3 py-1 rounded-full border ${colors.border} ${colors.bg}`}>
              <span className={`text-xs font-bold ${colors.text}`}>{SEVERITY_LABELS[s]}</span>
              <span className={`text-xs font-bold ${colors.text}`}>{count}</span>
            </div>
          );
        })}
      </div>

      {grouped.map((group) => (
        <div key={group.severity} className="mb-6">
          {group.findings.map((finding, i) => (
            <div key={i}><FindingCard finding={finding} /></div>
          ))}
        </div>
      ))}
    </div>
  );
}

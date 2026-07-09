import { Shield, ShieldCheck, AlertTriangle } from "lucide-react";
import type { AnalyzeResult } from "../types";
import { severityOrder } from "../utils/severity";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";
import FindingCard from "./FindingCard";

interface Props {
  result: AnalyzeResult;
}

export default function ResultsPanel({ result }: Props) {
  if (!result.token_valid_structure && result.error) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
        <Card className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60" padding="lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-bold text-red-700 dark:text-red-300">Invalid Token Structure</h2>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{result.error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (result.findings.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
        <Card className="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/60 text-center" padding="lg">
          <ShieldCheck size={28} className="mx-auto mb-2 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-bold text-green-700 dark:text-green-300">No Issues Found</h2>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">This token appears well-configured.</p>
        </Card>
      </div>
    );
  }

  const grouped = severityOrder
    .map((s) => ({ severity: s, findings: result.findings.filter((f) => f.severity === s) }))
    .filter((g) => g.findings.length > 0);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
      <Card padding="lg" className="mb-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              {result.summary.total} issue{result.summary.total !== 1 ? "s" : ""} found
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            {result.token_type.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {severityOrder.map((s) => {
            const count = result.summary[s as keyof typeof result.summary] as number;
            if (count === 0) return null;
            return <Badge key={s} severity={s} count={count} />;
          })}
        </div>
      </Card>

      {grouped.map((group) => (
        <div key={group.severity} className="mb-4">
          {group.findings.map((finding, i) => (
            <FindingCard key={`${finding.check}-${i}`} finding={finding} index={i} />
          ))}
        </div>
      ))}
    </div>
  );
}

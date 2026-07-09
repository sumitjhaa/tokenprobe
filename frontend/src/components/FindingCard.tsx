import { memo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Finding } from "../types";
import { severityTheme, severityLabel, severityIcon } from "../utils/severity";
import { cn } from "../utils/cn";
import { Card } from "./ui/Card";

interface Props {
  finding: Finding;
  index: number;
}

const FindingCard = memo(function FindingCard({ finding, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const theme = severityTheme[finding.severity];
  const Icon = severityIcon[finding.severity];

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card className={cn("border-l-4", theme.border, theme.bg)} padding="md">
        <div className="flex items-start gap-3">
          <Icon size={16} className={cn("mt-0.5 shrink-0", theme.text)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("px-2 py-0.5 rounded text-xs font-semibold uppercase leading-none", theme.text, "bg-current/10")}>
                {severityLabel[finding.severity]}
              </span>
              <code className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{finding.check}</code>
            </div>
            <p className="mt-1.5 text-sm text-gray-800 dark:text-gray-200">{finding.message}</p>

            {finding.remediation && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? "Hide remediation" : "View remediation"}
              </button>
            )}

            {expanded && finding.remediation && (
              <div className="mt-3 p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg animate-slide-down">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">Remediation</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{finding.remediation}</p>
              </div>
            )}

            {finding.details && (
              <details className="mt-2">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 select-none">
                  Technical details
                </summary>
                <pre className="mt-1 text-xs text-gray-500 bg-white/50 dark:bg-gray-900/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {finding.details}
                </pre>
              </details>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});

export default FindingCard;

import { useState } from "react";
import type { Finding, SeverityLevel } from "../types";
import { SEVERITY_COLORS, SEVERITY_LABELS } from "../types";

interface Props {
  finding: Finding;
}

export default function FindingCard({ finding }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sev = finding.severity as SeverityLevel;
  const colors = SEVERITY_COLORS[sev];

  return (
    <div className={`border-l-4 ${colors.border} ${colors.bg} rounded-lg p-4 mb-3`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${colors.text}`}>
            {SEVERITY_LABELS[sev]}
          </span>
          <code className="ml-2 text-sm font-mono text-gray-600 dark:text-gray-400">{finding.check}</code>
        </div>
        {finding.remediation && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? "Hide" : "Fix"}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">{finding.message}</p>
      {finding.remediation && expanded && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
          <strong className="text-gray-900 dark:text-gray-100">Remediation:</strong>
          <p className="mt-1">{finding.remediation}</p>
        </div>
      )}
      {finding.details && (
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Details</summary>
          <pre className="mt-1 text-xs text-gray-500 bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto">{finding.details}</pre>
        </details>
      )}
    </div>
  );
}

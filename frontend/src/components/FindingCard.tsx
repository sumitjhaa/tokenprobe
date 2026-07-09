import { memo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Finding } from "../types";
import { severityLabel, severityIcon, severityClass } from "../utils/severity";
import { cn } from "../utils/cn";

interface Props {
  finding: Finding;
  index: number;
}

const FindingCard = memo(function FindingCard({ finding, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const Icon = severityIcon[finding.severity];
  const cls = severityClass[finding.severity].split(" ")[0];

  return (
    <div className={cn("finding", cls)} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-start gap-3">
        <Icon size={16} style={{ color: "inherit", flexShrink: 0, marginTop: "0.125rem" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("badge", severityClass[finding.severity].split(" ").find((c) => c.startsWith("badge-")) || "badge-info")}>
              {severityLabel[finding.severity]}
            </span>
            <code style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {finding.check}
            </code>
          </div>
          <p style={{ marginTop: "0.375rem", fontSize: "0.875rem" }}>{finding.message}</p>

          {finding.remediation && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "0.5rem" }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Hide remediation" : "View remediation"}
            </button>
          )}

          {expanded && finding.remediation && (
            <div className="animate-slide-down" style={{ marginTop: "0.75rem", padding: "0.75rem", background: "var(--bg-alt)", borderRadius: "0.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>Remediation</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{finding.remediation}</p>
            </div>
          )}

          {finding.details && (
            <details style={{ marginTop: "0.5rem" }}>
              <summary style={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer" }}>
                Technical details
              </summary>
              <pre style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-alt)", padding: "0.5rem", borderRadius: "0.375rem", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                {finding.details}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
});

export default FindingCard;

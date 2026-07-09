import { Shield, ShieldCheck, AlertTriangle } from "lucide-react";
import type { AnalyzeResult } from "../types";
import { severityOrder } from "../utils/severity";
import { Badge } from "./ui/Badge";
import FindingCard from "./FindingCard";

interface Props {
  result: AnalyzeResult;
}

export default function ResultsPanel({ result }: Props) {
  if (!result.token_valid_structure && result.error) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "1.5rem auto 0" }}>
        <div style={{ padding: "1rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.875rem" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <div style={{ fontWeight: 700 }}>Invalid Token Structure</div>
              <div style={{ marginTop: "0.25rem" }}>{result.error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result.findings.length === 0) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "1.5rem auto 0" }}>
        <div style={{ padding: "1.25rem", background: "var(--success-soft)", color: "var(--success)", textAlign: "center" }}>
          <ShieldCheck size={24} style={{ margin: "0 auto 0.375rem" }} />
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>No Issues Found</div>
          <div style={{ fontSize: "0.8125rem", marginTop: "0.125rem" }}>This token appears well-configured.</div>
        </div>
      </div>
    );
  }

  const grouped = severityOrder
    .map((s) => ({ severity: s, findings: result.findings.filter((f) => f.severity === s) }))
    .filter((g) => g.findings.length > 0);

  return (
    <div className="animate-fade-in findings-wrap" style={{ maxWidth: "48rem", margin: "0 auto" }}>
      <div className="summary-card">
        <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: "var(--accent)" }} />
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
              {result.summary.total} issue{result.summary.total !== 1 ? "s" : ""} found
            </h2>
          </div>
          <span style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-alt)", padding: "0.2rem 0.4rem" }}>
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
      </div>

      <div className="finding-group">
        {grouped.map((group) => (
          <div key={group.severity}>
            {group.findings.map((finding, i) => (
              <FindingCard key={`${finding.check}-${i}`} finding={finding} index={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

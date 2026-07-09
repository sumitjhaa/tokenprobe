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
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "2rem auto 0" }}>
        <div className="card" style={{ padding: "1.25rem", background: "var(--danger-soft)", outline: "1px solid var(--danger)" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "0.125rem" }} />
            <div>
              <h2 style={{ fontWeight: 700, color: "var(--danger)" }}>Invalid Token Structure</h2>
              <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--danger)" }}>{result.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result.findings.length === 0) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "2rem auto 0" }}>
        <div className="card" style={{ padding: "1.5rem", background: "var(--success-soft)", outline: "1px solid var(--success)", textAlign: "center" }}>
          <ShieldCheck size={28} style={{ margin: "0 auto 0.5rem", color: "var(--success)" }} />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--success)" }}>No Issues Found</h2>
          <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--success)" }}>This token appears well-configured.</p>
        </div>
      </div>
    );
  }

  const grouped = severityOrder
    .map((s) => ({ severity: s, findings: result.findings.filter((f) => f.severity === s) }))
    .filter((g) => g.findings.length > 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "2rem auto 0" }}>
      <div className="summary-card">
        <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: "var(--accent)" }} />
            <h2 style={{ fontWeight: 700 }}>
              {result.summary.total} issue{result.summary.total !== 1 ? "s" : ""} found
            </h2>
          </div>
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-alt)", padding: "0.25rem 0.5rem", borderRadius: "0.375rem" }}>
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

      {grouped.map((group) => (
        <div key={group.severity} style={{ marginBottom: "1rem" }}>
          {group.findings.map((finding, i) => (
            <FindingCard key={`${finding.check}-${i}`} finding={finding} index={i} />
          ))}
        </div>
      ))}
    </div>
  );
}

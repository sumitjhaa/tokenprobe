import { useState, useCallback } from "react";
import type { AnalyzeResult } from "../types";
import { severityOrder } from "../utils/severity";
import { Badge } from "./ui/Badge";
import FindingCard from "./FindingCard";
import NfIcon from "./NfIcon";

interface Props {
  result: AnalyzeResult;
  token?: string;
}

export default function ResultsPanel({ result, token }: Props) {
  const [copied, setCopied] = useState(false);

  const copyResults = useCallback(async () => {
    const text = [
      `TokenProbe Analysis — ${result.summary.total} issue(s) found`,
      `Token type: ${result.token_type.toUpperCase()}`,
      "",
      ...result.findings.map((f) => `[${f.severity.toUpperCase()}] ${f.check}: ${f.message}`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const downloadResults = useCallback(() => {
    const blob = new Blob([JSON.stringify({ token, result }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokenprobe-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, token]);
  if (!result.token_valid_structure && result.error) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "1.5rem auto 0" }}>
        <div style={{ padding: "1rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.875rem" }}>
          <div className="flex items-start gap-2">
            <NfIcon name="alert" size="1em" style={{ flexShrink: 0, marginTop: "0.125rem" }} />
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
          <NfIcon name="checkCircle" size="1.5em" />
          <div style={{ fontWeight: 700, fontSize: "1rem", marginTop: "0.375rem" }}>No Issues Found</div>
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
              <NfIcon name="shield" size="1em" style={{ color: "var(--accent)" }} />
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
                {result.summary.total} issue{result.summary.total !== 1 ? "s" : ""} found
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={copyResults} className="btn btn-ghost btn-sm" title="Copy summary">
                <NfIcon name={copied ? "check" : "copy"} size="0.875em" />
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadResults} className="btn btn-ghost btn-sm" title="Download JSON">
                <NfIcon name="download" size="0.875em" />
                JSON
              </button>
              <span style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "var(--text-muted)", background: "var(--bg-alt)", padding: "0.2rem 0.4rem" }}>
                {result.token_type.toUpperCase()}
              </span>
            </div>
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

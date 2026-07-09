import { useState, useRef, useCallback, type DragEvent } from "react";
import { analyzeBatch } from "../api/client";
import { useApi } from "../hooks/useApi";
import type { BatchResponse } from "../types";
import type { SeverityLevel } from "../types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ErrorBoundary } from "../utils/errors";
import { cn } from "../utils/cn";
import { severityOrder } from "../utils/severity";
import NfIcon from "../components/NfIcon";

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: result, loading, error, execute, reset } = useApi<BatchResponse>();

  const onFileSelected = (f: File) => { setFile(f); reset(); };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileSelected(f);
  };

  const [copied, setCopied] = useState(false);

  const copyBatchResults = useCallback(() => {
    if (!result) return;
    const text = [
      `TokenProbe Batch Analysis`,
      `Total: ${result.total_tokens} | Processed: ${result.processed_tokens} | Failed: ${result.failed} | Findings: ${result.total_findings}`,
      "",
      ...result.results.map((r) =>
        r.error
          ? `[FAIL] ${r.token_preview}: ${r.error}`
          : `[OK]   ${r.token_preview}: ${r.findings.length} finding(s)`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const downloadBatchResults = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokenprobe-batch-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <ErrorBoundary>
      <div className="animate-fade-in">
        <div className="flex items-center gap-2" style={{ marginBottom: "1.5rem" }}>
          <NfIcon name="upload" size="1.75rem" style={{ color: "var(--accent)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Batch Analysis</h1>
        </div>

        <div style={{ width: "min(64rem, 100%)", padding: "0 1rem", margin: "0 auto" }}>
        <div
          className={cn("dropzone", isDragging && "dropzone-active")}
          style={{ textAlign: "center", padding: "2.5rem", cursor: "pointer" }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.json"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <NfIcon name="fileText" size="1.375em" style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{file.name}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <>
              <NfIcon name="upload" size="2.5em" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "0.75rem" }}>Drop file or click to browse</p>
            </>
          )}
        </div>

        {file && (
          <Button
            onClick={() => execute(() => analyzeBatch(file))}
            disabled={loading}
            loading={loading}
            style={{ width: "100%", marginTop: "0.75rem" }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        )}

        {loading && (
          <div className="animate-fade-in" style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ flex: 1, height: "0.5rem", background: "var(--bg-alt)", overflow: "hidden" }}>
                <div className="animate-progress" style={{ height: "100%", width: "30%", background: "var(--accent)" }} />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>Analyzing...</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: "1.25rem", padding: "1rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.9375rem" }}>
            <div className="flex items-center gap-2">
              <NfIcon name="alert" size="1.125em" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in" style={{ marginTop: "1.5rem" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 700 }}>Results</h2>
              <div className="flex items-center gap-1">
                <button onClick={copyBatchResults} className="btn btn-ghost btn-sm" title="Copy summary">
                  <NfIcon name={copied ? "check" : "copy"} size="0.875em" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadBatchResults} className="btn btn-ghost btn-sm" title="Download JSON">
                  <NfIcon name="download" size="0.875em" />
                  JSON
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
              {[
                { label: "Total", value: result.total_tokens },
                { label: "Processed", value: result.processed_tokens },
                { label: "Failed", value: result.failed },
                { label: "Findings", value: result.total_findings },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: "1rem", background: "var(--bg)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap" style={{ marginTop: "1rem" }}>
              {severityOrder.map((s) => {
                const count = result.severity_summary[s] || 0;
                if (count === 0) return null;
                return <Badge key={s} severity={s as SeverityLevel} count={count} />;
              })}
            </div>

            {result.results.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {result.results.map((r) => (
                    <div key={r.index} className="batch-row">
                      <code className="truncate" style={{ fontSize: "0.8125rem", color: "var(--text-muted)", maxWidth: "70%" }}>
                        {r.token_preview}
                      </code>
                      {r.error ? (
                        <NfIcon name="alert" size="1em" style={{ color: "var(--danger)", flexShrink: 0 }} />
                      ) : (
                        <NfIcon name="checkCircle" size="1em" style={{ color: "var(--success)", flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
}

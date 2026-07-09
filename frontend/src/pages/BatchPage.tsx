import { useState, useRef, type DragEvent } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { analyzeBatch } from "../api/client";
import { useApi } from "../hooks/useApi";
import type { BatchResponse } from "../types";
import type { SeverityLevel } from "../types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBoundary } from "../utils/errors";
import { cn } from "../utils/cn";
import { severityOrder } from "../utils/severity";

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: result, loading, error, execute, reset } = useApi<BatchResponse>();

  const onFileSelected = (f: File) => {
    setFile(f);
    reset();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileSelected(f);
  };

  const handleRun = () => {
    if (!file) return;
    execute(() => analyzeBatch(file));
  };

  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "0 auto" }}>
        <div className="text-center" style={{ marginBottom: "1.5rem" }}>
          <Upload size={22} style={{ margin: "0 auto 0.75rem", color: "var(--accent)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Batch Analysis</h1>
          <p style={{ marginTop: "0.25rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Upload a text file with one token per line, or a JSON array of tokens.
          </p>
        </div>

        <div
          className={cn("dropzone", isDragging && "dropzone-active")}
          style={{ textAlign: "center", padding: "2rem", cursor: "pointer" }}
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
              <FileText size={18} style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: 500 }}>{file.name}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <>
              <Upload size={32} style={{ margin: "0 auto 0.5rem", color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Drop a file here or click to browse</p>
              <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>.txt (one per line) or .json</p>
            </>
          )}
        </div>

        <Button
          onClick={handleRun}
          disabled={!file}
          loading={loading}
          style={{ width: "100%", marginTop: "0.75rem" }}
        >
          {loading ? "Analyzing..." : `Analyze ${file ? file.name : "file"}`}
        </Button>

        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div style={{ marginTop: "1.25rem", padding: "0.875rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.875rem" }}>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in" style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
              {[
                { label: "Total", value: result.total_tokens },
                { label: "Processed", value: result.processed_tokens },
                { label: "Failed", value: result.failed },
                { label: "Findings", value: result.total_findings },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: "0.75rem", background: "var(--bg)", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap" style={{ marginTop: "0.75rem" }}>
              {severityOrder.map((s) => {
                const count = result.severity_summary[s] || 0;
                if (count === 0) return null;
                return <Badge key={s} severity={s as SeverityLevel} count={count} />;
              })}
            </div>

            {result.results.length > 0 && (
              <div style={{ marginTop: "0.75rem" }}>
                <h3 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Results</h3>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {result.results.map((r) => (
                    <div key={r.index} className="batch-row">
                      <code className="truncate" style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "70%" }}>
                        {r.token_preview}
                      </code>
                      {r.error ? (
                        <AlertCircle size={14} style={{ color: "var(--danger)", flexShrink: 0 }} />
                      ) : (
                        <CheckCircle size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

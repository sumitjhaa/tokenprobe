import { useState, useRef, type DragEvent } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { analyzeBatch } from "../api/client";
import { useApi } from "../hooks/useApi";
import type { BatchResponse } from "../types";
import type { SeverityLevel } from "../types";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
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
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <Upload size={28} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Batch Analysis</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload a text file with one token per line, or a JSON array of tokens.
          </p>
        </div>

        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/60 scale-[1.01]"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
              <span className="text-sm text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <>
              <Upload size={36} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">Drop a file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">.txt (one per line) or .json</p>
            </>
          )}
        </div>

        <Button onClick={handleRun} disabled={!file} loading={loading} className="w-full">
          {loading ? "Analyzing..." : `Analyze ${file ? file.name : "file"}`}
        </Button>

        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <Card className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </Card>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total", value: result.total_tokens },
                { label: "Processed", value: result.processed_tokens },
                { label: "Failed", value: result.failed },
                { label: "Findings", value: result.total_findings },
              ].map((stat) => (
                <Card key={stat.label} className="text-center bg-gray-50 dark:bg-gray-900/50" padding="md">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {severityOrder.map((s) => {
                const count = result.severity_summary[s] || 0;
                if (count === 0) return null;
                return <Badge key={s} severity={s as SeverityLevel} count={count} />;
              })}
            </div>

            {result.results.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Results</h3>
                {result.results.map((r) => (
                  <Card key={r.index} padding="sm" hover>
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-[70%]">
                        {r.token_preview}
                      </code>
                      {r.error ? (
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                      )}
                    </div>
                    {r.error && (
                      <p className="mt-1 text-xs text-red-500">{r.error}</p>
                    )}
                    {!r.error && (
                      <p className="mt-1 text-xs text-gray-400">
                        {r.findings.length === 0
                          ? "No issues"
                          : `${r.findings.length} finding${r.findings.length !== 1 ? "s" : ""}`
                        }
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

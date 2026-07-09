import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { analyzeBatch } from "../api/client";
import type { BatchResponse } from "../types";
import { SEVERITY_COLORS, SEVERITY_LABELS, type SeverityLevel } from "../types";

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleRun = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeBatch(file);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <Upload size={32} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Batch Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Upload a text file with one token per line, or a JSON file with an array of tokens.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          }`}
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
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText size={20} className="text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">{file.name}</span>
              <span className="text-sm text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <>
              <Upload size={40} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">Drop a file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Supports .txt (one token per line) and .json</p>
            </>
          )}
        </div>

        <button
          onClick={handleRun}
          disabled={!file || loading}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : `Analyze ${file ? file.name : "..."}`}
        </button>

        {loading && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Tokens", value: result.total_tokens },
                { label: "Processed", value: result.processed_tokens },
                { label: "Failed", value: result.failed },
                { label: "Total Findings", value: result.total_findings },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {(["critical", "high", "medium", "low", "info"] as SeverityLevel[]).map((s) => {
                const count = result.severity_summary[s] || 0;
                if (count === 0) return null;
                const colors = SEVERITY_COLORS[s];
                return (
                  <div key={s} className={`flex items-center gap-1 px-3 py-1 rounded-full border ${colors.border} ${colors.bg}`}>
                    <span className={`text-xs font-bold ${colors.text}`}>{SEVERITY_LABELS[s]}</span>
                    <span className={`text-xs font-bold ${colors.text}`}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {result.results.map((r) => (
                <div key={r.index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{r.token_preview}</code>
                    {r.error ? (
                      <AlertCircle size={14} className="text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                    )}
                  </div>
                  {r.error && <p className="text-xs text-red-500">{r.error}</p>}
                  {r.findings.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{r.findings.length} finding{r.findings.length !== 1 ? "s" : ""}</p>
                  )}
                  {r.findings.length === 0 && !r.error && (
                    <p className="text-xs text-green-600">No issues</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

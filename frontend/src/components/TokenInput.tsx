import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";
import { SAMPLES } from "../samples/tokens";
import type { RecentToken } from "../hooks/useRecentTokens";
import TokenDecoder from "./TokenDecoder";
import NfIcon from "./NfIcon";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

interface Props {
  onAnalyze: (token: string) => void;
  loading: boolean;
  recent?: RecentToken[];
  onClearRecent?: () => void;
}

export default function TokenInput({ onAnalyze, loading, recent, onClearRecent }: Props) {
  const [token, setToken] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      const trimmed = token.trim();
      if (trimmed) onAnalyze(trimmed);
    }
  };

  const readFileAsText = (file: File) => {
    setFileError(null);
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max 1MB)`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setToken((reader.result as string).trim());
    reader.onerror = () => setFileError("Failed to read file");
    reader.readAsText(file);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text.trim());
    } catch {
      textareaRef.current?.focus();
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    readFileAsText(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsText(file);
    e.target.value = "";
  };

  const hasToken = token.trim().length > 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "0 auto", position: "relative", zIndex: 2 }}>
      <div
        className={cn("dropzone", isDragging && "dropzone-active")}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
          <textarea
            ref={textareaRef}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your JWT or JWE token here..."
            className="input"
            style={{ minHeight: "10rem" }}
            spellCheck={false}
          />

        <TokenDecoder token={token} />

        {fileError && (
          <div className="flex items-center gap-2 mt-3" style={{ color: "var(--danger)", fontSize: "0.875rem" }}>
            <NfIcon name="alert" size="0.875em" />
            {fileError}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.json,.jwt"
          onChange={handleFileInput}
          className="sr-only"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={() => onAnalyze(token.trim())} disabled={!hasToken} loading={loading}>
            Analyze
          </Button>
          <Button variant="secondary" onClick={handlePasteFromClipboard}>
            <NfIcon name="clipboard" size="0.875em" />
            Paste
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <NfIcon name="upload" size="0.875em" />
            Open File
          </Button>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Button variant="secondary" onClick={() => setShowSamples(!showSamples)}>
              <NfIcon name="file" size="0.875em" />
              Samples
              <NfIcon name="chevronDown" size="0.75em" />
            </Button>
            {showSamples && (
              <div className="dropdown" onMouseLeave={() => setShowSamples(false)}>
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    className="dropdown-item"
                    onClick={() => { setToken(s.token); setShowSamples(false); }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("tag", `tag-${s.category}`)}>{s.category}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{s.label}</span>
                    </div>
                    <p className="line-clamp-1" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                      {s.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {recent && recent.length > 0 && (
            <div style={{ position: "relative", zIndex: 1 }}>
              <Button variant="secondary" onClick={() => setShowRecent(!showRecent)}>
                <NfIcon name="history" size="0.875em" />
                Recent
                <NfIcon name="chevronDown" size="0.75em" />
              </Button>
              {showRecent && (
                <div className="dropdown" onMouseLeave={() => setShowRecent(false)}>
                  {recent.map((r) => (
                    <button
                      key={r.id}
                      className="dropdown-item"
                      onClick={() => { setToken(r.token); setShowRecent(false); }}
                    >
                      <span style={{ fontSize: "0.8125rem", fontWeight: 500, fontFamily: "monospace" }}>
                        {r.preview}
                      </span>
                      <span style={{ fontSize: "0.625rem", color: "var(--text-muted)", display: "block", marginTop: "0.125rem" }}>
                        {new Date(r.timestamp).toLocaleString()}
                      </span>
                    </button>
                  ))}
                  {onClearRecent && (
                    <button
                      className="dropdown-item"
                      onClick={() => { onClearRecent(); setShowRecent(false); }}
                      style={{ color: "var(--text-muted)", fontStyle: "italic" }}
                    >
                      Clear history
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {hasToken && (
            <Button variant="ghost" onClick={() => setToken("")}>
              <NfIcon name="times" size="0.875em" />
              Clear
            </Button>
          )}
        </div>

          <div className="flex items-center justify-between mt-3" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <NfIcon name="upload" size="0.75em" />
              Drag & drop a token file anywhere on this panel
            </span>
            <span className="flex items-center gap-1">
              <kbd style={{ background: "var(--bg-alt)", padding: "0.1rem 0.35rem", fontSize: "0.625rem", fontFamily: "monospace" }}>Ctrl+Enter</kbd>
              to analyze
            </span>
          </div>
      </div>
    </div>
  );
}

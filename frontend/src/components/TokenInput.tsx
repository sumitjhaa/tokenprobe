import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, Clipboard, FileCode, X, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";
import { SAMPLES } from "../samples/tokens";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

interface Props {
  onAnalyze: (token: string) => void;
  loading: boolean;
}

export default function TokenInput({ onAnalyze, loading }: Props) {
  const [token, setToken] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "0 auto" }}>
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
          placeholder="Paste your JWT or JWE token here..."
          className="input"
          style={{ minHeight: "8rem" }}
          spellCheck={false}
        />

        {fileError && (
          <div className="flex items-center gap-2 mt-3" style={{ color: "var(--danger)", fontSize: "0.875rem" }}>
            <AlertCircle size={14} />
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
            <Clipboard size={14} />
            Paste
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            Open File
          </Button>
          <div style={{ position: "relative" }}>
            <Button variant="secondary" onClick={() => setShowSamples(!showSamples)}>
              <FileCode size={14} />
              Samples
              <ChevronDown size={12} />
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
          {hasToken && (
            <Button variant="ghost" onClick={() => setToken("")}>
              <X size={14} />
              Clear
            </Button>
          )}
        </div>

        <p className="flex items-center gap-1 mt-3" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <Upload size={12} />
          Drag & drop a token file anywhere on this panel
        </p>
      </div>
    </div>
  );
}

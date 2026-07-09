import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, Clipboard, FileCode, X, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";
import { SAMPLES } from "../samples/tokens";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

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
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/60 scale-[1.01]"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT or JWE token here..."
          className="w-full h-32 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
          spellCheck={false}
        />

        {fileError && (
          <div className="flex items-center gap-2 mt-3 text-sm text-red-600 dark:text-red-400 animate-fade-in">
            <AlertCircle size={14} />
            {fileError}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.json,.jwt"
          onChange={handleFileInput}
          className="hidden"
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
          <div className="relative">
            <Button variant="secondary" onClick={() => setShowSamples(!showSamples)}>
              <FileCode size={14} />
              Samples
              <ChevronDown size={12} />
            </Button>
            {showSamples && (
              <div className="absolute left-0 top-full mt-1 z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-scale-in"
                onMouseLeave={() => setShowSamples(false)}
              >
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-700/40 last:border-0 transition-colors"
                    onClick={() => { setToken(s.token); setShowSamples(false); }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                        s.category === "vulnerability" && "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
                        s.category === "jwe" && "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
                        s.category === "clean" && "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
                        s.category === "edge" && "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400",
                      )}>{s.category}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>
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

        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <Upload size={12} />
          Drag & drop a token file anywhere on this panel
        </p>
      </div>
    </div>
  );
}

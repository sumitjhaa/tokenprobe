import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, Clipboard, FileCode, X } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";

interface Props {
  onAnalyze: (token: string) => void;
  loading: boolean;
}

const SAMPLE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c";

export default function TokenInput({ onAnalyze, loading }: Props) {
  const [token, setToken] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text.trim());
    } catch {
      textareaRef.current?.focus();
      document.execCommand("paste");
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setToken((reader.result as string).trim());
    reader.readAsText(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setToken((reader.result as string).trim());
    reader.readAsText(file);
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
          <Button variant="secondary" onClick={() => setToken(SAMPLE_TOKEN)}>
            <FileCode size={14} />
            Sample
          </Button>
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

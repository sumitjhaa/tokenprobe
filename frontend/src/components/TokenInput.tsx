import { useState, useRef, type DragEvent } from "react";

interface Props {
  onAnalyze: (token: string) => void;
  loading: boolean;
}

const SAMPLE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c";

export default function TokenInput({ onAnalyze, loading }: Props) {
  const [token, setToken] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setToken(text.trim());
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setToken((reader.result as string).trim());
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={inputRef}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT or JWE token here..."
          className="w-full h-32 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => onAnalyze(token)}
            disabled={loading || !token.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            onClick={handlePaste}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Paste
          </button>
          <button
            onClick={() => setToken(SAMPLE_TOKEN)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Sample Token
          </button>
          <button
            onClick={() => setToken("")}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Or drag & drop a token file, or paste from clipboard
        </p>
      </div>
    </div>
  );
}

import Navbar from "./components/Navbar";
import TokenInput from "./components/TokenInput";
import ResultsPanel from "./components/ResultsPanel";
import { useTheme } from "./hooks/useTheme";
import { useAnalysis } from "./hooks/useAnalysis";
import { Shield } from "lucide-react";

export default function App() {
  const { dark, toggle } = useTheme();
  const { result, loading, error, analyze } = useAnalysis();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Navbar dark={dark} onToggleDark={toggle} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield size={32} className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              TokenProbe
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Analyze JWT and JWE tokens for security misconfigurations.
            Paste a token below to get started.
          </p>
        </div>

        <TokenInput onAnalyze={analyze} loading={loading} />

        {loading && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="w-full max-w-3xl mx-auto mt-8 p-4 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {result && <ResultsPanel result={result} />}

        <div className="mt-16 text-center text-xs text-gray-400 dark:text-gray-600">
          TokenProbe v1.0.0 &mdash; No tokens are stored or transmitted
        </div>
      </main>
    </div>
  );
}

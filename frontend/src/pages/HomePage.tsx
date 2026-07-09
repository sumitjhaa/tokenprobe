import { ShieldAlert } from "lucide-react";
import TokenInput from "../components/TokenInput";
import ResultsPanel from "../components/ResultsPanel";
import { useAnalysis } from "../hooks/useAnalysis";
import { ErrorBoundary } from "../utils/errors";
import { Spinner } from "../components/ui/Spinner";

export default function HomePage() {
  const { result, loading, error, analyze } = useAnalysis();

  return (
    <ErrorBoundary>
      <div className="text-center mb-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <ShieldAlert size={32} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            TokenProbe
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
          Analyze JWT and JWE tokens for security misconfigurations.
          Paste a token below or upload a file.
        </p>
      </div>

      <TokenInput onAnalyze={analyze} loading={loading} />

      {loading && (
        <div className="flex justify-center mt-8 animate-fade-in">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="w-full max-w-3xl mx-auto mt-6 animate-fade-in">
          <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        </div>
      )}

      {result && <ResultsPanel result={result} />}
    </ErrorBoundary>
  );
}

import { Shield } from "lucide-react";
import TokenInput from "../components/TokenInput";
import ResultsPanel from "../components/ResultsPanel";
import { useAnalysis } from "../hooks/useAnalysis";
import { ErrorBoundary } from "../utils/errors";
import { Spinner } from "../components/ui/Spinner";

export default function HomePage() {
  const { result, loading, error, analyze } = useAnalysis();

  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ marginBottom: "2rem" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: "0.375rem" }}>
          <div style={{ padding: "0.5rem", background: "var(--accent-soft)", display: "flex" }}>
            <Shield size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>TokenProbe</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Analyze JWT and JWE tokens for security misconfigurations.
        </p>
      </div>

      <TokenInput onAnalyze={analyze} loading={loading} />

      {loading && (
        <div className="flex justify-center mt-6 animate-fade-in">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "1.25rem auto 0" }}>
          <div style={{ padding: "1rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.9375rem" }}>
            {error}
          </div>
        </div>
      )}

      {result && <ResultsPanel result={result} />}
    </ErrorBoundary>
  );
}

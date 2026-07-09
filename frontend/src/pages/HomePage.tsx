import { Shield, Zap } from "lucide-react";
import TokenInput from "../components/TokenInput";
import ResultsPanel from "../components/ResultsPanel";
import { useAnalysis } from "../hooks/useAnalysis";
import { ErrorBoundary } from "../utils/errors";
import { Spinner } from "../components/ui/Spinner";

export default function HomePage() {
  const { result, loading, error, analyze } = useAnalysis();

  return (
    <ErrorBoundary>
      <div className="text-center animate-fade-in" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{
            width: "3rem", height: "3rem", borderRadius: "0.75rem",
            background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={24} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>TokenProbe</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", maxWidth: "36rem", margin: "0 auto", fontSize: "0.875rem" }}>
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
        <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "1.5rem auto 0" }}>
          <div style={{ padding: "1rem", background: "var(--danger-soft)", color: "var(--danger)", borderRadius: "0.75rem", outline: "1px solid var(--danger)", fontSize: "0.875rem" }}>
            {error}
          </div>
        </div>
      )}

      {result && <ResultsPanel result={result} />}

      <div style={{ marginTop: "4rem", textAlign: "center" }}>
        <div className="flex gap-2 justify-center flex-wrap" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1"><Zap size={12} /> 8 static checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> 4 JWE checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Actionable reports</span>
        </div>
      </div>
    </ErrorBoundary>
  );
}

import { Shield, Zap, FileSearch, Lock, Server, AlertTriangle, CheckCircle, Code } from "lucide-react";
import TokenInput from "../components/TokenInput";
import ResultsPanel from "../components/ResultsPanel";
import { useAnalysis } from "../hooks/useAnalysis";
import { ErrorBoundary } from "../utils/errors";
import { Spinner } from "../components/ui/Spinner";

const features = [
  { icon: FileSearch, label: "8 static checks", desc: "Header & payload analysis" },
  { icon: Lock, label: "4 JWE checks", desc: "Encrypted token validation" },
  { icon: Server, label: "Key confusion", desc: "Algorithm confusion detection" },
  { icon: AlertTriangle, label: "PII detection", desc: "Sensitive data in payload" },
  { icon: CheckCircle, label: "Best practices", desc: "Missing claims audit" },
  { icon: Code, label: "File support", desc: "Drag, paste, or upload" },
];

export default function HomePage() {
  const { result, loading, error, analyze } = useAnalysis();

  return (
    <ErrorBoundary>
      <div className="text-center animate-fade-in" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
          <div style={{
            width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={22} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>TokenProbe</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", maxWidth: "32rem", margin: "0 auto", fontSize: "0.8125rem" }}>
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
          <div style={{ padding: "0.875rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.875rem" }}>
            {error}
          </div>
        </div>
      )}

      {result && <ResultsPanel result={result} />}

      <div className="demo-section animate-fade-in">
        <h2 className="demo-section-title">What it checks</h2>
        <div className="demo-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="demo-card">
                <Icon size={12} style={{ color: "var(--accent)" }} />
                <div>
                  <div className="demo-card-label">{f.label}</div>
                  <div className="demo-card-desc">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
}

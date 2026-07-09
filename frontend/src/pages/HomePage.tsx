import { Shield, FileSearch, Lock, Server, AlertTriangle, CheckCircle, Code } from "lucide-react";
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
        <div className="flex items-center justify-center gap-3 mb-3">
          <div style={{ padding: "0.625rem", background: "var(--accent-soft)", display: "flex" }}>
            <Shield size={28} style={{ color: "var(--accent)" }} />
          </div>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>TokenProbe</h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: "28rem", margin: "0.375rem auto 0", fontSize: "0.9375rem" }}>
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

      <div className="animate-fade-in" style={{ maxWidth: "36rem", margin: "3rem auto 0", textAlign: "center" }}>
        <p className="section-label" style={{ marginBottom: "0.75rem" }}>What it checks</p>
        <div className="features-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="feature-card">
                <div className="feature-icon-wrap">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="feature-card-label">{f.label}</div>
                  <div className="feature-card-desc">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">14+</span>
            <span className="stat-desc">Detection checks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24</span>
            <span className="stat-desc">Sample tokens</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Zero</span>
            <span className="stat-desc">Network calls</span>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

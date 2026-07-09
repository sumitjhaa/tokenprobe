import { Shield, ExternalLink, FileSearch, Lock, Server, AlertTriangle, CheckCircle, Code, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBoundary } from "../utils/errors";

const whatItChecks = [
  { icon: FileSearch, label: "8 static checks", desc: "Header & payload analysis" },
  { icon: Lock, label: "4 JWE checks", desc: "Encrypted token validation" },
  { icon: Server, label: "Key confusion", desc: "Algorithm confusion detection" },
  { icon: AlertTriangle, label: "PII detection", desc: "Sensitive data in payload" },
  { icon: CheckCircle, label: "Best practices", desc: "Missing claims audit" },
  { icon: Code, label: "File support", desc: "Drag, paste, or upload" },
];

const highlights = [
  { icon: FileSearch, label: "8 static checks", desc: "alg none, missing claims, PII exposure, algorithm confusion" },
  { icon: ShieldCheck, label: "4 JWE checks", desc: "Weak encryption, missing protected header fields" },
  { icon: BookOpen, label: "Actionable reports", desc: "Every finding includes remediation guidance" },
];

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "0 auto" }}>
        <div className="text-center" style={{ marginBottom: "2rem" }}>
          <Shield size={28} style={{ color: "var(--accent)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>TokenProbe</h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
            Security auditing tool for JWT tokens.
          </p>
        </div>

        <p className="section-label" style={{ marginBottom: "0.75rem", textAlign: "center" }}>What it checks</p>
        <div className="features-grid">
          {whatItChecks.map((f) => {
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

        <div style={{ marginTop: "2.5rem" }}>
          <p className="section-label" style={{ marginBottom: "0.75rem", textAlign: "center" }}>Highlights</p>
          <div className="features-grid">
            {highlights.map((f) => {
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
        </div>

        <div className="flex justify-center" style={{ marginTop: "2rem" }}>
          <a href="https://github.com/sumitjhaa/tokenprobe" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <ExternalLink size={16} />
              GitHub
            </Button>
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
}

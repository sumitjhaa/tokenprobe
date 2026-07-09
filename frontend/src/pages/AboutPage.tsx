import { Shield, ExternalLink, BookOpen, ShieldCheck, FileSearch, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBoundary } from "../utils/errors";

const features = [
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

        <div className="demo-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="demo-card">
                <Icon size={16} style={{ color: "var(--accent)" }} />
                <div>
                  <div className="demo-card-label">{f.label}</div>
                  <div className="demo-card-desc">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center" style={{ marginTop: "1.5rem" }}>
          <a href="https://github.com/sumitjhaa/tokenprobe" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <ExternalLink size={16} />
              GitHub
            </Button>
          </a>
        </div>

        <div className="flex gap-2 justify-center flex-wrap" style={{ marginTop: "2.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1"><Zap size={12} /> 8 static checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> 4 JWE checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Actionable reports</span>
        </div>
      </div>
    </ErrorBoundary>
  );
}

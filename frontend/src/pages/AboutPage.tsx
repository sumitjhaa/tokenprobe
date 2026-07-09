import { Shield, ExternalLink, BookOpen, ShieldCheck, Zap, Server, FileSearch } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBoundary } from "../utils/errors";

const features = [
  { icon: FileSearch, label: "8 Static Checks", desc: "alg none, missing claims, PII exposure, algorithm confusion" },
  { icon: ShieldCheck, label: "4 JWE Checks", desc: "Weak encryption, missing protected header fields" },
  { icon: BookOpen, label: "Actionable Reports", desc: "Every finding includes remediation guidance" },
];

const techStack = [
  ["Python", "Core engine + CLI"],
  ["FastAPI", "REST API backend"],
  ["React", "Frontend UI"],
  ["Bun", "JS runtime + build"],
  ["Vite", "Build tool"],
];

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "0 auto" }}>
        <div className="text-center" style={{ marginBottom: "2rem" }}>
          <div style={{
            width: "2.5rem", height: "2.5rem", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 0.75rem"
          }}>
            <Shield size={22} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>About TokenProbe</h1>
          <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            A production-grade security auditing tool for JWT tokens.
          </p>
        </div>

        <div style={{ padding: "1.25rem", background: "var(--bg)", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Why TokenProbe?</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            JWTs are the default auth mechanism for modern APIs, but they're commonly misconfigured
            in ways that are silently exploitable. TokenProbe catches these issues in seconds
            with zero setup &mdash; no network calls or configuration.
          </p>
        </div>

        <div className="demo-grid">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="demo-card">
                <Icon size={14} style={{ color: "var(--accent)" }} />
                <div>
                  <div className="demo-card-label">{f.label}</div>
                  <div className="demo-card-desc">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "1.25rem", background: "var(--bg)", marginTop: "1.5rem" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.875rem" }}>Tech Stack</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
            {techStack.map(([tech, use]) => (
              <div key={tech} style={{ padding: "0.625rem 0.75rem", background: "var(--bg-alt)" }}>
                <div style={{ fontWeight: 500, fontSize: "0.8125rem" }}>{tech}</div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.0625rem" }}>{use}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center" style={{ marginTop: "1.5rem" }}>
          <a href="https://github.com/sumitjhaa/tokenprobe" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <ExternalLink size={16} />
              View on GitHub
            </Button>
          </a>
        </div>

        <div className="flex gap-2 justify-center flex-wrap" style={{ marginTop: "2.5rem", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1"><Zap size={12} /> 8 static checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> 4 JWE checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Actionable reports</span>
        </div>
      </div>
    </ErrorBoundary>
  );
}

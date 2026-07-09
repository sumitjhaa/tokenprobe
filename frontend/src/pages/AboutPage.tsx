import { Shield, ExternalLink, BookOpen, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBoundary } from "../utils/errors";

const features = [
  { icon: Shield, label: "8 Static Checks", desc: "alg none, missing claims, PII exposure, algorithm confusion" },
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
            width: "3rem", height: "3rem", borderRadius: "0.75rem",
            background: "var(--accent-soft)", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 0.75rem"
          }}>
            <Shield size={24} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>About TokenProbe</h1>
          <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            A production-grade security auditing tool for JWT tokens.
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem", background: "var(--bg)", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Why TokenProbe?</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            JWTs are the default auth mechanism for modern APIs, but they're commonly misconfigured
            in ways that are silently exploitable. TokenProbe catches these issues in seconds
            with zero setup &mdash; no network calls or configuration.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap" style={{ justifyContent: "center" }}>
          {features.map((f) => (
            <div key={f.label} className="card card-hover" style={{ padding: "1.25rem", textAlign: "center", background: "var(--bg)", flex: "1 1 200px", maxWidth: "280px" }}>
              <f.icon size={22} style={{ margin: "0 auto 0.5rem", color: "var(--accent)" }} />
              <h3 style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.label}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "1.25rem", background: "var(--bg)", marginTop: "1.5rem" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Tech Stack</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
            {techStack.map(([tech, use]) => (
              <div key={tech} className="card" style={{ padding: "0.75rem", background: "var(--bg-alt)" }}>
                <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{tech}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{use}</div>
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

        <div className="flex gap-2 justify-center flex-wrap" style={{ marginTop: "3rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1"><Zap size={12} /> 8 static checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> 4 JWE checks</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Instant results</span>
        </div>
      </div>
    </ErrorBoundary>
  );
}

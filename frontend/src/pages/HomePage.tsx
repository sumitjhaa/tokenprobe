import { Shield, Zap, FileSearch, Lock, Server, AlertTriangle, CheckCircle, Code, ExternalLink, BookOpen, ShieldCheck, ChevronRight } from "lucide-react";
import TokenInput from "../components/TokenInput";
import ResultsPanel from "../components/ResultsPanel";
import { useAnalysis } from "../hooks/useAnalysis";
import { ErrorBoundary } from "../utils/errors";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";

const features = [
  { icon: FileSearch, label: "8 static checks", desc: "Header & payload analysis" },
  { icon: Lock, label: "4 JWE checks", desc: "Encrypted token validation" },
  { icon: Server, label: "Key confusion", desc: "Algorithm confusion detection" },
  { icon: AlertTriangle, label: "PII detection", desc: "Sensitive data in payload" },
  { icon: CheckCircle, label: "Best practices", desc: "Missing claims audit" },
  { icon: Code, label: "File support", desc: "Drag, paste, or upload" },
];

const techStack = [
  ["Python", "Core engine + CLI"],
  ["FastAPI", "REST API backend"],
  ["React", "Frontend UI"],
  ["Bun", "JS runtime + build"],
  ["Vite", "Build tool"],
];

const featureHighlights = [
  { icon: FileSearch, label: "8 Static Checks", desc: "alg none, missing claims, PII exposure, algorithm confusion" },
  { icon: ShieldCheck, label: "4 JWE Checks", desc: "Weak encryption, missing protected header fields" },
  { icon: BookOpen, label: "Actionable Reports", desc: "Every finding includes remediation guidance" },
];

export default function HomePage() {
  const { result, loading, error, analyze } = useAnalysis();

  return (
    <ErrorBoundary>
      <div className="scroll-rail">
        <div className="scroll-track">

          {/* ─── Section 1: Hero + Analyzer ─── */}
          <section className="scroll-section">
            <div className="section-inner" style={{ maxWidth: "52rem" }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div style={{ padding: "0.75rem", background: "var(--accent-soft)", display: "flex" }}>
                  <Shield size={36} style={{ color: "var(--accent)" }} />
                </div>
              </div>
              <h1 className="section-hero-title">TokenProbe</h1>
              <p className="section-hero-sub">
                Analyze JWT and JWE tokens for security misconfigurations.
              </p>

              <div style={{ marginTop: "2rem" }}>
                <TokenInput onAnalyze={analyze} loading={loading} />
              </div>

              {loading && (
                <div className="flex justify-center mt-6">
                  <Spinner />
                </div>
              )}

              {error && (
                <div style={{ maxWidth: "48rem", margin: "1.25rem auto 0" }}>
                  <div style={{ padding: "1rem", background: "var(--danger-soft)", color: "var(--danger)", fontSize: "0.9375rem" }}>
                    {error}
                  </div>
                </div>
              )}

              {result && <ResultsPanel result={result} />}

              <div className="scroll-hint">
                <span>Scroll</span>
                <ChevronRight size={16} strokeWidth={2.5} />
              </div>
            </div>
          </section>

          {/* ─── Section 2: What it checks ─── */}
          <section className="scroll-section">
            <div className="section-inner" style={{ maxWidth: "44rem" }}>
              <div className="mb-6 text-center">
                <p className="section-label">What it checks</p>
                <h2 className="section-title">Every token vulnerability, detected</h2>
              </div>

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

              <div className="scroll-hint">
                <span>Scroll</span>
                <ChevronRight size={16} strokeWidth={2.5} />
              </div>
            </div>
          </section>

          {/* ─── Section 3: About + Tech Stack ─── */}
          <section className="scroll-section">
            <div className="section-inner" style={{ maxWidth: "44rem" }}>
              <div className="mb-6 text-center">
                <p className="section-label">About</p>
                <h2 className="section-title">Why TokenProbe?</h2>
              </div>

              <p className="about-text">
                JWTs are the default auth mechanism for modern APIs, but they're commonly misconfigured
                in ways that are silently exploitable. TokenProbe catches these issues in seconds
                with zero setup — no network calls or configuration.
              </p>

              <div className="highlights-grid">
                {featureHighlights.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="highlight-card">
                      <Icon size={20} style={{ color: "var(--accent)" }} />
                      <div>
                        <div className="highlight-label">{f.label}</div>
                        <div className="highlight-desc">{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="tech-section">
                <p className="section-label" style={{ marginBottom: "0.75rem" }}>Tech Stack</p>
                <div className="tech-grid">
                  {techStack.map(([tech, use]) => (
                    <div key={tech} className="tech-item">
                      <div className="tech-name">{tech}</div>
                      <div className="tech-use">{use}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <a href="https://github.com/sumitjhaa/tokenprobe" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    <ExternalLink size={18} />
                    View on GitHub
                  </Button>
                </a>
              </div>

              <footer className="footer">
                <div className="footer-links">
                  <span>TokenProbe v1.0.0</span>
                  <span className="footer-dot">&#x2022;</span>
                  <span>No tokens stored or transmitted</span>
                  <span className="footer-dot">&#x2022;</span>
                  <span>MIT License</span>
                </div>
              </footer>
            </div>
          </section>

        </div>
      </div>
    </ErrorBoundary>
  );
}

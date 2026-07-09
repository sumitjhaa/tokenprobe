import { Button } from "../components/ui/Button";
import { ErrorBoundary } from "../utils/errors";
import NfIcon from "../components/NfIcon";

const whatItChecks = [
  { icon: "unlock", label: "alg: none detection", desc: "Flags unsigned tokens that bypass authentication" },
  { icon: "key", label: "Algorithm confusion", desc: "Detects RS256→HS256 key confusion attacks" },
  { icon: "clock", label: "Expiration validation", desc: "Checks exp, iat, and excessive validity windows" },
  { icon: "braces", label: "Claims audit", desc: "Validates sub, iss, aud presence and values" },
  { icon: "eye", label: "PII exposure scan", desc: "Detects emails, phones, and secrets in payloads" },
  { icon: "lock", label: "JWE structure checks", desc: "Validates encrypted token algorithms and headers" },
  { icon: "hash", label: "Weak HMAC brute-force", desc: "Tests signatures against a common-secrets wordlist" },
  { icon: "search", label: "Structural integrity", desc: "Validates encoding, formatting, and completeness" },
];

const stats = [
  { value: "14+", label: "Detection checks" },
  { value: "24", label: "Sample tokens" },
  { value: "Zero", label: "Network calls" },
  { value: "<100ms", label: "Analysis time" },
  { value: "3", label: "Output formats" },
  { value: "1MB", label: "Token size limit" },
];

const techStack = [
  { icon: "/tech/python.svg", name: "Python", desc: "Core detection engine & CLI" },
  { icon: "/tech/fastapi.svg", name: "FastAPI", desc: "Backend API server" },
  { icon: "/tech/typescript.svg", name: "TypeScript", desc: "Type-safe frontend & backend" },
  { icon: "/tech/react.svg", name: "React", desc: "Interactive web interface" },
  { icon: "/tech/bun.svg", name: "Bun", desc: "JavaScript runtime & bundler" },
  { icon: "/tech/docker.svg", name: "Docker", desc: "Containerized deployment" },
  { icon: "/tech/githubactions.svg", name: "GitHub Actions", desc: "CI/CD automation" },
  { icon: "/tech/pytest.svg", name: "Pytest", desc: "Testing framework" },
  { icon: "/tech/github.svg", name: "GitHub", desc: "Open source repository" },
];

const timeline = [
  { year: "v1.0", title: "Initial Release", desc: "Static token analysis, 8 detection checks, CLI & web interface" },
  { year: "v1.1", title: "JWE Support", desc: "Encrypted token validation, 4 JWE-specific checks" },
  { year: "v1.2", title: "Batch Analysis", desc: "Multi-token file processing, aggregated reporting" },
  { year: "v1.3", title: "Custom Rules", desc: "TOML configuration, severity overrides, custom claim validation" },
  { year: "v1.4", title: "Active Checks", desc: "Algorithm confusion probe, weak-secret brute-force" },
];

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "56rem", margin: "0 auto", padding: "0 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem", padding: "2rem 1rem", background: "var(--bg)" }}>
          <div style={{ fontSize: "2.5rem", width: "1em", height: "1em", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", margin: "0 auto 1rem" }}>
            <NfIcon name="shield" size="1.5rem" />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>TokenProbe</h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "32rem", margin: "0 auto", lineHeight: 1.6 }}>
            A security auditing tool that analyzes JWT and JWE tokens for misconfigurations,
            vulnerabilities, and compliance issues — entirely offline, no data leaves your machine.
          </p>
          <div className="flex justify-center gap-2" style={{ marginTop: "1rem" }}>
            <a href="https://github.com/sumitjhaa/tokenprobe" target="_blank" rel="noopener noreferrer">
              <Button variant="primary">
                <NfIcon name="github" size="1.25em" />
                GitHub
              </Button>
            </a>
          </div>
        </div>

        <div style={{ marginBottom: "4rem" }}>
          <p className="section-label" style={{ marginBottom: "1rem", textAlign: "center" }}>Technology Stack</p>
          <div className="features-grid" style={{ gap: "1rem" }}>
            {techStack.map((t) => (
              <div key={t.name} className="feature-card">
                <img src={t.icon} alt="" style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0, objectFit: "contain" }} />
                <div>
                  <div className="feature-card-label">{t.name}</div>
                  <div className="feature-card-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="section-label" style={{ marginBottom: "1rem", textAlign: "center" }}>Detection Capabilities</p>
        <div className="features-grid" style={{ marginBottom: "4rem", gap: "1rem" }}>
          {whatItChecks.map((f) => (
            <div key={f.label} className="feature-card">
              <div style={{ fontSize: "1.75rem", width: "1em", height: "1em", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                <NfIcon name={f.icon} />
              </div>
              <div>
                <div className="feature-card-label">{f.label}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-row" style={{ marginBottom: "4rem" }}>
          {stats.slice(0, 3).map((s) => (
            <div key={s.value} className="stat-item">
              <span className="stat-number">{s.value}</span>
              <span className="stat-desc">{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "4rem" }}>
          <p className="section-label" style={{ marginBottom: "1rem", textAlign: "center" }}>Why TokenProbe</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[
              { icon: "zap", title: "Lightning Fast", desc: "Most tokens analyzed in under 100ms. No network calls, no waiting." },
              { icon: "lock", title: "Privacy First", desc: "All analysis runs locally. No tokens sent to servers or third parties." },
              { icon: "layers", title: "CI/CD Ready", desc: "JSON output, exit codes, and GitHub Action for automated pipelines." },
              { icon: "layers", title: "Deep Coverage", desc: "14+ checks across header, payload, signature, and JWE structure." },
              { icon: "wrench", title: "Customizable", desc: "TOML config for custom rules, severity overrides, and disabled checks." },
              { icon: "sparkles", title: "Actionable Reports", desc: "Every finding includes severity ranking and remediation guidance." },
            ].map((item) => (
              <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)", textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", width: "1em", height: "1em", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", margin: "0 auto 0.5rem" }}>
                  <NfIcon name={item.icon} />
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.8125rem", marginBottom: "0.25rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-row" style={{ marginBottom: "4rem" }}>
          {stats.slice(3).map((s) => (
            <div key={s.value} className="stat-item">
              <span className="stat-number">{s.value}</span>
              <span className="stat-desc">{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "4rem" }}>
          <p className="section-label" style={{ marginBottom: "1rem", textAlign: "center" }}>Release History</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {timeline.map((t) => (
              <div key={t.year} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", background: "var(--bg)" }}>
                <div style={{ width: "5rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", fontFamily: "monospace" }}>{t.year}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "1.5rem", background: "var(--bg)" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
            TokenProbe is open source and released under the MIT License.
            Contributions, issues, and feature requests are welcome.
          </p>
          <a href="https://github.com/sumitjhaa/tokenprobe" target="_blank" rel="noopener noreferrer">
            <Button variant="primary">
              <NfIcon name="github" size="1.25em" />
              View on GitHub
              <NfIcon name="external" size="0.875em" />
            </Button>
          </a>
        </div>

      </div>
    </ErrorBoundary>
  );
}

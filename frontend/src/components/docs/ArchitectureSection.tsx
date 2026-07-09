import SectionHeader from "./SectionHeader";
import DocsCard from "./DocsCard";
import CodeBlock from "./CodeBlock";

export default function ArchitectureSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="architecture" icon="layers" label="Architecture" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          TokenProbe follows a three-tier architecture: a Python core library, a FastAPI backend, and a React-based web frontend.
          All three layers share the same detection engine, ensuring consistent results across CLI, API, and web interfaces.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
          <DocsCard icon="terminal" title="Core Library" desc="Python package (tokenprobe) containing the JWT/JWE decoder, 14+ detection checks, batch processor, config engine, and wordlist. Framework-agnostic." />
          <DocsCard icon="server" title="Backend API" desc="FastAPI application exposing REST endpoints for analysis, batch processing, and configuration. Handles CORS and multipart uploads." />
          <DocsCard icon="globe" title="Frontend SPA" desc="React 19 + TypeScript SPA built with Vite. 5 pages, 17 themes, drag-drop, clipboard integration, hash-based routing." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          <DocsCard icon="folder" title="Project Structure">
            <CodeBlock>{`tokenprobe/          # Core Python library
├── core/
│   ├── checks/      # Static, active, JWE checks
│   ├── decoder.py   # JWT/JWE decoder
│   ├── config.py    # TOML config engine
│   ├── findings.py  # Finding & Report models
│   └── wordlist.py  # 500+ weak secrets
├── cli.py           # Click CLI
└── tests/

backend/             # FastAPI application
├── main.py          # App entry, CORS, routes
├── services.py      # Business logic
└── routers/         # API route handlers

frontend/            # React SPA
├── src/
│   ├── pages/       # 5 page components
│   ├── components/  # UI components
│   ├── hooks/       # React hooks
│   ├── styles/      # CSS (themes, base, components)
│   └── api/         # HTTP client
└── public/fonts/    # Self-hosted fonts`}</CodeBlock>
          </DocsCard>
          <DocsCard icon="cog" title="Tech Stack">
            <CodeBlock>{`Backend:
  Python 3.14 · FastAPI · PyJWT
  cryptography · uvicorn

Frontend:
  React 19 · TypeScript 6 · Vite 8
  lucide-react · Bun

CLI:
  Click · Rich · PyJWT

Infrastructure:
  Docker · docker-compose · nginx
  GitHub Actions · Vercel`}</CodeBlock>
          </DocsCard>
        </div>
      </div>
    </section>
  );
}

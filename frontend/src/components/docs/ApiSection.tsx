import SectionHeader from "./SectionHeader";
import DocsCard from "./DocsCard";

const endpoints = [
  ["GET", "/health", "Health check — returns status and version"],
  ["POST", "/api/analyze", "Analyze a single JWT/JWE token"],
  ["POST", "/api/analyze/jwe", "Force JWE-specific token analysis"],
  ["POST", "/api/analyze/batch", "Batch analyze tokens from file upload"],
  ["GET", "/api/config/schema", "Get configuration schema definition"],
  ["POST", "/api/config/validate", "Validate TOML configuration content"],
];

export default function ApiSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="api" icon="server" label="API Reference" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          The TokenProbe backend exposes a REST API over HTTP. All analysis happens server-side using the same core engine as the CLI.
        </p>
        <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-alt)" }}>
                {["Method", "Endpoint", "Description"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {endpoints.map(([method, path, desc]) => (
                <tr key={path} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      fontWeight: 700, fontSize: "0.6875rem", padding: "0.125rem 0.375rem",
                      color: method === "GET" ? "var(--success)" : "var(--accent)",
                      background: method === "GET" ? "var(--success-soft)" : "var(--accent-soft)",
                    }}>{method}</span>
                  </td>
                  <td style={{ padding: "0.75rem", fontFamily: '"CaskaydiaMono NFM", monospace', fontSize: "0.75rem" }}>{path}</td>
                  <td style={{ padding: "0.75rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DocsCard icon="database" title="Request Limits">
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Max token length: 100,000 characters · Max config length: 50,000 characters · Max upload size: 10 MB
          </div>
        </DocsCard>
      </div>
    </section>
  );
}

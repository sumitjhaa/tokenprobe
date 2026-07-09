import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const pages = [
  { icon: "home", title: "Home", desc: "The main analysis page. Paste, upload, or drag-drop a JWT/JWE token, then click Analyze to run all detection checks. Results display with color-coded severity levels and expandable remediation cards." },
  { icon: "folder", title: "Batch", desc: "Upload a .txt or .json file containing multiple tokens. Results show a summary grid with counts, severity distribution, and per-token pass/fail indicators." },
  { icon: "cog", title: "Config", desc: "TOML configuration editor with real-time validation. Supports claim requirements, check disabling, severity overrides, and custom regex-based rules." },
  { icon: "book", title: "Docs", desc: "Comprehensive documentation covering JWT fundamentals, vulnerability patterns, CLI usage, API reference, best practices, and more." },
  { icon: "info", title: "About", desc: "Project information including detection capabilities, technology stack, stats, and release history." },
];

export default function WebSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="web" icon="globe" label="Web Interface" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          The TokenProbe web interface is a single-page application built with React and TypeScript. It provides five main pages
          accessible from the navigation bar. All token analysis is performed by the backend API.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "1.25rem" }}>
          {pages.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name={item.icon} size={20} style={{ color: "var(--accent)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

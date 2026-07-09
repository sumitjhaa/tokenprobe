import SectionHeader from "./SectionHeader";
import DocsCard from "./DocsCard";

export default function ThemesSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="themes" icon="paint" label="Theme System" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          TokenProbe features 17 built-in theme variants across two families. Themes are persisted in localStorage
          and can be switched from the palette button in the navbar.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <DocsCard icon="sun" title="Catppuccin" subtitle="8 variants" desc="Latte (light), Frappé, Macchiato, Mocha — each available in standard and Mauve accent variants. Warm, pastel-inspired palette." />
          <DocsCard icon="moon" title="Cyberpunk" subtitle="9 variants" desc="Neon, Dusk, Frost, Amber, Synthwave, Blood, Hack, Neon-light, Grid — vibrant, high-contrast palettes for dark mode enthusiasts." />
        </div>
        <DocsCard icon="cog" title="How themes work">
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Themes are defined as CSS custom properties in <code>themes.css</code>. Each variant sets ~20 variables including background layers, text colors, accent colors, and semantic colors. The <code>data-theme</code> and <code>data-variant</code> attributes on <code>&lt;html&gt;</code> control which palette is active.
          </div>
        </DocsCard>
      </div>
    </section>
  );
}

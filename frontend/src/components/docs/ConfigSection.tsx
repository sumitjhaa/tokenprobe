import SectionHeader from "./SectionHeader";
import CodeBlock from "./CodeBlock";

const items = [
  { title: "[claims]", desc: "required — List of claim names that must be present in every token. If a required claim is missing, it's flagged as High severity.", code: 'required = ["sub", "exp", "iat", "iss", "aud"]' },
  { title: "[checks]", desc: "disable — List of check names to skip. Useful when you're aware of a specific issue but want to reduce noise.", code: 'disable = ["pii_detection", "jwt_in_url"]' },
  { title: "[severity_overrides]", desc: "Raise or lower the severity of specific checks. Values: low, medium, high, critical.", code: 'missing_exp = "critical"\nmissing_aud = "high"' },
  { title: "[[custom_rules]]", desc: "Define custom claim validation rules. Each rule specifies a claim, regex pattern, severity, and message.", code: '[[custom_rules]]\nname = "valid_role"\nclaim = "role"\npattern = "^(admin|user|moderator)$"\nseverity = "high"\nmessage = "Role must be admin, user, or moderator"' },
];

export default function ConfigSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="config" icon="sliders" label="Configuration" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          TokenProbe supports a TOML-based configuration file that lets you customize validation behavior,
          override severity levels, and define custom claim validation rules. Use the Config page in the web
          interface to edit and validate configurations interactively.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          {items.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <span style={{ fontWeight: 600, fontSize: "0.8125rem", fontFamily: '"CaskaydiaMono NFM", monospace' }}>{item.title}</span>
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <div style={{ marginBottom: "0.5rem", lineHeight: 1.6 }}>{item.desc}</div>
                <CodeBlock>{item.code}</CodeBlock>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

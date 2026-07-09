import { useState } from "react";
import { validateConfig } from "../api/client";
import { useApi } from "../hooks/useApi";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBoundary } from "../utils/errors";
import NfIcon from "../components/NfIcon";

const SAMPLE_CONFIG = `[claims]
required = ["sub", "exp", "iat", "iss", "aud"]

[checks]
disable = []

[severity_overrides]
missing_exp = "critical"
missing_aud = "high"

[[custom_rules]]
name = "valid_role"
claim = "role"
pattern = "^(admin|user|moderator)$"
severity = "high"
message = "Role must be admin, user, or moderator"`;

const SCHEMA_SECTIONS = [
  {
    title: "[claims]",
    fields: [
      { key: "required", type: "string[]", desc: "Claims that must be present" },
    ],
  },
  {
    title: "[checks]",
    fields: [
      { key: "disable", type: "string[]", desc: "Checks to skip by name" },
    ],
  },
  {
    title: "[severity_overrides]",
    fields: [
      { key: "<check_name>", type: "string", desc: "Override severity: low, medium, high, critical" },
    ],
  },
  {
    title: "[[custom_rules]]",
    fields: [
      { key: "name", type: "string", desc: "Unique rule identifier" },
      { key: "claim", type: "string", desc: "Claim to validate" },
      { key: "pattern", type: "string", desc: "Regex pattern to match" },
      { key: "severity", type: "string", desc: "Severity if pattern fails" },
      { key: "message", type: "string", desc: "Error message" },
    ],
  },
];

export default function ConfigPage() {
  const [config, setConfig] = useState(SAMPLE_CONFIG);
  const { data: validation, execute: runValidate, loading, reset } = useApi<{ valid: boolean; error: string | null }>();

  return (
    <ErrorBoundary>
      <div className="animate-fade-in">
        <div className="flex items-center gap-2" style={{ marginBottom: "1.5rem" }}>
          <NfIcon name="cog" size="1.75rem" style={{ color: "var(--accent)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Configuration</h1>
        </div>

        <div style={{ width: "min(72rem, 100%)", padding: "0 1rem", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "20rem" }}>
              <textarea
                value={config}
                onChange={(e) => { setConfig(e.target.value); reset(); }}
                className="input"
                style={{ minHeight: "32rem", fontFamily: "monospace" }}
                spellCheck={false}
              />

              <div className="flex gap-2" style={{ marginTop: "0.75rem" }}>
                <Button onClick={() => runValidate(() => validateConfig(config))} loading={loading}>
                  Validate
                </Button>
                <Button variant="secondary" onClick={() => setConfig(SAMPLE_CONFIG)}>
                  Reset
                </Button>
              </div>

              {loading && <div className="flex items-center gap-2" style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.75rem" }}><Spinner size="sm" /> Validating...</div>}

              {validation && (
                <div style={{
                  marginTop: "0.75rem", padding: "1rem",
                  background: validation.valid ? "var(--success-soft)" : "var(--danger-soft)",
                  color: validation.valid ? "var(--success)" : "var(--danger)",
                  fontSize: "0.9375rem"
                }}>
                  <div className="flex items-center gap-2">
                    {validation.valid ? <NfIcon name="checkCircle" size="1.125em" /> : <NfIcon name="alert" size="1.125em" />}
                    <div>
                      <div style={{ fontWeight: 600 }}>{validation.valid ? "Valid" : "Invalid"}</div>
                      {validation.error && <div style={{ marginTop: "0.25rem" }}>{validation.error}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: "16rem", flexShrink: 0 }}>
              <div style={{ padding: "1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "0.75rem" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: "0.75rem" }}>
                  <NfIcon name="book" size="1em" style={{ color: "var(--accent)" }} />
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Schema</span>
                </div>
                {SCHEMA_SECTIONS.map((section) => (
                  <div key={section.title} style={{ marginBottom: "0.75rem" }}>
                    <code style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)" }}>{section.title}</code>
                    <div style={{ marginTop: "0.25rem" }}>
                      {section.fields.map((field) => (
                        <div key={field.key} style={{ fontSize: "0.75rem", marginBottom: "0.375rem", color: "var(--text-secondary)" }}>
                          <code style={{ color: "var(--text)" }}>{field.key}</code>
                          <span style={{ color: "var(--text-muted)" }}> ({field.type})</span>
                          <div style={{ marginLeft: "0.5rem", lineHeight: 1.3 }}>{field.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

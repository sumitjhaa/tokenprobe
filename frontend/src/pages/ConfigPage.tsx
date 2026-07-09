import { useState } from "react";
import { Settings, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { getConfigSchema, validateConfig } from "../api/client";
import { useApi } from "../hooks/useApi";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBoundary } from "../utils/errors";

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

const SCHEMA_FIELDS = [
  { key: "[claims]", desc: "required: Array of required claim keys", code: true },
  { key: "[checks]", desc: "disable: Array of check names to skip", code: true },
  { key: "[severity_overrides]", desc: 'Override severity per check (e.g. missing_exp = "critical")', code: false },
  { key: "[[custom_rules]]", desc: "Rules with: name, claim, pattern, severity, message", code: true },
];

export default function ConfigPage() {
  const [config, setConfig] = useState(SAMPLE_CONFIG);
  const [showSchema, setShowSchema] = useState(false);
  const { data: schema, execute: fetchSchema, loading: schemaLoading } = useApi<Record<string, unknown>>();
  const { data: validation, execute: runValidate, loading: validating, reset: resetValidation } = useApi<{ valid: boolean; error: string | null }>();

  const handleValidate = () => runValidate(() => validateConfig(config));
  const handleShowSchema = () => {
    if (!schema && !schemaLoading) fetchSchema(() => getConfigSchema().then((s) => s as unknown as Record<string, unknown>));
    setShowSchema((v) => !v);
  };

  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "64rem", margin: "0 auto" }}>
        <div className="text-center" style={{ marginBottom: "1.5rem" }}>
          <Settings size={28} style={{ margin: "0 auto 0.75rem", color: "var(--accent)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Configuration</h1>
          <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Customize claim requirements, severity levels, and validation rules.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              TOML Configuration
            </label>
            <textarea
              value={config}
              onChange={(e) => { setConfig(e.target.value); resetValidation(); }}
              className="input"
              style={{ minHeight: "20rem", fontFamily: "monospace" }}
              spellCheck={false}
            />
            <div className="flex gap-3">
              <Button onClick={handleValidate} loading={validating}>
                Validate Config
              </Button>
              <Button variant="secondary" onClick={() => setConfig(SAMPLE_CONFIG)}>
                Reset Sample
              </Button>
              <Button variant="ghost" onClick={handleShowSchema}>
                {showSchema ? <EyeOff size={16} /> : <Eye size={16} />}
                {showSchema ? "Hide Schema" : "Schema"}
              </Button>
            </div>

            {validating && (
              <div className="flex items-center gap-2" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <Spinner size="sm" /> Validating...
              </div>
            )}

            {validation && (
              <div className="card" style={{
                padding: "1rem",
                background: validation.valid ? "var(--success-soft)" : "var(--danger-soft)",
                outline: validation.valid ? "1px solid var(--success)" : "1px solid var(--danger)"
              }}>
                <div className="flex items-start gap-3">
                  {validation.valid
                    ? <CheckCircle size={18} style={{ color: "var(--success)", flexShrink: 0, marginTop: "0.125rem" }} />
                    : <AlertCircle size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "0.125rem" }} />
                  }
                  <div>
                    <p style={{ fontWeight: 600, color: validation.valid ? "var(--success)" : "var(--danger)" }}>
                      {validation.valid ? "Valid configuration" : "Invalid configuration"}
                    </p>
                    {validation.error && (
                      <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--danger)" }}>{validation.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {showSchema && (
            <div className="card animate-slide-down" style={{ padding: "1rem", background: "var(--bg)" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Schema Reference</h3>
              {schemaLoading && <Spinner size="sm" />}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {SCHEMA_FIELDS.map((field) => (
                  <div key={field.key}>
                    <code style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "0.75rem" }}>{field.key}</code>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{field.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

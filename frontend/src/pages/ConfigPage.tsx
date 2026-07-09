import { useState } from "react";
import { Settings, CheckCircle, AlertCircle } from "lucide-react";
import { validateConfig } from "../api/client";
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

export default function ConfigPage() {
  const [config, setConfig] = useState(SAMPLE_CONFIG);
  const { data: validation, execute: runValidate, loading, reset } = useApi<{ valid: boolean; error: string | null }>();

  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "48rem", margin: "0 auto" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: "1.5rem" }}>
          <Settings size={28} style={{ color: "var(--accent)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Configuration</h1>
        </div>

        <textarea
          value={config}
          onChange={(e) => { setConfig(e.target.value); reset(); }}
          className="input"
          style={{ minHeight: "16rem", fontFamily: "monospace" }}
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
              {validation.valid ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <div>
                <div style={{ fontWeight: 600 }}>{validation.valid ? "Valid" : "Invalid"}</div>
                {validation.error && <div style={{ marginTop: "0.25rem" }}>{validation.error}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

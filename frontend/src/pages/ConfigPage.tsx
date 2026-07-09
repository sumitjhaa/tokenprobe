import { useState } from "react";
import { Settings, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { getConfigSchema, validateConfig } from "../api/client";
import { useApi } from "../hooks/useApi";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorBoundary } from "../utils/errors";
import { Spinner } from "../components/ui/Spinner";

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
  { key: "[severity_overrides]", desc: "Override severity per check (e.g. missing_exp = \"critical\")", code: false },
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
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <Settings size={28} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Customize claim requirements, severity levels, and validation rules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              TOML Configuration
            </label>
            <textarea
              value={config}
              onChange={(e) => { setConfig(e.target.value); resetValidation(); }}
              className="w-full h-80 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
              spellCheck={false}
            />
            <div className="flex gap-3">
              <Button onClick={handleValidate} loading={validating}>
                Validate Config
              </Button>
              <Button variant="secondary" onClick={() => setConfig(SAMPLE_CONFIG)}>
                Reset Sample
              </Button>
            </div>

            {validating && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Validating...
              </div>
            )}

            {validation && (
              <Card
                className={validation.valid
                  ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/60"
                  : "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/60"
                }
                padding="md"
              >
                <div className="flex items-start gap-3">
                  {validation.valid
                    ? <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
                    : <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  }
                  <div>
                    <p className={validation.valid ? "text-green-700 dark:text-green-300 font-medium" : "text-red-700 dark:text-red-300 font-medium"}>
                      {validation.valid ? "Valid configuration" : "Invalid configuration"}
                    </p>
                    {validation.error && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validation.error}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Button variant="secondary" onClick={handleShowSchema} className="w-full">
              {showSchema ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSchema ? "Hide Schema" : "Show Schema"}
            </Button>

            {schemaLoading && <Spinner className="mx-auto" size="sm" />}

            {showSchema && (
              <Card padding="md" className="bg-gray-50 dark:bg-gray-900/50 text-sm animate-slide-down">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Schema Reference</h3>
                <div className="space-y-3">
                  {SCHEMA_FIELDS.map((field) => (
                    <div key={field.key}>
                      <code className="text-blue-600 dark:text-blue-400 font-mono text-xs">{field.key}</code>
                      <p className="text-xs text-gray-500 mt-0.5">{field.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

import { useState } from "react";
import { Settings, CheckCircle, AlertCircle } from "lucide-react";
import { getConfigSchema, validateConfig } from "../api/client";

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
  const [validation, setValidation] = useState<{ valid: boolean; error: string | null } | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [showSchema, setShowSchema] = useState(false);

  const handleValidate = async () => {
    try {
      const result = await validateConfig(config);
      setValidation(result);
    } catch (e) {
      setValidation({ valid: false, error: e instanceof Error ? e.message : "Validation failed" });
    }
  };

  const handleShowSchema = async () => {
    if (!schema) {
      try {
        const data = await getConfigSchema();
        setSchema(data as unknown as Record<string, unknown>);
      } catch {
        // fallback
      }
    }
    setShowSchema(!showSchema);
  };

  return (
    <>
      <div className="text-center mb-10">
        <Settings size={32} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Define custom claim requirements, severity overrides, and validation rules.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            TOML Configuration
          </label>
          <textarea
            value={config}
            onChange={(e) => { setConfig(e.target.value); setValidation(null); }}
            className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleValidate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Validate
            </button>
            <button
              onClick={() => setConfig(SAMPLE_CONFIG)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Reset Sample
            </button>
          </div>

          {validation && (
            <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
              validation.valid
                ? "bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800"
            }`}>
              {validation.valid ? (
                <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className={validation.valid ? "text-green-700 dark:text-green-300 font-medium" : "text-red-700 dark:text-red-300 font-medium"}>
                  {validation.valid ? "Configuration is valid" : "Validation error"}
                </p>
                {validation.error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validation.error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={handleShowSchema}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
          >
            {showSchema ? "Hide Schema" : "Show Schema"}
          </button>

          {showSchema && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Config Schema</h3>
              <div className="space-y-3">
                <div>
                  <code className="text-blue-600 font-mono">[claims]</code>
                  <p className="text-xs text-gray-500 mt-1">
                    <code>required</code>: Array of required claim keys
                  </p>
                </div>
                <div>
                  <code className="text-blue-600 font-mono">[checks]</code>
                  <p className="text-xs text-gray-500 mt-1">
                    <code>disable</code>: Array of check names to skip
                  </p>
                </div>
                <div>
                  <code className="text-blue-600 font-mono">[severity_overrides]</code>
                  <p className="text-xs text-gray-500 mt-1">
                    Override severity per check key
                  </p>
                </div>
                <div>
                  <code className="text-blue-600 font-mono">[[custom_rules]]</code>
                  <p className="text-xs text-gray-500 mt-1">
                    Custom validation rules with: <code>name</code>, <code>claim</code>, <code>pattern</code>, <code>severity</code>, <code>message</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

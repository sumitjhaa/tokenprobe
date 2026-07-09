export interface Finding {
  check: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  message: string;
  remediation: string;
  source: "static" | "active";
  details?: string | null;
}

export interface AnalyzeResult {
  token_valid_structure: boolean;
  token_type: "jwt" | "jwe";
  findings: Finding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  exit_code: number;
  error: string | null;
}

export interface BatchResult {
  index: number;
  token_preview: string;
  findings: Finding[];
  error: string | null;
}

export interface BatchResponse {
  total_tokens: number;
  processed_tokens: number;
  failed: number;
  success_rate: number;
  total_findings: number;
  severity_summary: Record<string, number>;
  results: BatchResult[];
}

export interface ConfigSchema {
  claims: Record<string, unknown>;
  checks: Record<string, unknown>;
  severity_overrides: Record<string, unknown>;
  custom_rules: Record<string, unknown>;
}

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

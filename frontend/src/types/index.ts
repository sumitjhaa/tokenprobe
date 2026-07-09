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

export const SEVERITY_COLORS: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-500" },
  high: { bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500" },
  medium: { bg: "bg-yellow-50 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-500" },
  low: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500" },
  info: { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", border: "border-gray-400" },
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

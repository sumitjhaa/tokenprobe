import type { SeverityLevel as SL } from "../types";

export type SeverityLevel = SL;

export const severityLabel: Record<SeverityLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

export const severityIcon: Record<SeverityLevel, string> = {
  critical: "shield",
  high: "alert",
  medium: "alert",
  low: "info",
  info: "info",
};

export const severityClass: Record<SeverityLevel, string> = {
  critical: "finding-critical badge-critical",
  high: "finding-high badge-high",
  medium: "finding-medium badge-medium",
  low: "finding-low badge-low",
  info: "finding-info badge-info",
};

export const severityOrder: SeverityLevel[] = ["critical", "high", "medium", "low", "info"];

import { AlertTriangle, AlertCircle, Info, ShieldAlert, Shield } from "lucide-react";
import type { SeverityLevel as SL } from "../types";

export type SeverityLevel = SL;

export const severityLabel: Record<SeverityLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

export const severityIcon: Record<SeverityLevel, typeof Shield> = {
  critical: ShieldAlert,
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
  info: Info,
};

export const severityClass: Record<SeverityLevel, string> = {
  critical: "finding-critical badge-critical",
  high: "finding-high badge-high",
  medium: "finding-medium badge-medium",
  low: "finding-low badge-low",
  info: "finding-info badge-info",
};

export const severityOrder: SeverityLevel[] = ["critical", "high", "medium", "low", "info"];

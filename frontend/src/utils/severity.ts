import { AlertTriangle, AlertCircle, Info, ShieldAlert, Shield } from "lucide-react";
import type { SeverityLevel as SL } from "../types";

export type SeverityLevel = SL;

interface SeverityTheme {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const severityTheme: Record<SeverityLevel, SeverityTheme> = {
  critical: { bg: "bg-red-50 dark:bg-red-950/60", text: "text-red-700 dark:text-red-300", border: "border-red-500", dot: "bg-red-500" },
  high:     { bg: "bg-orange-50 dark:bg-orange-950/60", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500", dot: "bg-orange-500" },
  medium:   { bg: "bg-yellow-50 dark:bg-yellow-950/60", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-500", dot: "bg-yellow-500" },
  low:      { bg: "bg-blue-50 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500", dot: "bg-blue-500" },
  info:     { bg: "bg-gray-50 dark:bg-gray-800/60", text: "text-gray-600 dark:text-gray-400", border: "border-gray-400", dot: "bg-gray-400" },
};

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

export const severityOrder: SeverityLevel[] = ["critical", "high", "medium", "low", "info"];

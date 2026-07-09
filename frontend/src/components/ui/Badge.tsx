import { cn } from "../../utils/cn";
import type { SeverityLevel } from "../../utils/severity";
import { severityTheme, severityLabel, severityIcon } from "../../utils/severity";

interface BadgeProps {
  severity: SeverityLevel;
  count?: number;
  pulse?: boolean;
}

export function Badge({ severity, count, pulse }: BadgeProps) {
  const theme = severityTheme[severity];
  const Icon = severityIcon[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold leading-none",
        theme.bg,
        theme.text,
        theme.border,
        pulse && "animate-pulse",
      )}
    >
      <Icon size={12} />
      {severityLabel[severity]}
      {count !== undefined && <span className="opacity-75">·</span>}
      {count !== undefined && <span>{count}</span>}
    </span>
  );
}

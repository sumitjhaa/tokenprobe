import { cn } from "../../utils/cn";
import type { SeverityLevel } from "../../utils/severity";
import { severityLabel, severityIcon, severityClass } from "../../utils/severity";
import NfIcon from "../NfIcon";

interface BadgeProps {
  severity: SeverityLevel;
  count?: number;
  pulse?: boolean;
}

export function Badge({ severity, count, pulse }: BadgeProps) {
  const icon = severityIcon[severity];
  const cls = severityClass[severity].split(" ").find((c) => c.startsWith("badge-")) || "badge-info";

  return (
    <span className={cn("badge", cls, pulse && "animate-pulse")}>
      <NfIcon name={icon} size="1em" />
      {severityLabel[severity]}
      {count !== undefined && <span>·</span>}
      {count !== undefined && <span>{count}</span>}
    </span>
  );
}

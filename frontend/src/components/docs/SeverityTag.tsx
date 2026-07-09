export default function SeverityTag({ level }: { level: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    Critical: { bg: "var(--danger-soft)", fg: "var(--danger)" },
    High: { bg: "var(--warning-soft)", fg: "var(--warning)" },
    Medium: { bg: "var(--info-soft)", fg: "var(--info)" },
    Low: { bg: "var(--accent-soft)", fg: "var(--accent)" },
    Info: { bg: "var(--bg-alt)", fg: "var(--text-muted)" },
  };
  const s = map[level] || map.Info;
  return (
    <span style={{
      fontSize: "0.625rem", fontWeight: 700, padding: "0.0625rem 0.3125rem",
      background: s.bg, color: s.fg, marginLeft: "0.5rem",
    }}>
      {level}
    </span>
  );
}

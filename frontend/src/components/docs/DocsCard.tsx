import NfIcon from "./NfIcon";

export default function DocsCard({ icon, title, subtitle, desc, children }: {
  icon?: string; title: string; subtitle?: string; desc?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: "1.25rem", background: "var(--bg)", transition: "transform 0.15s ease, box-shadow 0.15s ease",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: desc || children ? "0.5rem" : 0 }}>
        {icon && <NfIcon name={icon} size={20} style={{ color: "var(--accent)" }} />}
        <div>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{title}</span>
          {subtitle && <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>{subtitle}</span>}
        </div>
      </div>
      {desc && <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{desc}</div>}
      {children}
    </div>
  );
}

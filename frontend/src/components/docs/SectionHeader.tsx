import NfIcon from "./NfIcon";

export default function SectionHeader({ id, icon, label }: { id: string; icon: string; label: string }) {
  return (
    <div id={id} style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <NfIcon name={icon} size={24} style={{ color: "var(--accent)" }} />
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{label}</h2>
    </div>
  );
}

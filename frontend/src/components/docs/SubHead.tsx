export default function SubHead({ label }: { label: string }) {
  return (
    <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
      {label}
    </p>
  );
}

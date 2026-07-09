export default function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-alt)", padding: "1rem", lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {children}
    </pre>
  );
}

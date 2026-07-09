export default function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontSize: "0.8125rem", background: "var(--bg-alt)", padding: "0.125rem 0.375rem" }}>
      {children}
    </code>
  );
}

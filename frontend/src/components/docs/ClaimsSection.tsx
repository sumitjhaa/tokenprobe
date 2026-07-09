import SectionHeader from "./SectionHeader";

const claims = [
  { claim: "iss", name: "Issuer", desc: "Identifies the principal that issued the JWT", example: "https://auth.example.com" },
  { claim: "sub", name: "Subject", desc: "Identifies the principal that is the subject of the JWT", example: "user_abc123" },
  { claim: "aud", name: "Audience", desc: "Identifies the recipients that the JWT is intended for", example: "https://api.example.com" },
  { claim: "exp", name: "Expiration Time", desc: "Identifies the expiration time on or after which the JWT must not be accepted", example: "1699086400" },
  { claim: "nbf", name: "Not Before", desc: "Identifies the time before which the JWT must not be accepted", example: "1699000000" },
  { claim: "iat", name: "Issued At", desc: "Identifies the time at which the JWT was issued", example: "1699000000" },
  { claim: "jti", name: "JWT ID", desc: "Unique identifier for the JWT — prevents replay attacks", example: "550e8400-e29b-41d4" },
];

export default function ClaimsSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="claims" icon="tags" label="Registered Claim Names" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          RFC 7519 defines seven registered claim names that provide interoperability between different JWT implementations.
          While none of them are mandatory, following these conventions ensures your tokens work across libraries and services.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-alt)" }}>
                {["Claim", "Name", "Description", "Example"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.claim} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem", fontWeight: 600, fontFamily: '"CaskaydiaMono NFM", monospace', color: "var(--accent)" }}>{c.claim}</td>
                  <td style={{ padding: "0.75rem" }}>{c.name}</td>
                  <td style={{ padding: "0.75rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>{c.desc}</td>
                  <td style={{ padding: "0.75rem", fontFamily: '"CaskaydiaMono NFM", monospace', fontSize: "0.6875rem", color: "var(--text-muted)" }}>{c.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const items = [
  { icon: "lock", title: "Always validate the algorithm", body: "Explicitly whitelist the algorithms you expect. Never derive the verification key from the JWT header alone. Bind each key to a specific algorithm to prevent confusion attacks." },
  { icon: "clock", title: "Use short expiration times", body: "Access tokens should expire within 15-60 minutes. Use refresh tokens with rotation for longer-lived sessions. Short-lived tokens limit the blast radius of leaks." },
  { icon: "braces", title: "Validate audience and issuer", body: "Always check aud matches your service and iss matches your expected issuer. This prevents token reuse across services and injection from unknown issuers." },
  { icon: "eye", title: "Never store secrets in the payload", body: "The payload is Base64URL-encoded, not encrypted. Anyone with access can decode it. Use JWE for confidentiality, or move sensitive data server-side." },
  { icon: "hash", title: "Use strong signing keys", body: "For HMAC, use secrets with at least 256 bits of entropy (32+ random bytes). For RSA, use 2048-bit or larger keys. For ECDSA, use P-256 or higher." },
  { icon: "toggleOn", title: "Implement token revocation", body: "Maintain a blocklist of revoked JTI values for critical scenarios, or use short expiry with refresh token rotation as a practical revocation mechanism." },
  { icon: "cpu", title: "Prefer asymmetric algorithms", body: "For distributed systems, use RS256 or ES256. The signing service holds the private key, and all verifiers hold only the public key — no shared secrets across service boundaries." },
  { icon: "siren", title: "Monitor validation failures", body: "Track malformed tokens, expired tokens, and algorithm mismatches. A spike in failures may indicate an active attack. TokenProbe can be integrated into CI/CD." },
];

export default function BestPracticesSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="best-practices" icon="sparkles" label="Best Practices" />
      <div style={{ paddingLeft: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {items.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name={item.icon} size={20} style={{ color: "var(--accent)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const algorithms = [
  { icon: "hash", color: "var(--warning)", title: "HS256 / HS384 / HS512", subtitle: "HMAC (Symmetric)", desc: "Same secret signs and verifies. Fast and simple, but the secret must be shared between issuer and verifier. Best for single-service architectures. Weak secrets are vulnerable to brute-force attacks." },
  { icon: "key", color: "var(--success)", title: "RS256 / RS384 / RS512", subtitle: "RSA (Asymmetric)", desc: "Private key signs, public key verifies. The gold standard for distributed systems. Multiple verifiers can validate tokens without holding the signing key. Larger signatures but no shared secret to protect." },
  { icon: "cpu", color: "var(--info)", title: "ES256 / ES384 / ES512", subtitle: "ECDSA (Elliptic Curve)", desc: "Asymmetric with smaller keys than RSA for equivalent security. ES256 uses P-256 curve and produces 64-byte signatures. Increasingly popular in modern systems, especially mobile and IoT." },
  { icon: "unlock", color: "var(--danger)", title: "None / NONE / none", subtitle: "Unsafe", desc: "No signature at all. The alg: none feature was designed for cases where integrity is provided by other means (e.g., TLS), but it is widely exploited when servers fail to validate that the algorithm matches expectations. TokenProbe flags this as Critical." },
];

export default function AlgorithmsSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="algorithms" icon="key" label="Signing Algorithms" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          JWTs support a wide range of cryptographic algorithms. Choosing the right algorithm for your use case is critical to security.
          The algorithm is specified in the <code>alg</code> header field and determines how the signature is computed and verified.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          {algorithms.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name={item.icon} size={20} style={{ color: item.color }} />
                <div>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</span>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>{item.subtitle}</span>
                </div>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

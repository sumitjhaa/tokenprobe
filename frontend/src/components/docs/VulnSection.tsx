import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";
import SubHead from "./SubHead";
import CodeBlock from "./CodeBlock";

const vulns = [
  { icon: "unlock", label: "alg: none", desc: "Server accepts unsigned tokens — attacker bypasses auth entirely by modifying the algorithm field to 'none'" },
  { icon: "key", label: "Algorithm confusion", desc: "RS256 public key reused to verify HS256 tokens — attacker signs with public key as HMAC secret" },
  { icon: "hash", label: "Weak HMAC secret", desc: "Brute-forceable secret leaves symmetric-signed tokens forgeable with common password lists" },
  { icon: "clock", label: "Missing expiry", desc: "Stolen tokens never expire — attacker has indefinite access to protected resources" },
  { icon: "braces", label: "Missing audience", desc: "Token from one service can be replayed against another — no audience scoping" },
  { icon: "lock", label: "Weak JWE encryption", desc: "Encrypted tokens using deprecated algorithms like A128CBC-HS256 or RSA-OAEP-224" },
];

const details = [
  { icon: "unlock", color: "var(--danger)", title: 'The "alg: none" Attack', body: 'When a JWT library receives a token with alg: none, some implementations skip signature verification entirely. An attacker can modify the header to set alg: none, craft any payload they want, and send the two-part token (header.payload) without a signature.', code: '{"alg":"none","typ":"JWT"}\n{"sub":"admin","role":"admin","iat":1516239022}' },
  { icon: "key", color: "var(--danger)", title: "Algorithm Confusion (RS256 → HS256)", body: "This attack exploits the asymmetry between RSA and HMAC verification. The algorithm is specified in the header, and some libraries derive the verification key from the algorithm. If the server uses RS256, an attacker changes the header to HS256 and signs the token using the server's public key as the HMAC secret.", code: "// Attacker changes alg from RS256 to HS256\n// Signs with server's PUBLIC key as HMAC secret\n// Server verifies with public key → succeeds" },
  { icon: "hash", color: "var(--warning)", title: "Weak HMAC Secret Brute-Force", body: "When a JWT is signed with HS256, the same secret must be shared between issuer and verifier. If that secret is weak — 'secret', 'password', 'admin123' — an attacker can offline brute-force it using standard wordlists. TokenProbe includes a built-in wordlist of 500+ common weak secrets.", code: "# TokenProbe tests against 500+ common secrets\ntokenprobe --bruteforce <token>" },
  { icon: "clock", color: "var(--warning)", title: "Missing or Weak Expiration", body: "JWTs without exp claims never expire. If such a token is leaked, the attacker can use it indefinitely. Even when exp is present, tokens with validity windows exceeding 24 hours increase risk. Short-lived tokens (15-60 minutes) with refresh token rotation provide the best security posture.", code: '{"exp": null} // No expiration\n{"exp": 1893456000} // Expiry 30 years in future' },
];

export default function VulnSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="vulns" icon="alert" label="Common Vulnerabilities" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          JWTs are only as secure as their implementation. The flexibility of the JWT specification means that
          library defaults, misconfiguration, and developer oversights can leave your application exposed.
        </p>
        <div style={{ marginBottom: "2rem" }}>
          {details.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)", marginBottom: "0.75rem" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name={item.icon} size={20} style={{ color: item.color }} />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "0.75rem" }}>{item.body}</div>
              <CodeBlock>{item.code}</CodeBlock>
            </div>
          ))}
        </div>
        <SubHead label="Quick Reference" />
        <div className="features-grid">
          {vulns.map((v) => (
            <div key={v.label} className="feature-card">
              <div style={{ width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--danger-soft)", color: "var(--danger)", flexShrink: 0 }}>
                <NfIcon name={v.icon} size={20} />
              </div>
              <div>
                <div className="feature-card-label">{v.label}</div>
                <div className="feature-card-desc">{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

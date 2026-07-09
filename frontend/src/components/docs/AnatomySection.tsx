import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";
import CodeBlock from "./CodeBlock";

const parts = [
  {
    icon: "code", color: "var(--accent)", title: "Header",
    desc: "The header typically consists of two parts: the signing algorithm (alg) and the token type (typ). The algorithm field tells the verifier which cryptographic algorithm was used to sign the token. Common values are RS256, HS256, and ES256. Additional header parameters like kid (key ID) and crit (critical) may also be present.",
    code: '{\n  "alg": "RS256",\n  "typ": "JWT",\n  "kid": "key-id-1"\n}',
    note: "Base64URL-encoded: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
  },
  {
    icon: "braces", color: "var(--warning)", title: "Payload",
    desc: "The payload contains the claims — statements about an entity (typically the user) and additional metadata. There are three types of claims: registered (predefined in the RFC), public (custom but collision-resistant), and private (custom claims agreed upon between parties). The payload is not encrypted, so sensitive information should never be stored here without additional encryption.",
    code: '{\n  "sub": "user_abc123",\n  "name": "John Doe",\n  "iat": 1516239022,\n  "exp": 1516325422,\n  "iss": "auth.example.com",\n  "aud": "api.example.com",\n  "role": "admin"\n}',
    note: "Base64URL-encoded: eyJzdWIiOiIxMjM0NTY3ODkwIn0",
  },
  {
    icon: "lock", color: "var(--success)", title: "Signature",
    desc: "The signature is created by taking the encoded header, encoded payload, a secret or private key, and the algorithm specified in the header, then signing the concatenation. For HMAC algorithms (HS256), the secret is a shared symmetric key. For RSA algorithms (RS256), the signature is created with the private key and verified with the public key.",
    code: "HMACSHA256(\n  base64UrlEncode(header) + \".\" +\n  base64UrlEncode(payload),\n  secret\n)",
    note: "For RS256, the private key signs; for HS256, a shared secret signs and verifies.",
  },
];

export default function AnatomySection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="anatomy" icon="code" label="Anatomy of a JWT" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          A JWT is composed of three Base64URL-encoded segments separated by dots: <code style={{ fontSize: "0.8125rem" }}>Header.Payload.Signature</code>
        </p>
        <div style={{
          padding: "1.25rem", background: "var(--bg)", marginBottom: "2rem",
          fontFamily: '"CaskaydiaMono NFM", monospace', fontSize: "0.75rem", wordBreak: "break-all", lineHeight: 1.8,
        }}>
          <span style={{ color: "var(--accent)" }}>eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9</span>.
          <span style={{ color: "var(--warning)" }}>eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0</span>.
          <span style={{ color: "var(--success)" }}>SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {parts.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name={item.icon} size={20} style={{ color: item.color }} />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "0.75rem" }}>{item.desc}</div>
              <CodeBlock>{item.code}</CodeBlock>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

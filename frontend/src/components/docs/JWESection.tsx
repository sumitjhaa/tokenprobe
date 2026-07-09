import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";
import SeverityTag from "./SeverityTag";

const jweChecks = [
  { icon: "lock", name: "Weak encryption algorithm", severity: "High", detail: "Detects deprecated content encryption algorithms like A128CBC-HS256 (CBC mode is vulnerable to padding oracle attacks)." },
  { icon: "lock", name: "Weak key management", severity: "High", detail: "Flags RSA-OAEP-224 and RSA-OAEP-336 key encryption — non-standard key sizes that may indicate misconfiguration." },
  { icon: "file", name: "Missing protected header", severity: "Medium", detail: "Validates critical header fields like enc, zip, and crit are present." },
  { icon: "server", name: "Algorithm mismatch", severity: "Critical", detail: "Detects inconsistency between the alg header and the actual JWE structure — a sign of token tampering." },
];

function JweCheckItem({ icon, name, severity, detail }: { icon: string; name: string; severity: string; detail: string }) {
  return (
    <div style={{ padding: "0.875rem", background: "var(--bg)" }}>
      <div className="flex items-center gap-2" style={{ marginBottom: "0.25rem" }}>
        <NfIcon name={icon} size={16} style={{ color: "var(--accent)" }} />
        <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{name}</span>
        <SeverityTag level={severity} />
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{detail}</div>
    </div>
  );
}

export default function JWESection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="jwe" icon="lock" label="JWE — Encrypted JWTs" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          JSON Web Encryption (JWE, RFC 7516) is the encrypted counterpart to JWS (signed JWTs). While JWS ensures integrity
          and authenticity, JWE provides confidentiality by encrypting the payload. A JWE token has <strong>five</strong>
          segments: <code>ProtectedHeader.EncryptedKey.InitializationVector.Ciphertext.AuthenticationTag</code>.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {jweChecks.map((c) => <JweCheckItem key={c.name} {...c} />)}
        </div>
      </div>
    </section>
  );
}

import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";
import SubHead from "./SubHead";
import SeverityTag from "./SeverityTag";

const staticChecks = [
  { icon: "unlock", name: "alg: none", severity: "Critical", detail: "Detects tokens with alg set to 'none' or any case variation. If the server fails to validate this field, an attacker can forge tokens with arbitrary payloads." },
  { icon: "key", name: "Algorithm confusion", severity: "Critical", detail: "Tests whether an RS256-signed token can be re-forged as HS256 using the server's own public key as the HMAC secret. Works when libraries derive the verification key from the algorithm header." },
  { icon: "clock", name: "Expired token", severity: "Medium", detail: "Checks if the exp claim is in the past. Some implementations skip expiration validation for performance or backwards compatibility." },
  { icon: "clock", name: "Missing expiration", severity: "High", detail: "Flags tokens without an exp claim. JWTs without expiration never expire — a leaked token grants permanent access." },
  { icon: "clock", name: "Excessive validity", severity: "Medium", detail: "Warns when a token's validity window (iat to exp) exceeds 24 hours. Long-lived tokens increase the blast radius of a token leak." },
  { icon: "globe", name: "Missing issuer", severity: "Medium", detail: "Flags tokens missing the iss claim. Without an issuer identifier, the accepting service cannot verify which authority created the token." },
  { icon: "braces", name: "Missing audience", severity: "High", detail: "Flags tokens missing the aud claim. Without audience restriction, a token issued for one service can be presented to any other service in the same trust domain." },
  { icon: "user", name: "Missing subject", severity: "Low", detail: "Flags tokens without a sub claim. While not always required, the subject uniquely identifies the user the token represents." },
  { icon: "eye", name: "PII in payload", severity: "Medium", detail: "Scans for email addresses, phone numbers, credit card patterns, and other PII in the payload claims." },
  { icon: "hash", name: "Weak HMAC key", severity: "High", detail: "Tests HMAC signatures against a built-in wordlist of 500+ common weak secrets. Brute-forcing the secret allows forging arbitrary tokens." },
  { icon: "file", name: "JWT in URL", severity: "Info", detail: "Detects JWTs passed as URL query parameters. Tokens in URLs are exposed to browser history, server logs, and referrer headers." },
  { icon: "code", name: "Malformed structure", severity: "Medium", detail: "Validates the token has exactly three Base64URL-encoded segments separated by dots." },
];

const activeChecks = [
  { icon: "search", name: "Weak secret brute-force", severity: "High", detail: "Actively probes the token with 500+ common secrets from a built-in wordlist to find weak HMAC signing keys. Opt-in check that may take several seconds." },
  { icon: "bug", name: "Algorithm confusion probe", severity: "Critical", detail: "Attempts to re-sign the token using alternative algorithms to detect servers that accept algorithm confusion attacks. Requires an endpoint URL." },
];

function CheckItem({ icon, name, severity, detail }: { icon: string; name: string; severity: string; detail: string }) {
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

export default function ChecksSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="checks" icon="list" label="Detection Checks" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
          TokenProbe applies over a dozen detection rules against every token submitted for analysis. Each finding is assigned
          a severity level and includes remediation guidance. These checks cover header manipulation, payload validation,
          structural integrity, and cryptographic strength.
        </p>
        <SubHead label="P0 Static Checks (12 checks — offline)" />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
          {staticChecks.map((c) => <CheckItem key={c.name} {...c} />)}
        </div>
        <SubHead label="P1 Active Checks (2 checks — opt-in)" />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {activeChecks.map((c) => <CheckItem key={c.name} {...c} />)}
        </div>
      </div>
    </section>
  );
}

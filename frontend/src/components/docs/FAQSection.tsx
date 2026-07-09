import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const faqs = [
  { q: "Does TokenProbe send my tokens anywhere?", a: "No. All analysis happens entirely in your browser or local CLI. No tokens, keys, or results are transmitted over the network. The web interface sends tokens to your own backend instance for analysis, which you control." },
  { q: "What's the difference between JWS and JWE?", a: "JWS provides integrity and authenticity through a digital signature — the payload is visible but tamper-proof. JWE encrypts the payload for confidentiality. TokenProbe supports both." },
  { q: "Can TokenProbe guarantee my JWTs are secure?", a: "TokenProbe detects known misconfiguration patterns and common vulnerabilities. No tool can guarantee security, but it covers OWASP-recommended checks with actionable remediation." },
  { q: "What algorithms does TokenProbe support?", a: "HS256/HS384/HS512, RS256/RS384/RS512, ES256/ES384/ES512, and the 'none' algorithm (detected as vulnerability). JWE support includes RSA-OAEP, ECDH-ES, and direct encryption." },
  { q: "How do I integrate TokenProbe into CI/CD?", a: "Use the CLI with --json for machine-readable output. Configure it to exit non-zero on Critical/High findings. Sample GitHub Action and pre-commit hook are provided." },
  { q: "What is the 'kid' header and why does it matter?", a: "Kid (Key ID) identifies which key was used to sign the JWT. Vulnerabilities arise when servers accept arbitrary kid values without validation, potentially leading to injection attacks." },
  { q: "Are refresh tokens different from access tokens?", a: "Yes. Access tokens are short-lived JWTs sent with every API request. Refresh tokens are longer-lived credentials stored more securely (HttpOnly cookie) and used only to obtain new access tokens." },
  { q: "Can I add custom validation rules?", a: "Yes. The configuration system supports custom rules via [[custom_rules]]. Each rule specifies a claim, regex pattern, severity, and message." },
  { q: "How many themes are available?", a: "17 theme variants across two families: 8 Catppuccin (warm pastels) and 9 Cyberpunk (vibrant neon). Switch anytime from the navbar palette button." },
  { q: "What file formats are supported for batch upload?", a: "Batch analysis supports .txt files (one token per line) and .json files. Maximum file size is 10 MB." },
];

export default function FAQSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="faq" icon="help" label="FAQ" />
      <div style={{ paddingLeft: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {faqs.map((faq) => (
            <div key={faq.q} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name="help" size={20} style={{ color: "var(--accent)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{faq.q}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

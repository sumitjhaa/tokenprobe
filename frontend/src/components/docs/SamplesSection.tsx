import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const categories = [
  { icon: "unlock", title: "Vulnerability samples", desc: "Tokens demonstrating alg: none, algorithm confusion, weak HMAC secrets, missing claims, PII exposure, and more." },
  { icon: "lock", title: "JWE samples", desc: "Encrypted tokens with various algorithms including weak encryption, mismatched headers, and missing parameters." },
  { icon: "check", title: "Clean samples", desc: "Well-formed tokens passing all checks — useful as a baseline for comparing against vulnerable tokens." },
  { icon: "bug", title: "Edge cases", desc: "Boundary tests: malformed structures, empty payloads, extremely long tokens, and algorithm variations." },
];

export default function SamplesSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="samples" icon="flask" label="Sample Tokens" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          The web interface includes 24 built-in sample tokens organized by category. These are useful for testing the analyzer,
          understanding vulnerability patterns, and verifying that detection checks are working correctly.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
          {categories.map((item) => (
            <div key={item.title} style={{ padding: "1.25rem", background: "var(--bg)" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <NfIcon name={item.icon} size={20} style={{ color: "var(--accent)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

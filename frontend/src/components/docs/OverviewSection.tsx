import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const items = [
  { icon: "shield", label: "Authentication", desc: "Verify user identity across services without server-side sessions" },
  { icon: "gitBranch", label: "Authorization", desc: "Carry role and permission claims for fine-grained access control" },
  { icon: "cloud", label: "Info Exchange", desc: "Securely transmit data between parties with tamper-proof signatures" },
  { icon: "cpu", label: "Stateless Architecture", desc: "Enable horizontal scaling without shared session storage" },
];

export default function OverviewSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="overview" icon="book" label="What is JWT?" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          JSON Web Token (JWT) is an open standard defined in <strong>RFC 7519</strong> that provides a compact, URL-safe method for representing claims
          to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature
          (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure, enabling the claims to be digitally signed or integrity-protected
          with a Message Authentication Code (MAC) and/or encrypted.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "2rem" }}>
          JWTs are the de facto standard for authentication and authorization in modern web applications. They are used in OAuth 2.0, OpenID Connect,
          REST API security, microservice-to-microservice communication, and increasingly in serverless and edge computing environments.
        </p>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {items.map((item) => (
            <div key={item.label} style={{ flex: "1 1 12rem", padding: "1.25rem", background: "var(--bg)" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: "0.75rem" }}>
                <NfIcon name={item.icon} size={20} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem" }}>{item.label}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

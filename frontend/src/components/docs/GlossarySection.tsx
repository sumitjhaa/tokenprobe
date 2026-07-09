import SectionHeader from "./SectionHeader";

const terms = [
  { term: "JWT", def: "JSON Web Token — compact, URL-safe token format defined in RFC 7519. Used for authentication and authorization." },
  { term: "JWS", def: "JSON Web Signature — a signed JWT where the payload is integrity-protected but visible." },
  { term: "JWE", def: "JSON Web Encryption — an encrypted JWT with 5 segments, providing payload confidentiality." },
  { term: "JWK", def: "JSON Web Key — a JSON object representing a cryptographic key, defined in RFC 7517." },
  { term: "Base64URL", def: "URL-safe Base64 encoding using + → -, / → _, no padding. Used for JWT segment encoding." },
  { term: "HMAC", def: "Hash-based Message Authentication Code — symmetric signing algorithm (HS256/HS384/HS512)." },
  { term: "RSA", def: "Asymmetric cryptographic algorithm for JWT signing (RS256, RS384, RS512)." },
  { term: "ECDSA", def: "Elliptic Curve Digital Signature Algorithm — asymmetric with smaller keys than RSA." },
  { term: "Algorithm Confusion", def: "Attack where the JWT algorithm header is changed to trick the verifier." },
  { term: "KID", def: "Key ID — JWT header parameter identifying which key was used to sign." },
  { term: "JTI", def: "JWT ID — unique identifier claim to prevent replay attacks." },
  { term: "CSRF", def: "Cross-Site Request Forgery — attack tricking users into unwanted actions." },
  { term: "XSS", def: "Cross-Site Scripting — injection of malicious scripts into web pages." },
  { term: "TOML", def: "Tom's Obvious, Minimal Language — config file format used by TokenProbe." },
  { term: "CSP", def: "Content Security Policy — browser mechanism restricting resource loading." },
  { term: "CORS", def: "Cross-Origin Resource Sharing — allows restricted resources from another domain." },
];

export default function GlossarySection() {
  return (
    <section style={{ marginBottom: "3rem" }}>
      <SectionHeader id="glossary" icon="bookmark" label="Glossary" />
      <div style={{ paddingLeft: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {terms.map((item) => (
            <div key={item.term} style={{ display: "flex", gap: "1rem", padding: "0.75rem 1rem", background: "var(--bg)" }}>
              <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--accent)", fontFamily: '"CaskaydiaMono NFM", monospace', whiteSpace: "nowrap", minWidth: "5rem" }}>{item.term}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.def}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import SectionHeader from "./SectionHeader";
import NfIcon from "./NfIcon";

const rows = [
  ["localStorage", "High — accessible to any JavaScript", "None — sent explicitly", "Survives tab close", "Avoid for sensitive tokens"],
  ["sessionStorage", "High — accessible to any JavaScript", "None — sent explicitly", "Cleared on tab close", "Acceptable for short-lived tokens"],
  ["HttpOnly Cookie", "None — inaccessible to JavaScript", "Vulnerable without SameSite", "Configurable via Max-Age", "Best for refresh tokens"],
  ["Memory (variable)", "Low — cleared on navigation", "None — sent explicitly", "Lost on page refresh", "Best for SPA access tokens"],
];

const cols = ["Storage", "XSS Risk", "CSRF Risk", "Persistence", "Recommendation"];

export default function StorageSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="storage" icon="database" label="Token Storage & Security" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          Where and how you store JWTs on the client side is a critical security decision. The wrong choice can expose
          tokens to XSS attacks, CSRF attacks, or physical theft.
        </p>
        <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-alt)" }}>
                {cols.map((h) => (
                  <th key={h} style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, borderBottom: "1px solid var(--border)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} style={{ borderBottom: "1px solid var(--border)" }}>
                  {row.map((cell, i) => (
                    <td key={i} style={{ padding: "0.75rem", color: i === 0 ? "var(--text)" : "var(--text-secondary)", fontWeight: i === 0 ? 600 : 400, fontSize: i > 0 ? "0.75rem" : "0.8125rem" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "1.25rem", background: "var(--bg)" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
            <NfIcon name="shield" size={20} style={{ color: "var(--accent)" }} />
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Recommended Strategy</span>
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Store the access token in application memory — set from the refresh token response and lost on page refresh.
            Store the refresh token in an HttpOnly, Secure, SameSite=Strict cookie. This minimizes exposure to XSS and CSRF attacks.
          </div>
        </div>
      </div>
    </section>
  );
}

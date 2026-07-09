import { useMemo, useState } from "react";
import NfIcon from "./NfIcon";

function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return atob(padded);
  } catch {
    return "";
  }
}

function decodePart(part: string): { ok: boolean; json: string; error?: string } {
  try {
    const decoded = base64UrlDecode(part);
    if (!decoded) return { ok: false, json: "", error: "Invalid base64url encoding" };
    const parsed = JSON.parse(decoded);
    return { ok: true, json: JSON.stringify(parsed, null, 2) };
  } catch (e) {
    return { ok: false, json: "", error: "Not valid JSON" };
  }
}

interface Props {
  token: string;
}

export default function TokenDecoder({ token }: Props) {
  const [show, setShow] = useState(false);

  const parts = useMemo(() => {
    const trimmed = token.trim();
    if (!trimmed) return null;
    const segs = trimmed.split(".");
    if (segs.length < 2) return null;
    const header = decodePart(segs[0]);
    const payload = decodePart(segs[1]);
    if (!header.ok && !payload.ok) return null;
    return { header, payload };
  }, [token]);

  if (!parts) return null;

  return (
    <div className="animate-fade-in" style={{ marginTop: "0.75rem" }}>
      <button
        onClick={() => setShow(!show)}
        className="btn btn-ghost btn-sm"
        style={{ fontSize: "0.75rem" }}
      >
        <NfIcon name={show ? "chevronUp" : "eyeOff"} size="0.75em" />
        {show ? "Hide decoded preview" : "Preview decoded token"}
      </button>

      {show && (
        <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {parts.header.ok && (
            <div>
              <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Header</div>
              <pre style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", background: "var(--bg-alt)", padding: "0.5rem", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{parts.header.json}</pre>
            </div>
          )}
          {parts.payload.ok && (
            <div>
              <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Payload</div>
              <pre style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", background: "var(--bg-alt)", padding: "0.5rem", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{parts.payload.json}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

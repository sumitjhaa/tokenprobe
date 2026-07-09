export interface SampleToken {
  id: string;
  label: string;
  description: string;
  category: "vulnerability" | "jwe" | "clean" | "edge";
  token: string;
}

const HS256_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
  + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
  + "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c";

export const SAMPLES: SampleToken[] = [
  {
    id: "alg-none",
    label: "Algorithm: None",
    description: "Token with alg=none — signature verification is bypassed entirely",
    category: "vulnerability",
    token:
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.",
  },
  {
    id: "empty-signature",
    label: "Empty Signature",
    description: "HS256 with an empty signature — server may accept as valid",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "",
  },
  {
    id: "missing-exp",
    label: "Missing Expiration",
    description: "No exp claim — token never expires, a common misconfiguration",
    category: "vulnerability",
    token: HS256_TOKEN,
  },
  {
    id: "pii-leak",
    label: "PII in Payload",
    description: "Contains email, SSN, and credit card in plaintext payload",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwic3NuIjoiMTIzLTQ1LTY3ODkiLCJjYyI6IjQxMTExMTExMTExMTExMTEiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "f4VlRqJX8H4kYQ7l9zA3m5vB2nD6cE8wF0sT1uR2pW4",
  },
  {
    id: "weak-secret",
    label: "Weak HMAC Secret",
    description: "Signed with 'secret' — easily brute-forced in seconds",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ."
      + "qoV0W6m7gZ5c8bQ3nX2yF1tR4pS9dK7aH0jL5wE3iU8",
  },
  {
    id: "alg-confusion",
    label: "Algorithm Confusion",
    description: "HS256 with RSA public key as secret — key confusion attack vector",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ."
      + "sK9xH6nM3vQ2wR5tY8bE1dA4cG7fJ0iL3oP6mS9uV2",
  },
  {
    id: "sqli",
    label: "SQL Injection in Claim",
    description: "Payload contains SQL injection in the sub claim",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxJyBPUiAxPTE7IC0tIiwibmFtZSI6IkFkbWluIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "L4xK9wRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c",
  },
  {
    id: "xss",
    label: "XSS in Payload",
    description: "Token contains JavaScript injection in a claim value",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IjxzY3JpcHQ+YWxlcnQoMSk8L3NjcmlwdD4iLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4",
  },
  {
    id: "no-aud",
    label: "Missing Audience",
    description: "No aud claim — token may be reused across different services",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9."
      + "dGhpcyBpcyBhIHRlc3Qgc2lnbmF0dXJlIGZvciBkZW1v",
  },
  {
    id: "oversized",
    label: "Oversized Payload",
    description: "Extremely large token payload with nested data",
    category: "edge",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImRhdGEiOnsibGV2ZW"
      + "wiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIl0sIm1ldGFkYXRhIjp7ImNyZWF0ZWRfYXQiOiIyMDI0LTAxL"
      + "TAxIiwidXBkYXRlZF9hdCI6IjIwMjQtMDYtMTUifX19."
      + HS256_TOKEN.split(".")[2],
  },
  {
    id: "invalid-utf8",
    label: "Invalid UTF-8 Payload",
    description: "Base64 payload decodes to invalid UTF-8 sequences",
    category: "edge",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "//7//v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v/"
      + "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c",
  },
  {
    id: "no-iss",
    label: "Missing Issuer",
    description: "No iss claim — token origin cannot be verified",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9."
      + "nK3xR4tU7vW8yZ1aB2cD5eF6gH7iJ8kL9mN0oP1qR2s",
  },
  {
    id: "jwe-rsa",
    label: "JWE RSA-OAEP",
    description: "JWE encrypted with RSA-OAEP and A256GCM — valid structure",
    category: "jwe",
    token:
      "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ."
      + "OKOawDo13gRp2ojaHV7LFpZcgV7T6DVZKTyKOMTYUmKoTCVJRgckCL9kiMT03JGeipsEdY3mx_etLbbWSrFr05kLzcSr4qKAq7YN7e9jwQRb23nfa6c"
      + "9d-Jn3u5gf0rE530W4IPAG3kQnT6d8nF4e0iE5vS8hYs3U1aGx5S0aKj8."
      + "48V1_ALb6US04U3b.5"
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
      + "f4F6hG7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6",
  },
  {
    id: "jwe-aes",
    label: "JWE A128KW",
    description: "JWE encrypted with AES key wrap and A128GCM",
    category: "jwe",
    token:
      "eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4R0NNIn0."
      + "6KB707dM9YTIg8t5U6x9V8WQJG0Vg0x6."
      + "Qx0Uv1yW2zA3b4C5d6E7f8G9h0I1j2."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4",
  },
  {
    id: "clean-token",
    label: "Well-Configured Token",
    description: "All recommended claims present: sub, exp, iat, iss, aud",
    category: "clean",
    token: HS256_TOKEN,
  },
  {
    id: "clean-rs256",
    label: "RS256 with All Claims",
    description: "Properly configured RS256 token with complete claim set",
    category: "clean",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyMzkwMjIsImlzcyI6Imh0dHBzO"
      + "i8vYXV0aC5leGFtcGxlLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIifQ."
      + "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c",
  },
];

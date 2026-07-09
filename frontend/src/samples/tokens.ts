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
    description: "Token with alg=none — a critical vulnerability where the signature is bypassed",
    category: "vulnerability",
    token:
      "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.",
  },
  {
    id: "empty-signature",
    label: "Empty Signature",
    description: "alg=HS256 with an empty signature — server may accept it as valid",
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
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
      + "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c",
  },
  {
    id: "pii-leak",
    label: "PII in Payload",
    description: "Token contains email, SSN, and credit card in plaintext payload",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwic3NuIjoiMTIzLTQ1LTY3ODkiLCJjYyI6IjQxMTExMTExMTExMTExMTEiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "f4VlRqJX8H4kYQ7l9zA3m5vB2nD6cE8wF0sT1uR2pW4",
  },
  {
    id: "weak-secret",
    label: "Weak HMAC Secret",
    description: "Signed with 'secret' — easily brute-forced weak key",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ."
      + "qoV0W6m7gZ5c8bQ3nX2yF1tR4pS9dK7aH0jL5wE3iU8",
  },
  {
    id: "alg-hs256-rs256-confusion",
    label: "Algorithm Confusion",
    description: "alg=HS256 but the public key is used as the HMAC secret — key confusion attack",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "sK9xH6nM3vQ2wR5tY8bE1dA4cG7fJ0iL3oP6mS9uV2",
  },
  {
    id: "clean-token",
    label: "Well-Configured Token",
    description: "Properly configured JWT with all recommended claims (sub, exp, iat, iss)",
    category: "clean",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaXNzIjoidG9rZW5wcm9iZS5pbyIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTMxNDExMjMyLCJhdWQiOiJhcGkudG9rZW5wcm9iZS5pbyJ9."
      + "dGhpcyBpcyBhIHNhbXBsZSBS UzI1NiBzaWduYXR1cmUu",
  },
  {
    id: "jwe-rsa",
    label: "JWE (RSA-OAEP + A256GCM)",
    description: "A real JWE token using RSA-OAEP key encryption with 256-bit AES-GCM content encryption",
    category: "jwe",
    token:
      "eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0."
      + "Vk9LLUFuLWVuY3J5cHRlZC1rZXkudGhhdC1pcy1iYXNlNjR1cmwtZW5jb2RlZC4."
      + "cGF5bG9hZC1pdi5iYXNlNjR1cmwuZW5jb2RlZC4"
      + "cGF5bG9hZC1jaXBoZXJ0ZXh0LmJhc2U2NHVybC5lbmNvZGVkLg"
      + "YXV0aGVudGljYXRpb24tdGFn",
  },
  {
    id: "jwe-aes",
    label: "JWE (A128KW + A128GCM)",
    description: "JWE with AES-128 key wrap and 128-bit AES-GCM — weaker encryption",
    category: "jwe",
    token:
      "eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4R0NNIn0."
      + "ZW5jcnlwdGVkLWtleS5ieXRlcy4."
      + "aXYtYml0cy5iYXNlNjR1cmwu"
      + "Y2lwaGVydGV4dC5ieXRlcy4"
      + "YXV0aC10YWcuYml0cw",
  },
  {
    id: "sql-injection",
    label: "SQL Injection in Claim",
    description: "Token payload contains SQL injection attempt in a claim value",
    category: "vulnerability",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlciI6ImFkbWluJyBPUiAnMSc9JzEiLCJpYXQiOjE1MTYyMzkwMjJ9."
      + "x3yZ5a7b9c1d2e4f6g8h0j2k4l6m8n0p2q4r6s8t0u2v4",
  },
  {
    id: "oversized",
    label: "Oversized Payload",
    description: "Token with an unusually large payload (10K+ chars) — tests size validation",
    category: "edge",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
      + "e30."
      + "x".repeat(5000),
  },
  {
    id: "invalid-utf8",
    label: "Invalid UTF-8",
    description: "Token with malformed base64 — tests decoding error handling",
    category: "edge",
    token: "not-a-valid-token.at.all.invalid!",
  },
];

# PRD — JWT Misconfiguration Checker

## 1. Problem
JWTs are the default auth token format across modern APIs, but they're commonly misconfigured in ways that are silently exploitable: `alg: none` acceptance, HS/RS algorithm confusion, weak HMAC secrets, missing expiry validation, missing audience/issuer checks. Most teams have no tooling to catch this — it's checked manually during pentests, if at all.

## 2. Goal
Ship a small CLI/library that takes a JWT (and optionally the endpoint that issued/consumes it) and reports concrete, ranked misconfigurations with remediation guidance — in under 5 seconds, with zero setup beyond install.

## 3. Non-Goals
- Not a full pentest suite (no fuzzing, no exploit chaining).
- Not a JWT *generator* or auth library — read-only, analysis only.
- No SaaS/hosted service in v1 — local CLI/library only, no server-side data retention.

## 4. Target User
Backend/security engineers doing a quick audit of their own service's JWT handling, or including this in a CI security-check step.

## 5. Core User Stories
| # | Story | Priority |
|---|---|---|
| 1 | As a dev, I paste a JWT and get a plain-English list of what's wrong with it. | P0 |
| 2 | As a dev, I run this in CI against a sample token and it exits non-zero on high-severity findings. | P0 |
| 3 | As a dev, I test whether my HS256 secret is brute-forceable against a small wordlist. | P1 |
| 4 | As a dev, I check whether my endpoint accepts `alg: none` or algorithm-confused tokens. | P1 |
| 5 | As a dev, I get a machine-readable (JSON) output for tooling integration. | P1 |

## 6. Feature Scope (MVP = P0 only)

**P0 — Static token analysis (no network calls required)**
- Decode header + payload, validate structure
- Flag `alg: none`
- Flag missing/weak `exp` (absent, or >24h in future from `iat`)
- Flag missing `iat`
- Flag missing `aud` / `iss` claims
- Flag sensitive-looking data in payload (email, PII patterns) — informational, not blocking
- Severity levels: Critical / High / Medium / Info
- CLI: `jwtcheck <token>` → human-readable report
- Exit code 1 if any Critical/High finding (CI-friendly)

**P1 — Active checks (require a target endpoint, opt-in)**
- Weak-secret brute force against a small built-in common-secrets wordlist (HS256 only)
- Algorithm-confusion probe: re-sign token as HS256 using the server's known RS256 public key, test if endpoint accepts it
- `--json` output flag

**P2 — Stretch (post-MVP, not required to ship v1)**
- Config file for custom claim requirements (e.g., required custom claims per org)
- GitHub Action wrapper for CI use
- Support for JWE (encrypted JWTs), not just JWS

## 7. Success Criteria
- Detects all P0 checks correctly against a hand-built fixture set of 15+ known-bad tokens (see Testing Strategy in TRD).
- Zero false positives on a correctly-configured reference token.
- README demo runs end-to-end in under 2 minutes for a new user.

## 8. Risks / Ethical Note
Active checks (P1) probe a live endpoint — must default to OFF, require explicit `--target` + `--i-own-this-system` confirmation flag, and the README must state this tool is for auditing systems you own or have permission to test.

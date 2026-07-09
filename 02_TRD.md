# TRD — JWT Misconfiguration Checker

## 1. Tech Stack
- **Language:** Python 3.11+ (fastest to ship, best JWT/crypto library support, easy pip distribution)
- **Core libs:** `pyjwt` (decode without verify), `cryptography` (RSA key handling for alg-confusion check), `click` (CLI), `rich` (formatted terminal output)
- **Packaging:** `pyproject.toml`, published to PyPI as `jwtcheck`
- **Testing:** `pytest`
- **CI:** GitHub Actions (lint + test on push)

## 2. Architecture

```
jwtcheck/
├── core/
│   ├── decoder.py       # splits + base64-decodes header/payload, no verification
│   ├── checks/
│   │   ├── static.py    # all P0 checks — pure functions, no network
│   │   ├── active.py    # P1 checks — brute force, alg-confusion probe
│   │   └── base.py      # Check protocol: name, severity, run(token) -> Finding
│   ├── findings.py      # Finding + Severity dataclasses, report aggregation
│   └── wordlist.py      # small built-in common-secrets list (~50 entries)
├── cli.py               # click entrypoint, argument parsing, output formatting
├── report/
│   ├── text_report.py   # human-readable rich output
│   └── json_report.py   # machine-readable output
└── tests/
    ├── fixtures/         # hand-built known-bad and known-good JWTs
    └── test_checks.py
```

## 3. Data Flow
1. CLI receives token (arg or stdin) + optional flags (`--target`, `--json`, `--active`)
2. `decoder.py` splits token into header/payload/signature, base64-decodes header+payload (no signature verification — this tool audits, doesn't authenticate)
3. Each registered `Check` in `checks/static.py` runs against the decoded token, returns zero or more `Finding` objects
4. If `--active` set and `--target` provided: `checks/active.py` runs, each finding tagged `source=active`
5. `findings.py` aggregates, sorts by severity
6. `report/` renders either rich text or JSON
7. CLI exits 0 if no Critical/High findings, else 1

## 4. Check Specifications (P0)

| Check | Logic | Severity |
|---|---|---|
| `alg_none` | `header.alg` case-insensitive equals `"none"` | Critical |
| `missing_exp` | `exp` claim absent | High |
| `long_lived_token` | `exp - iat > 86400` (24h) | Medium |
| `missing_iat` | `iat` claim absent | Low |
| `missing_aud` | `aud` claim absent | Medium |
| `missing_iss` | `iss` claim absent | Medium |
| `pii_in_payload` | payload values match email/phone/SSN-like regex | Info |
| `weak_alg_declared` | `header.alg` in `{HS256}` AND token also carries an `x5c`/`jwk` header (alg-confusion setup) | High |

Each check is a pure function: `def run(decoded: DecodedToken) -> list[Finding]`. No shared state — new checks are added by dropping a function into `static.py` and registering it in `CHECK_REGISTRY`.

## 5. Check Specifications (P1 — active, opt-in)

| Check | Logic | Severity |
|---|---|---|
| `weak_secret_bruteforce` | Re-sign header+payload with each wordlist entry as HS256 secret, compare to token's actual signature | Critical if match |
| `alg_confusion_probe` | Fetch target's public key (JWKS endpoint or provided PEM), re-sign token as HS256 using the public key bytes as the secret, POST to `--target`, check for 2xx | Critical if accepted |

Both require explicit `--active --target <url> --i-own-this-system` flags together — refuse to run otherwise.

## 6. Output Format (JSON)
```json
{
  "token_valid_structure": true,
  "findings": [
    {"check": "alg_none", "severity": "critical", "message": "...", "remediation": "..."}
  ],
  "summary": {"critical": 1, "high": 0, "medium": 2, "low": 0, "info": 1},
  "exit_code": 1
}
```

## 7. Non-Functional Requirements
- No network calls in default mode (P0 fully offline) — privacy-safe to run on real tokens
- Single-binary-feel install: `pip install jwtcheck`, zero config needed for P0
- Runtime under 1 second for P0 checks
- No token content is logged or transmitted anywhere

## 8. Testing Strategy
- Fixture set: 15+ hand-crafted tokens covering each check (both triggering and non-triggering cases)
- One "gold standard" correctly-configured token that must produce zero Critical/High/Medium findings
- Unit test per check function, isolated from CLI/report layers
- Integration test: run full CLI against fixtures, assert exit codes

## 9. Security Considerations (of the tool itself)
- Never verify signatures using a decoded/untrusted key — decoding is display-only
- Active checks must never write/mutate state on the target — read-only probes
- Wordlist ships in-repo, documented as "common weak secrets," not sourced from any breach dataset

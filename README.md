# JWT Misconfiguration Checker (jwtcheck)

A fast, offline CLI tool and Python library for auditing JWT tokens for security misconfigurations.

![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![CI](https://github.com/jwtcheck/jwtcheck/workflows/CI/badge.svg)

## Why jwtcheck?

JWTs are the default auth token format across modern APIs, but they're commonly misconfigured in ways that are silently exploitable:

- `alg: none` acceptance (bypasses signature verification)
- HS/RS algorithm confusion attacks
- Weak HMAC secrets
- Missing expiry validation
- Missing audience/issuer checks
- Sensitive data (PII) in payloads

**jwtcheck** catches these issues in seconds, with zero setup. No network calls, no configuration — just paste your token and get a clear, actionable report.

## Features

### Static Analysis (P0 — Offline, No Network)
- ✅ Detects `alg: none` (case-insensitive)
- ✅ Flags missing `exp`, `iat`, `aud`, `iss` claims
- ✅ Identifies long-lived tokens (>24h validity)
- ✅ Detects PII in payloads (email, phone, SSN patterns)
- ✅ Catches algorithm confusion setups (HS256 + x5c/jwk headers)
- ✅ Severity-ranked findings: Critical / High / Medium / Low / Info
- ✅ Remediation guidance for every finding
- ✅ CI-friendly exit codes (0 = clean, 1 = critical/high issues)

### Active Checks (P1 — Opt-in, Requires Target Endpoint)
- 🔒 Weak-secret brute force against common wordlist (HS256)
- 🔒 Algorithm confusion probe (re-sign with public key)
- 🔒 Safety gates: requires `--active --target --i-own-this-system`

## Installation

```bash
pip install jwtcheck
```

## Quick Start

### Analyze a token
```bash
jwtcheck eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c
```

### Output example (text)
```
JWT Security Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 2 security issue(s):

╭────────────────────────────────────────────────────────────╮
│ ● HIGH    missing_exp                                       │
│ Token has no expiration time (exp claim missing)           │
│                                                             │
│ Fix: Always set an expiration time (exp claim) to limit    │
│      token validity. Recommended: 15-60 minutes for access │
│      tokens, 7-30 days for refresh tokens.                 │
╰────────────────────────────────────────────────────────────╯

╭────────────────────────────────────────────────────────────╮
│ ● MEDIUM  missing_aud                                       │
│ Token has no audience claim (aud missing)                  │
│                                                             │
│ Fix: Include an aud (audience) claim to restrict which     │
│      services can accept the token.                        │
╰────────────────────────────────────────────────────────────╯

┌──────────┬───────┐
│ Summary  │       │
├──────────┼───────┤
│ CRITICAL │     0 │
│ HIGH     │     1 │
│ MEDIUM   │     1 │
│ LOW      │     0 │
│ INFO     │     0 │
│ Total    │     2 │
└──────────┴───────┘

Exit code: 1 (critical/high issues found)
```

### JSON output (for CI/tooling)
```bash
jwtcheck --json $JWT_TOKEN > report.json
```

```json
{
  "token_valid_structure": true,
  "findings": [
    {
      "check": "missing_exp",
      "severity": "high",
      "message": "Token has no expiration time (exp claim missing)",
      "remediation": "Always set an expiration time...",
      "source": "static"
    }
  ],
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 1,
    "low": 0,
    "info": 0,
    "total": 2
  },
  "exit_code": 1
}
```

### Read from stdin
```bash
echo $JWT_TOKEN | jwtcheck
```

### Active checks (probe live endpoint)
```bash
# Weak secret brute force + algorithm confusion probe
jwtcheck --active --target https://api.example.com/auth --i-own-this-system $JWT_TOKEN

# With custom public key for algorithm confusion probe
jwtcheck --active --target https://api.example.com/auth --pubkey ./server.pub --i-own-this-system $JWT_TOKEN
```

**⚠️ Active checks require all three flags:**
- `--active` — Enable active checks
- `--target <url>` — Target endpoint to probe
- `--i-own-this-system` — Confirm authorization

### Verbose logging
```bash
jwtcheck --verbose $JWT_TOKEN
```

Logs are written to `logs/jwtcheck.log`, `logs/phases.log`, and `logs/errors.log`.

## Usage in CI

### GitHub Actions example
```yaml
- name: Audit JWT token
  run: |
    pip install jwtcheck
    jwtcheck --json ${{ secrets.TEST_JWT_TOKEN }} > jwt-report.json
    if [ $? -ne 0 ]; then
      echo "JWT security issues detected!"
      cat jwt-report.json
      exit 1
    fi
```

### Exit codes
- `0` — No critical or high severity findings
- `1` — Critical or high severity findings present
- `2` — Invalid input (malformed token, missing argument)

## Security Checks Reference

### P0 — Static Checks (Offline)

| Check | Severity | Description |
|-------|----------|-------------|
| `alg_none` | Critical | Token uses `alg: none` — signature verification bypassed |
| `missing_exp` | High | No expiration time (token never expires) |
| `long_lived_token` | Medium | Token validity >24 hours |
| `missing_iat` | Low | No issued-at timestamp |
| `missing_aud` | Medium | No audience restriction |
| `missing_iss` | Medium | No issuer identification |
| `pii_in_payload` | Info | Email, phone, or SSN detected in claims |
| `weak_alg_declared` | High | Algorithm confusion setup (HS256 + x5c/jwk) |

### P1 — Active Checks (Opt-in, Requires Target)

| Check | Severity | Description |
|-------|----------|-------------|
| `weak_secret_bruteforce` | Critical | HS256 secret found in common wordlist |
| `alg_confusion_probe` | Critical | Endpoint accepts HS256-signed token with RSA public key |

**⚠️ Active checks require explicit opt-in:**
```bash
jwtcheck --active --target https://api.example.com/auth --i-own-this-system $JWT_TOKEN
```

## Python Library Usage

```python
from jwtcheck.core.decoder import decode_token
from jwtcheck.core.checks.static import run_all_static_checks
from jwtcheck.core.findings import Report

# Decode token (no signature verification)
token = decode_token("eyJhbGci...")

# Run all static checks
findings = run_all_static_checks(token)

# Build report
report = Report()
for finding in findings:
    report.add_finding(finding)
report.finalize()

# Access results
print(f"Exit code: {report.exit_code}")
print(f"Critical findings: {report.summary.critical}")
for f in report.findings:
    print(f"  [{f.severity.value}] {f.check}: {f.message}")
```

## Development

### Setup
```bash
git clone https://github.com/jwtcheck/jwtcheck.git
cd jwtcheck
pip install -e ".[dev]"
```

### Run tests
```bash
pytest
```

### Lint
```bash
ruff check jwtcheck/
```

### Build
```bash
pip install build
python -m build
```

## Architecture

```
jwtcheck/
├── core/
│   ├── decoder.py       # JWT decoding (no verification)
│   ├── findings.py      # Finding, Severity, Report models
│   └── checks/
│       ├── base.py      # Check protocol
│       └── static.py    # P0 static checks
├── report/
│   ├── text_report.py   # Rich terminal output
│   └── json_report.py   # JSON output
├── logging_config.py    # Phase + error logging
├── cli.py               # Click CLI
└── tests/               # 60+ unit tests
```

## Logging

jwtcheck provides comprehensive logging for debugging and audit trails:

- **`logs/jwtcheck.log`** — Full application log (DEBUG level)
- **`logs/phases.log`** — Structured phase tracking (DECODING, STATIC_CHECK, etc.)
- **`logs/errors.log`** — Error-only log with stack traces

Example phase log entry:
```
2024-01-15 14:23:45 | PHASE_START | [decoder] START: Decoding JWT token | length=245 | preview=eyJhbGciOiJIUz...
2024-01-15 14:23:45 | PHASE_END | [decoder] END(OK): Token decoded successfully | elapsed=0.002s | algorithm=HS256
2024-01-15 14:23:45 | CHECK_START | [static_checks] CHECK_START: alg_none
2024-01-15 14:23:45 | CHECK_END | [static_checks] CHECK_END: alg_none | findings=1 | elapsed=0.1ms
```

## Ethics & Responsible Use

This tool is designed for **auditing systems you own or have explicit permission to test**.

- **P0 checks** are fully offline and safe to run on any token
- **P1 active checks** probe live endpoints and should only be used on your own infrastructure
- Never use this tool against systems without authorization
- The algorithm confusion probe sends re-signed tokens to the target — this is a **read-only probe** but may trigger security alerts

## Roadmap

- [x] P0: Static analysis (offline)
- [x] P1: Active checks (weak secret brute force, alg confusion)
- [ ] P2: Custom claim requirements (config file)
- [ ] P2: GitHub Action wrapper
- [ ] P2: JWE (encrypted JWT) support
- [ ] P2: Batch token analysis (file input)

## Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for any new functionality
4. Ensure `pytest` and `ruff check` pass
5. Submit a pull request

## License

MIT License — see [LICENSE](LICENSE) file for details.

## Credits

Built with:
- [PyJWT](https://github.com/jpadilla/pyjwt) — JWT decoding
- [Click](https://click.palletsprojects.com/) — CLI framework
- [Rich](https://rich.readthedocs.io/) — Terminal formatting
- [cryptography](https://cryptography.io/) — RSA key handling

## Contact

Questions, suggestions, or want to contribute? Open an issue on [GitHub](https://github.com/jwtcheck/jwtcheck/issues).

---

**Disclaimer:** This tool is for educational and authorized security testing purposes only. Always obtain proper authorization before testing systems you don't own.

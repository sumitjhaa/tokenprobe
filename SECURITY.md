# Security Policy — JWT Misconfiguration Checker

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in tokenprobe itself (not the tool's findings, but the tool's code), please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email: security@tokenprobe.example.com (replace with actual contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for the fix.

## Security Design Principles

### 1. No Signature Verification

tokenprobe **never** verifies JWT signatures. This is intentional:

- The tool audits token structure and claims, not cryptographic validity
- Signature verification would require access to secrets/keys
- Prevents accidental trust in untrusted tokens

**Implementation:**
```python
# decoder.py uses PyJWT with verification disabled
jwt.decode(token, options={"verify_signature": False})
```

### 2. Offline by Default (P0)

Static analysis (P0 checks) makes **zero network calls**:

- Safe to run on sensitive/production tokens
- No risk of token leakage
- Works in air-gapped environments

### 3. Active Checks Require Explicit Opt-In

Active checks (P1) probe live endpoints and require **all three flags**:

```bash
tokenprobe --active --target <url> --i-own-this-system <token>
```

This prevents accidental probing of unauthorized systems.

### 4. Read-Only Operations

tokenprobe never mutates state:

- Static checks: Pure analysis, no side effects
- Active checks: Read-only probes (GET requests with Authorization header)
- No token generation or modification

### 5. No Data Retention

tokenprobe does not:

- Store tokens or secrets
- Transmit data to external services
- Log token contents (only metadata like length)
- Cache analysis results

### 6. Comprehensive Logging

All operations are logged for audit:

- Phase tracking (what checks ran, how long)
- Error logging (what failed, with context)
- No sensitive data in logs (tokens truncated to 20 chars)

## Security Considerations for Users

### 1. Token Privacy

**P0 (Static) Checks:**
- ✅ Safe to run on any token
- ✅ No network transmission
- ✅ Logs only metadata (length, algorithm)

**P1 (Active) Checks:**
- ⚠️ Sends token to target endpoint
- ⚠️ Only use on systems you own/authorize
- ⚠️ Target may log the token

### 2. Weak Secret Wordlist

The built-in wordlist (`wordlist.py`) contains 50 common weak secrets:

- **NOT** sourced from breach data
- Common defaults from documentation/tutorials
- Safe to distribute with the tool

**Recommendation:** Use a strong, randomly generated secret (minimum 256 bits):
```bash
openssl rand -base64 32
```

### 3. Algorithm Confusion Probe

The algorithm confusion probe:

- Fetches the server's public key (JWKS or --pubkey)
- Re-signs the token as HS256 using the RSA public key
- Sends the confused token to the target

**Risks:**
- Target may log the malformed token
- May trigger security alerts on the target
- Only use on systems you own/authorize

### 4. Exit Codes in CI

Exit codes are designed for CI integration:

- `0` — No critical/high findings
- `1` — Critical/high findings present
- `2` — Invalid input or safety gate failure

**Recommendation:** Fail CI on exit code 1:
```yaml
- name: Audit JWT
  run: tokenprobe $JWT_TOKEN
  # Fails if exit code != 0
```

### 5. JSON Output for Tooling

JSON output is safe for automated processing:

- Structured, predictable schema
- No executable content
- Suitable for parsing in CI/CD pipelines

**Schema:**
```json
{
  "token_valid_structure": true,
  "findings": [...],
  "summary": {...},
  "exit_code": 0,
  "error": null
}
```

## Threat Model

### What tokenprobe Protects Against

1. **Misconfigured JWTs** — Detects common misconfigurations before deployment
2. **Weak Secrets** — Identifies tokens signed with common weak secrets
3. **Algorithm Confusion** — Probes for RS256→HS256 confusion vulnerabilities
4. **JWE Weakness** — Detects weak encryption algorithms and methods in encrypted JWTs
5. **Custom Policy Enforcement** — Validates tokens against enterprise claim requirements
6. **Missing Claims** — Flags tokens missing critical security claims (exp, aud, iss)
7. **PII Exposure** — Detects sensitive data in token payloads

### What tokenprobe Does NOT Protect Against

1. **Cryptographic Attacks** — Does not verify signatures or detect weak algorithms
2. **Token Theft** — Does not prevent token interception or replay
3. **Server-Side Issues** — Does not audit server-side JWT handling logic
4. **Zero-Day Vulnerabilities** — Only checks for known misconfiguration patterns

## Best Practices for Users

### 1. Use in CI/CD

Run tokenprobe on test tokens before deployment:

```yaml
- name: Security Audit
  run: |
    pip install tokenprobe
    tokenprobe --json $TEST_JWT > audit.json
    if [ $? -ne 0 ]; then
      echo "Security issues detected!"
      exit 1
    fi
```

### 2. Combine with Other Tools

tokenprobe complements (not replaces) other security tools:

- **SAST** — Static analysis of JWT handling code
- **DAST** — Dynamic testing of JWT endpoints
- **Penetration Testing** — Manual security assessment
- **Code Review** — Human review of JWT implementation

### 3. Regular Audits

Run tokenprobe regularly:

- After JWT library updates
- After configuration changes
- Before production deployments
- As part of security review cycles

### 4. Secure Active Checks

When using active checks:

- ✅ Only test systems you own
- ✅ Use in staging/test environments first
- ✅ Monitor target system for alerts
- ✅ Document testing authorization

### 5. Keep Updated

Stay current with tokenprobe updates:

- New checks for emerging misconfigurations
- Security fixes for the tool itself
- Updated wordlist for weak secrets

```bash
pip install --upgrade tokenprobe
```

## Dependencies Security

tokenprobe depends on:

- **PyJWT** — JWT decoding (no verification)
- **cryptography** — RSA key handling
- **Click** — CLI framework
- **Rich** — Terminal formatting
- **requests** — HTTP client (active checks only)

All dependencies are:

- Actively maintained
- Widely used in production
- Regularly updated for security fixes

**Recommendation:** Keep dependencies updated:
```bash
pip install --upgrade tokenprobe
```

## Compliance

tokenprobe is designed to help with:

- **OWASP API Security Top 10** — API2:2023 Broken Authentication
- **NIST SP 800-63B** — Digital Identity Guidelines
- **SOC 2** — Security audit trail (logging)
- **ISO 27001** — Information security controls

**Note:** tokenprobe is a tool, not a compliance solution. Use it as part of a broader security program.

## Contact

Security issues: security@tokenprobe.example.com  
General questions: Open a GitHub issue

---

**Last Updated:** 2024  
**Policy Version:** 1.0

# Architecture — JWT Misconfiguration Checker

## System Overview

jwtcheck is a security auditing tool for JWT tokens, designed with a clean separation between decoding, checking, and reporting. The architecture prioritizes:

1. **Safety** — No signature verification, no network calls in default mode
2. **Extensibility** — Easy to add new checks via the registry pattern
3. **Auditability** — Comprehensive phase and error logging
4. **CI Integration** — Clean exit codes and JSON output

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  cli.py (Click)                                       │  │
│  │  - Argument parsing                                   │  │
│  │  - Safety gate validation                             │  │
│  │  - Output orchestration                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  decoder.py  │  │  findings.py │  │  checks/         │  │
│  │              │  │              │  │  ├─ base.py      │  │
│  │  - Split JWT │  │  - Finding   │  │  ├─ static.py    │  │
│  │  - Base64url │  │  - Severity  │  │  └─ active.py    │  │
│  │  - No verify │  │  - Report    │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  wordlist.py                                          │  │
│  │  - 50 common weak secrets                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Reporting Layer                           │
│  ┌────────────────────┐  ┌────────────────────────────┐    │
│  │  text_report.py    │  │  json_report.py            │    │
│  │  - Rich formatting │  │  - Machine-readable        │    │
│  │  - Severity colors │  │  - CI/tooling integration  │    │
│  │  - Remediation     │  │  - Structured output       │    │
│  └────────────────────┘  └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Logging Infrastructure                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  logging_config.py                                    │  │
│  │  - PhaseLogger (execution flow tracking)              │  │
│  │  - ErrorLogger (error context capture)                │  │
│  │  - Multi-handler: console + files                     │  │
│  │  - Structured logs: phases.log, errors.log, app.log   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Static Analysis (P0)

```
1. Token Input (arg/stdin)
   │
   ▼
2. decoder.py: Split + Base64url Decode
   │  - Header → dict
   │  - Payload → dict
   │  - Signature → bytes (not verified)
   │
   ▼
3. checks/static.py: Run All Static Checks
   │  - AlgNoneCheck
   │  - MissingExpCheck
   │  - LongLivedTokenCheck
   │  - MissingIatCheck
   │  - MissingAudCheck
   │  - MissingIssCheck
   │  - PiiInPayloadCheck
   │  - WeakAlgDeclaredCheck
   │
   ▼
4. findings.py: Aggregate + Sort by Severity
   │
   ▼
5. report/: Render Output (text or JSON)
   │
   ▼
6. CLI: Exit with code (0=clean, 1=critical/high)
```

### Active Analysis (P1)

```
1. Safety Gate Validation
   │  - --active flag present?
   │  - --target URL provided?
   │  - --i-own-this-system confirmed?
   │
   ▼
2. checks/active.py: Run Active Checks
   │
   ├─► WeakSecretBruteforceCheck
   │   - Re-sign with 50 common secrets
   │   - Compare signatures
   │
   └─► AlgConfusionProbeCheck
       - Fetch public key (JWKS or --pubkey)
       - Re-sign as HS256 with RSA key
       - POST to target endpoint
       - Check for 2xx response
   │
   ▼
3. Aggregate findings with static results
   │
   ▼
4. Render + Exit
```

## Design Patterns

### 1. Check Registry Pattern

All checks implement the `Check` protocol and are registered in `CHECK_REGISTRY` (static) or `ACTIVE_CHECK_REGISTRY` (active). This allows:

- Easy addition of new checks
- Iteration over all checks in a uniform way
- Metadata extraction for documentation

```python
class Check(Protocol):
    @property
    def metadata(self) -> CheckMetadata: ...
    def run(self, token: DecodedToken) -> list[Finding]: ...

CHECK_REGISTRY = [
    AlgNoneCheck(),
    MissingExpCheck(),
    # ... more checks
]
```

### 2. Pure Function Checks

Static checks are pure functions with no side effects:

```python
def run(self, token: DecodedToken) -> list[Finding]:
    # No network calls
    # No shared state
    # Deterministic output
```

This makes them:
- Easy to test
- Safe to run on sensitive tokens
- Predictable in CI environments

### 3. Immutable Findings

`Finding` is a frozen dataclass:

```python
@dataclass(frozen=True)
class Finding:
    check: str
    severity: Severity
    message: str
    remediation: str
    source: CheckSource
    details: Optional[str]
```

Benefits:
- Thread-safe
- Hashable
- No accidental mutation

### 4. Severity-Ordered Reports

`Report.finalize()` sorts findings by severity weight:

```python
def finalize(self):
    self.findings.sort(key=lambda f: f.severity.weight, reverse=True)
    self.exit_code = 1 if self.summary.has_critical_or_high else 0
```

Ensures:
- Most critical issues appear first
- Consistent output ordering
- CI-friendly exit codes

## Logging Architecture

### Phase Logging

Tracks execution flow with structured events:

```
PHASE_START | [decoder] START: Decoding JWT token | length=245
PHASE       | [decoder] Header decoded | keys=['alg', 'typ']
PHASE_END   | [decoder] END(OK): Token decoded successfully | elapsed=0.002s
CHECK_START | [static_checks] CHECK_START: alg_none
CHECK_END   | [static_checks] CHECK_END: alg_none | findings=1 | elapsed=0.1ms
```

### Error Logging

Captures errors with full context:

```
ERROR | [decoder] DecodeError: Invalid JWT structure | context={'parts_count': 1}
```

### Log Files

- `logs/jwtcheck.log` — Full application log (DEBUG)
- `logs/phases.log` — Phase tracking only (PHASE_START/END)
- `logs/errors.log` — Errors only (ERROR+)

## Security Considerations

### What jwtcheck Does NOT Do

1. **Signature Verification** — Never verifies signatures. Decoding is display-only.
2. **Token Generation** — Read-only analysis, no token creation.
3. **Network Calls (P0)** — Static checks are fully offline.
4. **Secret Storage** — Does not store or transmit tokens/secrets.

### What jwtcheck DOES Do

1. **Decode Without Verify** — Uses `options={"verify_signature": False}` explicitly.
2. **Safety Gates** — Active checks require explicit opt-in with three flags.
3. **Audit Trail** — All checks logged with timestamps and context.
4. **Read-Only Probes** — Active checks never mutate target state.

## Extending jwtcheck

### Adding a New Static Check

1. Create a check class in `checks/static.py`:

```python
class MyNewCheck:
    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="my_new_check",
            description="Checks for ...",
            category="custom",
            severity_hint="medium",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        findings = []
        if some_condition(token):
            findings.append(Finding(
                check="my_new_check",
                severity=Severity.MEDIUM,
                message="Issue detected",
                remediation="How to fix it",
            ))
        return findings
```

2. Register it in `CHECK_REGISTRY`:

```python
CHECK_REGISTRY.append(MyNewCheck())
```

3. Add tests in `tests/test_checks.py`

### Adding a New Active Check

Same pattern, but in `checks/active.py` and `ACTIVE_CHECK_REGISTRY`.

## Testing Strategy

### Test Coverage

- **Unit Tests** — Each check tested in isolation
- **Integration Tests** — Full CLI flow with fixtures
- **Edge Cases** — Malformed tokens, unicode, nested objects
- **False Positive Tests** — Gold standard token produces zero findings

### Fixture Design

15+ hand-crafted tokens covering:
- Each check's trigger condition
- Case variations (alg: none, None, NONE)
- Boundary conditions (exactly 24h, 24h+1s)
- Multi-issue tokens
- Malformed tokens (no dots, bad base64, etc.)

### Test Execution

```bash
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest --cov=jwtcheck     # With coverage report
```

## Performance Characteristics

- **P0 (Static)** — <1 second for typical tokens
- **P1 (Active)** — Depends on network latency + wordlist size
  - Weak secret brute force: ~50 HMAC operations
  - Algorithm confusion: 1 HTTP request + key operations

## Future Enhancements

- [ ] Batch token analysis (file input)
- [ ] Custom claim requirements (config file)
- [ ] JWE (encrypted JWT) support
- [ ] GitHub Action wrapper
- [ ] Plugin system for third-party checks

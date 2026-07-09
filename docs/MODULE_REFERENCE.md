# Module Reference — JWT Misconfiguration Checker

Complete technical reference for all modules in jwtcheck.

## Core Modules

### `jwtcheck.core.decoder`

**Purpose:** Safe JWT token decoding without signature verification.

**Key Classes:**
- `DecodedToken` — Immutable representation of decoded JWT
- `DecodeError` — Exception for decode failures

**Key Functions:**
- `decode_token(token: str) -> DecodedToken` — Decode JWT into components

**Security Features:**
- No signature verification (read-only)
- Input validation before processing
- Base64url decoding with proper padding
- Comprehensive error handling

**Usage:**
```python
from jwtcheck.core.decoder import decode_token, DecodeError

try:
    token = decode_token("eyJhbGci...")
    print(token.algorithm)  # "HS256"
    print(token.payload)    # {"sub": "1234567890", ...}
except DecodeError as e:
    print(f"Invalid token: {e}")
```

---

### `jwtcheck.core.findings`

**Purpose:** Data models for security findings and reports.

**Key Classes:**
- `Severity` — Enum: CRITICAL, HIGH, MEDIUM, LOW, INFO
- `CheckSource` — Enum: STATIC, ACTIVE
- `Finding` — Immutable security finding (frozen dataclass)
- `Summary` — Aggregated finding counts
- `Report` — Complete analysis report

**Key Features:**
- Immutable findings (thread-safe)
- Severity comparison and sorting
- JSON serialization support
- Exit code computation

**Usage:**
```python
from jwtcheck.core.findings import Finding, Severity, Report

finding = Finding(
    check="alg_none",
    severity=Severity.CRITICAL,
    message="Token uses alg: none",
    remediation="Enforce specific algorithm",
)

report = Report()
report.add_finding(finding)
report.finalize()

print(report.exit_code)  # 1 (critical found)
print(report.to_dict())  # JSON-serializable dict
```

---

### `jwtcheck.core.validation`

**Purpose:** Input validation and sanitization for security.

**Key Functions:**
- `validate_token_format(token: str) -> str` — Validate JWT structure
- `validate_url(url: str) -> str` — Validate target URLs
- `validate_claim_key(key: str) -> str` — Validate claim keys
- `validate_secret(secret: str) -> str` — Validate secrets
- `validate_file_path(path: str) -> str` — Validate file paths
- `sanitize_for_logging(value: Any, max_length: int) -> str` — Safe logging

**Security Features:**
- Prevents injection attacks
- Blocks path traversal
- Truncates long inputs
- Escapes special characters
- Prevents information leakage

**Usage:**
```python
from jwtcheck.core.validation import validate_token_format, ValidationError

try:
    token = validate_token_format("eyJhbGci...")
except ValidationError as e:
    print(f"Invalid: {e}")

safe_log = sanitize_for_logging(token, max_length=50)
```

---

### `jwtcheck.core.checks.engine`

**Purpose:** Check execution with error isolation.

**Key Classes:**
- `Check` — Protocol for all security checks
- `CheckResult` — Result of executing a single check
- `CheckExecutor` — Executes checks with isolation
- `CheckRegistry` — Dynamic check management

**Key Features:**
- Error isolation (no piggybacking)
- Execution time tracking
- Context passing to checks
- Severity-sorted findings
- Failed check reporting

**Usage:**
```python
from jwtcheck.core.checks.engine import CheckExecutor, CheckRegistry
from jwtcheck.core.checks.static import STATIC_CHECKS

registry = CheckRegistry()
for check in STATIC_CHECKS:
    registry.register(check)

executor = CheckExecutor(registry.all_checks())
results = executor.execute_all(decoded_token, target="https://...")

for finding in executor.all_findings:
    print(f"[{finding.severity.value}] {finding.check}")

for failed in executor.failed_checks:
    print(f"Check {failed.check_name} failed: {failed.error_message}")
```

---

### `jwtcheck.core.checks.static`

**Purpose:** P0 static security checks (offline).

**Checks Implemented:**
1. `AlgNoneCheck` — Detects alg: none (CRITICAL)
2. `MissingExpCheck` — Missing expiration (HIGH)
3. `LongLivedTokenCheck` — Excessive validity (MEDIUM)
4. `MissingIatCheck` — Missing issued-at (LOW)
5. `MissingAudCheck` — Missing audience (MEDIUM)
6. `MissingIssCheck` — Missing issuer (MEDIUM)
7. `PiiInPayloadCheck` — PII detection (INFO)
8. `WeakAlgDeclaredCheck` — Algorithm confusion setup (HIGH)

**Key Constants:**
- `STATIC_CHECKS` — List of all static check instances
- `LONG_LIVED_THRESHOLD` — 86400 seconds (24 hours)

**Usage:**
```python
from jwtcheck.core.checks.static import STATIC_CHECKS, AlgNoneCheck

check = AlgNoneCheck()
findings = check.run(decoded_token)

for finding in findings:
    print(finding.message)
    print(finding.remediation)
```

---

### `jwtcheck.core.checks.active`

**Purpose:** P1 active security checks (network required).

**Checks Implemented:**
1. `WeakSecretBruteforceCheck` — Brute force HS256 secrets (CRITICAL)
2. `AlgConfusionProbeCheck` — Algorithm confusion probe (CRITICAL)

**Key Constants:**
- `ACTIVE_CHECKS` — List of all active check instances

**Safety Requirements:**
- Requires `--active` flag
- Requires `--target` URL
- Requires `--i-own-this-system` confirmation

**Usage:**
```python
from jwtcheck.core.checks.active import ACTIVE_CHECKS, WeakSecretBruteforceCheck

check = WeakSecretBruteforceCheck()
findings = check.run(decoded_token)

# Or with context
findings = check.run(decoded_token, target="https://api.example.com")
```

---

### `jwtcheck.core.wordlist`

**Purpose:** Built-in weak secret wordlist.

**Key Functions:**
- `get_wordlist() -> list[str]` — Get copy of wordlist
- `wordlist_size() -> int` — Get wordlist size

**Contents:**
- 50 common weak secrets
- NOT from breach data
- Common defaults from documentation

**Usage:**
```python
from jwtcheck.core.wordlist import get_wordlist, wordlist_size

secrets = get_wordlist()
print(f"Testing {wordlist_size()} secrets")
```

---

## Reporting Modules

### `jwtcheck.report.text_report`

**Purpose:** Human-readable Rich terminal output.

**Key Functions:**
- `render_text_report(report: Report, console: Console)` — Render report

**Features:**
- Severity-based colors
- Structured layout
- Remediation guidance
- Summary table
- Exit code display

**Usage:**
```python
from rich.console import Console
from jwtcheck.report.text_report import render_text_report

console = Console()
render_text_report(report, console)
```

---

### `jwtcheck.report.json_report`

**Purpose:** Machine-readable JSON output.

**Key Functions:**
- `render_json_report(report: Report, file=None)` — Render to file
- `render_json_to_string(report: Report) -> str` — Render to string

**Schema:**
```json
{
  "token_valid_structure": true,
  "findings": [
    {
      "check": "alg_none",
      "severity": "critical",
      "message": "...",
      "remediation": "...",
      "source": "static",
      "details": "..."
    }
  ],
  "summary": {
    "critical": 1,
    "high": 0,
    "medium": 2,
    "low": 0,
    "info": 1,
    "total": 4
  },
  "exit_code": 1,
  "error": null
}
```

**Usage:**
```python
from jwtcheck.report.json_report import render_json_report

with open("report.json", "w") as f:
    render_json_report(report, file=f)
```

---

## Infrastructure Modules

### `jwtcheck.logging_config`

**Purpose:** Comprehensive logging infrastructure.

**Key Classes:**
- `Phase` — Enum for execution phases
- `PhaseLogger` — Structured phase tracking
- `ErrorLogger` — Error context capture

**Key Functions:**
- `setup_logging(verbose, log_to_file, log_dir)` — Configure logging
- `get_logger(name) -> Logger` — Get child logger

**Log Files:**
- `logs/jwtcheck.log` — Full application log
- `logs/phases.log` — Phase tracking only
- `logs/errors.log` — Errors only
- `logs/tests/test_execution.log` — Test execution
- `logs/tests/test_results.log` — Test results

**Usage:**
```python
from jwtcheck.logging_config import setup_logging, PhaseLogger

setup_logging(verbose=True, log_to_file=True)

phase = PhaseLogger("my_component")
phase.start("Operation")
try:
    # Do work
    phase.end("Complete", success=True)
except Exception as e:
    phase.end("Failed", success=False, error=e)
```

---

### `jwtcheck.cli`

**Purpose:** Command-line interface.

**Key Function:**
- `main()` — CLI entry point

**Options:**
- `TOKEN` — JWT token (arg or stdin)
- `--json` — JSON output
- `--verbose, -v` — Verbose logging
- `--log-dir` — Custom log directory
- `--no-log-file` — Disable file logging
- `--active` — Enable active checks
- `--target` — Target endpoint URL
- `--i-own-this-system` — Authorization confirmation
- `--pubkey` — RSA public key PEM file

**Exit Codes:**
- `0` — No critical/high findings
- `1` — Critical/high findings present
- `2` — Invalid input or safety gate failure

**Usage:**
```bash
# Basic analysis
jwtcheck eyJhbGci...

# JSON output
jwtcheck --json $TOKEN > report.json

# Active checks
jwtcheck --active --target https://api.example.com --i-own-this-system $TOKEN

# From stdin
echo $TOKEN | jwtcheck
```

---

## Test Modules

### `jwtcheck.tests.test_logging`

**Purpose:** Test logging infrastructure.

**Key Classes:**
- `TestResultLogger` — Log test results

**Key Functions:**
- `setup_test_logging()` — Configure test logging
- `get_test_logger(name)` — Get test logger
- `get_result_logger()` — Get result logger

**Usage:**
```python
from jwtcheck.tests.test_logging import get_result_logger

logger = get_result_logger()
logger.log_test_start("test_name", "module_name")
logger.log_test_pass("test_name", "module_name", 10.5)
```

---

## Extension Points

### Adding a New Check

1. Create check class implementing `Check` protocol:
```python
class MyCheck:
    @property
    def name(self) -> str:
        return "my_check"

    @property
    def description(self) -> str:
        return "Description"

    @property
    def category(self) -> str:
        return "category"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        findings = []
        if problem_detected:
            findings.append(Finding(...))
        return findings
```

2. Register in appropriate list:
```python
# In static.py or active.py
STATIC_CHECKS.append(MyCheck())
```

3. Add tests in `tests/test_checks.py` or `tests/test_active_checks.py`

---

## Design Patterns

### 1. Protocol-Based Checks
All checks implement the `Check` protocol for polymorphism.

### 2. Registry Pattern
`CheckRegistry` manages check lifecycle and retrieval.

### 3. Executor Pattern
`CheckExecutor` handles execution with error isolation.

### 4. Immutable Data
`Finding` is frozen for thread safety.

### 5. Strategy Pattern
Different check implementations can be swapped.

---

## Dependencies

- **pyjwt** — JWT decoding
- **cryptography** — RSA key handling
- **click** — CLI framework
- **rich** — Terminal formatting
- **requests** — HTTP client (active checks)

All dependencies are:
- Actively maintained
- Widely used
- Security-audited

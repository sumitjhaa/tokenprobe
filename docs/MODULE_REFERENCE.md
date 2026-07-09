# Module Reference — JWT Misconfiguration Checker

Complete technical reference for all modules in tokenprobe.

## Core Modules

### `tokenprobe.core.decoder`

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
from tokenprobe.core.decoder import decode_token, DecodeError

try:
    token = decode_token("eyJhbGci...")
    print(token.algorithm)  # "HS256"
    print(token.payload)    # {"sub": "1234567890", ...}
except DecodeError as e:
    print(f"Invalid token: {e}")
```

---

### `tokenprobe.core.findings`

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
from tokenprobe.core.findings import Finding, Severity, Report

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

### `tokenprobe.core.validation`

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
from tokenprobe.core.validation import validate_token_format, ValidationError

try:
    token = validate_token_format("eyJhbGci...")
except ValidationError as e:
    print(f"Invalid: {e}")

safe_log = sanitize_for_logging(token, max_length=50)
```

---

### `tokenprobe.core.checks.engine`

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
from tokenprobe.core.checks.engine import CheckExecutor, CheckRegistry
from tokenprobe.core.checks.static import STATIC_CHECKS

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

### `tokenprobe.core.checks.static`

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
from tokenprobe.core.checks.static import STATIC_CHECKS, AlgNoneCheck

check = AlgNoneCheck()
findings = check.run(decoded_token)

for finding in findings:
    print(finding.message)
    print(finding.remediation)
```

---

### `tokenprobe.core.checks.active`

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
from tokenprobe.core.checks.active import ACTIVE_CHECKS, WeakSecretBruteforceCheck

check = WeakSecretBruteforceCheck()
findings = check.run(decoded_token)

# Or with context
findings = check.run(decoded_token, target="https://api.example.com")
```

---

### `tokenprobe.core.jwe_decoder`

**Purpose:** Decode and analyze JWE (encrypted JWT) tokens without decrypting the payload.

**Key Classes:**
- `JWEDecodedToken` — Immutable representation of decoded JWE
- `JWEDecodeError` — Exception for JWE decode failures

**Key Functions:**
- `decode_jwe_token(token: str) -> JWEDecodedToken` — Decode JWE into components

**Security Features:**
- No CEK (Content Encryption Key) decryption
- Header-only parsing (payload remains encrypted)
- 5-part structure validation
- Robust error handling for malformed JWE tokens

**Usage:**
```python
from tokenprobe.core.jwe_decoder import decode_jwe_token

jwe = decode_jwe_token("eyJhbGci...")
print(jwe.algorithm)  # "RSA-OAEP"
print(jwe.encryption_method)  # "A256GCM"
```

---

### `tokenprobe.core.unified_decoder`

**Purpose:** Auto-detect token type (JWT vs JWE) and route to the correct decoder.

**Key Functions:**
- `decode_token(token: str) -> DecodedToken | JWEDecodedToken` — Auto-detect and decode

**Detection Logic:**
- 3-part structure → route to JWT decoder
- 5-part structure → route to JWE decoder

**Usage:**
```python
from tokenprobe.core.unified_decoder import decode_token

result = decode_token("eyJhbGci...")
if hasattr(result, 'encryption_method'):
    print("JWE token detected")
else:
    print("JWT token detected")
```

---

### `tokenprobe.core.config`

**Purpose:** Load and validate TOML configuration files for custom claim requirements.

**Key Classes:**
- `CustomConfig` — Immutable config model
- `ConfigError` — Exception for config failures

**Key Functions:**
- `load_config(path: str) -> CustomConfig` — Load TOML config from file
- `validate_config(data: dict) -> CustomConfig` — Validate config dict

**Config Schema:**
```toml
[claims]
required = ["sub", "exp", "iat", "iss", "aud", "role"]

[checks]
disable = ["pii_in_payload"]

[severity_overrides]
missing_exp = "critical"

[[custom_rules]]
name = "valid_role"
claim = "role"
pattern = "^(admin|user|moderator)$"
severity = "high"
message = "Role must be admin, user, or moderator"
```

**Usage:**
```python
from tokenprobe.core.config import load_config

config = load_config("tokenprobe.toml")
print(config.required_claims)
```

---

### `tokenprobe.core.batch`

**Purpose:** Process multiple tokens from files with aggregated reporting.

**Key Classes:**
- `BatchResult` — Per-token analysis result
- `BatchSummary` — Aggregated batch statistics

**Key Functions:**
- `load_tokens_from_file(path: str) -> list[str]` — Load tokens from text/JSON file
- `run_batch_analysis(tokens: list[str], config=None) -> list[BatchResult]` — Analyze all tokens

**Input Formats:**
- Text file: one token per line, `#` for comments
- JSON file: array of token strings

**Usage:**
```python
from tokenprobe.core.batch import load_tokens_from_file, run_batch_analysis

tokens = load_tokens_from_file("tokens.txt")
results = run_batch_analysis(tokens)

for result in results:
    print(f"{result.token_index}: {len(result.findings)} findings")
```

---

### `tokenprobe.core.checks.jwe`

**Purpose:** P2 JWE-specific security checks (header validation for encrypted JWTs).

**Checks Implemented:**
1. `JweAlgNoneCheck` — Detects alg: none in JWE (CRITICAL)
2. `JweWeakAlgorithmCheck` — Weak key encryption alg (RSA1_5, RSA_OAEP) (HIGH)
3. `JweMissingEncryptionCheck` — Missing enc field (CRITICAL)
4. `JweWeakEncryptionMethodCheck` — Weak content encryption (MEDIUM)

**Key Constants:**
- `JWE_CHECKS` — List of all JWE check instances

**Usage:**
```python
from tokenprobe.core.checks.jwe import JWE_CHECKS, JweAlgNoneCheck

check = JweAlgNoneCheck()
findings = check.run(jwe_decoded_token)
```

---

### `tokenprobe.core.wordlist`

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
from tokenprobe.core.wordlist import get_wordlist, wordlist_size

secrets = get_wordlist()
print(f"Testing {wordlist_size()} secrets")
```

---

## Reporting Modules

### `tokenprobe.report.text_report`

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
from tokenprobe.report.text_report import render_text_report

console = Console()
render_text_report(report, console)
```

---

### `tokenprobe.report.json_report`

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
from tokenprobe.report.json_report import render_json_report

with open("report.json", "w") as f:
    render_json_report(report, file=f)
```

---

## Infrastructure Modules

### `tokenprobe.logging_config`

**Purpose:** Comprehensive logging infrastructure.

**Key Classes:**
- `Phase` — Enum for execution phases
- `PhaseLogger` — Structured phase tracking
- `ErrorLogger` — Error context capture

**Key Functions:**
- `setup_logging(verbose, log_to_file, log_dir)` — Configure logging
- `get_logger(name) -> Logger` — Get child logger

**Log Files:**
- `logs/tokenprobe.log` — Full application log
- `logs/phases.log` — Phase tracking only
- `logs/errors.log` — Errors only
- `logs/tests/test_execution.log` — Test execution
- `logs/tests/test_results.log` — Test results

**Usage:**
```python
from tokenprobe.logging_config import setup_logging, PhaseLogger

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

### `tokenprobe.cli`

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
- `--config` — TOML configuration file path
- `--batch` — Batch mode: TOKEN is a file path
- `--batch-output` — Save batch results to file

**Exit Codes:**
- `0` — No critical/high findings
- `1` — Critical/high findings present
- `2` — Invalid input or safety gate failure

**Usage:**
```bash
# Basic analysis
tokenprobe eyJhbGci...

# JSON output
tokenprobe --json $TOKEN > report.json

# Active checks
tokenprobe --active --target https://api.example.com --i-own-this-system $TOKEN

# From stdin
echo $TOKEN | tokenprobe

# Custom config
tokenprobe --config tokenprobe.toml $TOKEN

# Batch analysis
tokenprobe --batch tokens.txt --batch-output results.json
```

---

## Test Modules

### `tokenprobe.tests.test_logging`

**Purpose:** Test logging infrastructure.

**Key Classes:**
- `TestResultLogger` — Log test results

**Key Functions:**
- `setup_test_logging()` — Configure test logging
- `get_test_logger(name)` — Get test logger
- `get_result_logger()` — Get result logger

**Usage:**
```python
from tokenprobe.tests.test_logging import get_result_logger

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

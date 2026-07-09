# How to Run TokenProbe

Complete guide for running TokenProbe in different scenarios.

## Quick Start (3 Commands)

```bash
# 1. Clone the repository
git clone https://github.com/sumitjhaa/tokenprobe.git
cd tokenprobe

# 2. Install dependencies and setup environment
./scripts/install.sh

# 3. Run your first scan
jwtcheck eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQsW5c
```

That's it! You'll see a formatted security report with findings and remediation advice.

---

## CLI Usage

### Basic Token Analysis

```bash
# Analyze a token passed as argument
jwtcheck <token>

# Analyze from stdin
echo "<token>" | jwtcheck
cat token.txt | jwtcheck

# With verbose logging
jwtcheck --verbose <token>
```

### Output Formats

```bash
# Human-readable output (default)
jwtcheck <token>

# JSON output (for automation)
jwtcheck --json <token>

# Save JSON to file
jwtcheck --json <token> > report.json
```

### Active Checks (Network Required)

Active checks probe live endpoints and require explicit authorization:

```bash
# Basic active scan
jwtcheck --active --target https://api.example.com --i-own-this-system <token>

# With custom public key for algorithm confusion test
jwtcheck --active --target https://api.example.com --pubkey ./server.pub --i-own-this-system <token>
```

**Required flags for active checks:**
- `--active` — Enable active checks
- `--target <url>` — Target endpoint URL
- `--i-own-this-system` — Authorization confirmation

**Safety note:** Active checks send requests to the target. Only use on systems you own or have explicit permission to test.

### Logging Options

```bash
# Custom log directory
jwtcheck --log-dir ./my-logs <token>

# Disable file logging (console only)
jwtcheck --no-log-file <token>

# Combine options
jwtcheck --verbose --log-dir ./logs --json <token>
```

**Log files created:**
- `logs/jwtcheck.log` — Full application log
- `logs/phases.log` — Execution phases and timing
- `logs/errors.log` — Error details with stack traces

### Custom Configuration

Use a TOML config file to define custom claim requirements and validation rules:

```bash
# Use config file
jwtcheck --config tokenprobe.toml <token>
```

**Example config file (`tokenprobe.toml`):**

```toml
[claims]
required = ["sub", "exp", "iat", "iss", "aud", "role"]

[checks]
disable = ["pii_in_payload"]

[severity_overrides]
missing_exp = "critical"
missing_aud = "high"

[[custom_rules]]
name = "valid_role"
claim = "role"
pattern = "^(admin|user|moderator)$"
severity = "high"
message = "Role must be admin, user, or moderator"
```

See `examples/tokenprobe.toml` for a complete example.

### Batch Analysis

Process multiple tokens from files:

```bash
# Analyze tokens from text file (one per line)
jwtcheck --batch tokens.txt

# Analyze tokens from JSON file
jwtcheck --batch tokens.json

# Save batch results to file
jwtcheck --batch tokens.txt --batch-output results.json

# Batch with JSON output
jwtcheck --batch tokens.txt --json > batch-report.json
```

**Text file format (`tokens.txt`):**

```text
# Comments are ignored
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.fake
```

**JSON file format (`tokens.json`):**

```json
[
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.fake"
]
```

See `examples/tokens.txt` and `examples/tokens.json` for examples.

### JWE (Encrypted JWT) Analysis

TokenProbe automatically detects and analyzes JWE tokens (5-part structure):

```bash
# Analyze a JWE token
jwtcheck <jwe_token>
```

**JWE token structure:** `header.encrypted_key.iv.ciphertext.tag`

**What's checked:**
- Header algorithm validation (detects weak algorithms like RSA1_5)
- Encryption method validation (enc field)
- Missing required fields detection

**Note:** Since the payload is encrypted, only header-level checks are performed.

### CLI Reference

```
Usage: jwtcheck [OPTIONS] [TOKEN]

Options:
  --json                    Output results as JSON
  -v, --verbose             Enable verbose logging
  --log-dir PATH            Custom log directory
  --no-log-file             Disable file logging
  --active                  Enable active checks
  --target TEXT             Target endpoint URL
  --i-own-this-system       Confirm authorization
  --pubkey FILE             RSA public key PEM file
  --config FILE             TOML configuration file
  --batch                   Batch mode: TOKEN is a file path
  --batch-output FILE       Save batch results to file
  --version                 Show version
  --help                    Show help message
```

---

## Python Library Usage

### Basic Analysis

```python
from jwtcheck.core.decoder import decode_token
from jwtcheck.core.checks.engine import CheckExecutor
from jwtcheck.core.checks.static import STATIC_CHECKS

# Decode token (no signature verification)
token = decode_token("eyJhbGci...")

# Run all static checks
executor = CheckExecutor(STATIC_CHECKS)
executor.execute_all(token)

# Access findings
for finding in executor.all_findings:
    print(f"[{finding.severity.value}] {finding.check}: {finding.message}")
    print(f"  Remediation: {finding.remediation}")
```

### Check Error Isolation

```python
# Check if any checks failed
if executor.failed_checks:
    print("Some checks failed:")
    for result in executor.failed_checks:
        print(f"  {result.check_name}: {result.error_message}")

# Get only successful results
successful = executor.successful_checks
print(f"{len(successful)} checks completed successfully")
```

### Structured Report

```python
from jwtcheck.core.findings import Report

# Build report
report = Report()
for finding in executor.all_findings:
    report.add_finding(finding)
report.finalize()

# Access report data
print(f"Exit code: {report.exit_code}")
print(f"Total findings: {report.summary.total}")
print(f"Critical: {report.summary.critical}")
print(f"High: {report.summary.high}")

# Export to JSON
import json
with open("report.json", "w") as f:
    json.dump(report.to_dict(), f, indent=2)
```

### Custom Check Selection

```python
from jwtcheck.core.checks.static import (
    AlgNoneCheck,
    MissingExpCheck,
    PiiInPayloadCheck,
)

# Run only specific checks
custom_checks = [AlgNoneCheck(), MissingExpCheck(), PiiInPayloadCheck()]
executor = CheckExecutor(custom_checks)
executor.execute_all(token)
```

### Active Checks (Python)

```python
from jwtcheck.core.checks.active import ACTIVE_CHECKS

# Combine static + active checks
all_checks = STATIC_CHECKS + ACTIVE_CHECKS
executor = CheckExecutor(all_checks)

# Provide context for active checks
executor.execute_all(
    token,
    target="https://api.example.com",
    pubkey_pem=open("server.pub").read()
)
```

---

## Script Usage

### install.sh — Setup Environment

Automated installation script:

```bash
./scripts/install.sh
```

**What it does:**
- Checks Python version (requires 3.11+)
- Creates virtual environment in `venv/`
- Installs dependencies
- Creates log directories
- Verifies installation
- Runs test suite

**When to use:**
- First time setup
- After cloning the repository
- When dependencies are missing

### check_env.sh — Verify Environment

Check if your environment is ready:

```bash
./scripts/check_env.sh
```

**What it checks:**
- Python version
- Required dependencies
- Project structure
- Log directories
- jwtcheck command availability

**When to use:**
- Troubleshooting installation issues
- Before running tests
- After system updates

### dev.sh — Development Workflow

Development automation script with multiple commands:

```bash
# Run all tests
./scripts/dev.sh test

# Run tests with verbose output
./scripts/dev.sh test-verbose

# Run tests with coverage report
./scripts/dev.sh test-cov

# Run linter
./scripts/dev.sh lint

# Auto-fix linting issues
./scripts/dev.sh lint-fix

# Format code
./scripts/dev.sh format

# Run all checks (lint + test)
./scripts/dev.sh check

# Clean build artifacts
./scripts/dev.sh clean

# Run demo with sample tokens
./scripts/dev.sh demo

# Show help
./scripts/dev.sh help
```

**When to use:**
- During development
- Before committing code
- When preparing a release

---

## CI/CD Integration

### GitHub Actions

```yaml
name: JWT Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install TokenProbe
        run: |
          git clone https://github.com/sumitjhaa/tokenprobe.git
          cd tokenprobe
          pip install -e .
      
      - name: Audit JWT Token
        run: |
          jwtcheck --json ${{ secrets.JWT_TOKEN }} > audit-report.json
          EXIT_CODE=$?
          
          echo "Exit code: $EXIT_CODE"
          cat audit-report.json
          
          if [ $EXIT_CODE -eq 1 ]; then
            echo "❌ Critical or high severity issues found"
            exit 1
          elif [ $EXIT_CODE -eq 2 ]; then
            echo "⚠️  Invalid input"
            exit 1
          else
            echo "✅ No critical issues"
          fi
```

### GitLab CI

```yaml
jwt-audit:
  image: python:3.11
  script:
    - git clone https://github.com/sumitjhaa/tokenprobe.git
    - cd tokenprobe && pip install -e .
    - jwtcheck --json $JWT_TOKEN > audit-report.json
    - |
      if [ $? -eq 1 ]; then
        echo "Security issues found"
        cat audit-report.json
        exit 1
      fi
  artifacts:
    reports:
      - audit-report.json
```

### Exit Codes

- `0` — No critical or high severity findings
- `1` — Critical or high severity findings present
- `2` — Invalid input (malformed token, missing arguments)

**Usage in scripts:**
```bash
jwtcheck --json <token> > report.json
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Token is secure"
elif [ $EXIT_CODE -eq 1 ]; then
    echo "❌ Security issues detected"
    exit 1
else
    echo "⚠️  Invalid input"
    exit 1
fi
```

---

## Troubleshooting

### Command Not Found

**Problem:** `jwtcheck: command not found`

**Solutions:**
```bash
# Activate virtual environment
source venv/bin/activate

# Or reinstall
./scripts/install.sh

# Or run via Python module
python -m jwtcheck.cli <token>
```

### Python Version Error

**Problem:** `Python 3.11+ required`

**Solution:**
```bash
# Check current version
python3 --version

# Install Python 3.11+ (Ubuntu/Debian)
sudo apt-get install python3.11 python3.11-venv

# Or use pyenv
pyenv install 3.11.0
pyenv local 3.11.0
```

### Import Errors

**Problem:** `ModuleNotFoundError: No module named 'jwtcheck'`

**Solution:**
```bash
# Install in development mode
pip install -e .

# Or check you're in the right directory
pwd  # Should be tokenprobe/
ls jwtcheck/  # Should show core/, report/, etc.
```

### Permission Denied on Scripts

**Problem:** `Permission denied` when running scripts

**Solution:**
```bash
chmod +x scripts/*.sh
./scripts/install.sh
```

### Active Checks Safety Gate

**Problem:** `Error: Active checks require all three flags`

**Solution:**
```bash
# You need ALL three flags
jwtcheck --active \
         --target https://api.example.com \
         --i-own-this-system \
         <token>
```

### Logs Not Created

**Problem:** No log files in `logs/` directory

**Solution:**
```bash
# Create logs directory manually
mkdir -p logs

# Run with explicit log directory
jwtcheck --log-dir ./logs <token>

# Check permissions
ls -la logs/
```

### Test Failures

**Problem:** Tests fail after installation

**Solution:**
```bash
# Reinstall dependencies
pip install -e ".[dev]"

# Clear Python cache
./scripts/dev.sh clean

# Run tests with verbose output
./scripts/dev.sh test-verbose

# Check environment
./scripts/check_env.sh
```

### JSON Output Parsing Errors

**Problem:** JSON output contains log messages

**Solution:**
```bash
# Disable file logging for clean JSON
jwtcheck --no-log-file --json <token> > report.json

# Or redirect stderr
jwtcheck --json <token> 2>/dev/null > report.json
```

### Token Decode Errors

**Problem:** `Invalid JWT structure`

**Common causes:**
- Token has whitespace or newlines
- Token is incomplete (missing parts)
- Token uses invalid base64 characters

**Solution:**
```bash
# Clean the token first
echo "<token>" | tr -d '\n' | jwtcheck

# Or validate structure
echo "<token>" | grep -E '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$'
```

---

## Advanced Usage

### Batch Processing

```bash
# Process multiple tokens from file
while read -r token; do
    echo "Analyzing: ${token:0:20}..."
    jwtcheck --json "$token" > "report_$(date +%s).json"
done < tokens.txt
```

### Integration with Other Tools

```bash
# Extract token from HTTP response
curl -s https://api.example.com/login | \
    jq -r '.token' | \
    jwtcheck --json > audit.json

# Analyze tokens from environment
jwtcheck --json "$JWT_TOKEN" > report.json

# Process tokens from Kubernetes secret
kubectl get secret my-secret -o jsonpath='{.data.token}' | \
    base64 -d | \
    jwtcheck
```

### Custom Wordlists

```python
from jwtcheck.core.wordlist import COMMON_SECRETS

# Extend the default wordlist
CUSTOM_SECRETS = COMMON_SECRETS + [
    "my-custom-secret-1",
    "my-custom-secret-2",
]

# Use in active checks
from jwtcheck.core.checks.active import WeakSecretBruteforceCheck
check = WeakSecretBruteforceCheck()
# Note: Custom wordlist support requires code modification
```

---

## Getting Help

```bash
# Show help message
jwtcheck --help

# Show version
jwtcheck --version

# Run demo
./scripts/dev.sh demo

# Check environment
./scripts/check_env.sh
```

**Resources:**
- [GitHub Repository](https://github.com/sumitjhaa/tokenprobe)
- [Issue Tracker](https://github.com/sumitjhaa/tokenprobe/issues)
- [Architecture Documentation](ARCHITECTURE.md)
- [Module Reference](docs/MODULE_REFERENCE.md)

---

## Next Steps

After running your first scan:

1. **Review findings** — Check the severity levels and remediation advice
2. **Fix issues** — Address critical and high severity findings first
3. **Integrate into CI** — Add TokenProbe to your deployment pipeline
4. **Monitor regularly** — Run scans on new tokens before deployment
5. **Contribute** — Found a bug or have a feature request? Open an issue!

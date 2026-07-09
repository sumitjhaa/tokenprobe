# Contributing to jwtcheck

Thank you for your interest in contributing to jwtcheck! This document provides guidelines and information for contributors.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community for security tooling.

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Open a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (Python version, OS)
   - Sample token (if applicable, **redact sensitive data**)

### Suggesting Enhancements

1. Open an issue describing the enhancement
2. Explain the use case and benefits
3. Provide examples if possible

### Submitting Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Run tests and linting**:
   ```bash
   pytest
   ruff check jwtcheck/
   ```
5. **Commit with clear messages**:
   ```bash
   git commit -m "Add new check for XYZ misconfiguration"
   ```
6. **Push and create a PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Python 3.11+
- pip

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/jwtcheck.git
cd jwtcheck

# Install in development mode
pip install -e ".[dev]"

# Verify installation
jwtcheck --version
pytest
```

### Project Structure

```
jwtcheck/
├── core/
│   ├── decoder.py       # JWT decoding
│   ├── findings.py      # Data models
│   └── checks/
│       ├── base.py      # Check protocol
│       ├── static.py    # P0 static checks
│       └── active.py    # P1 active checks
├── report/
│   ├── text_report.py   # Rich output
│   └── json_report.py   # JSON output
├── logging_config.py    # Logging infrastructure
├── cli.py               # CLI entry point
└── tests/               # Test suite
```

## Adding a New Check

### Static Check (P0)

1. **Create the check class** in `jwtcheck/core/checks/static.py`:

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
        _phase.check_start("my_new_check")
        start_time = time.time()
        
        findings = []
        
        # Your check logic here
        if some_condition(token):
            findings.append(
                Finding(
                    check="my_new_check",
                    severity=Severity.MEDIUM,
                    message="Issue detected",
                    remediation="How to fix it",
                    source=CheckSource.STATIC,
                    details="Additional context",
                )
            )
        
        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("my_new_check", len(findings), elapsed_ms)
        return findings
```

2. **Register the check**:

```python
CHECK_REGISTRY.append(MyNewCheck())
```

3. **Add tests** in `jwtcheck/tests/test_checks.py`:

```python
class TestMyNewCheck:
    def test_detects_issue(self):
        token = decode_token(TOKEN_WITH_ISSUE)
        findings = MyNewCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.MEDIUM

    def test_no_false_positive(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = MyNewCheck().run(token)
        assert len(findings) == 0
```

4. **Create a test fixture** in `jwtcheck/tests/fixtures/tokens.py`:

```python
MY_ISSUE_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {"sub": "test", "custom_claim": "bad_value"},
)
```

### Active Check (P1)

Same pattern, but in `jwtcheck/core/checks/active.py` and `ACTIVE_CHECK_REGISTRY`.

**Important:** Active checks must:
- Require explicit opt-in (safety gates)
- Be read-only (no mutations)
- Handle network errors gracefully
- Log all operations

## Code Style

### Python Style

- Follow PEP 8
- Use type hints
- Keep functions pure (no side effects) where possible
- Maximum line length: 100 characters

### Formatting

Use `ruff` for linting:

```bash
ruff check jwtcheck/
ruff check --fix jwtcheck/  # Auto-fix issues
```

### Documentation

- Docstrings for all public functions/classes
- Inline comments for complex logic
- Update README.md for user-facing changes
- Update ARCHITECTURE.md for design changes

## Testing

### Running Tests

```bash
# All tests
pytest

# Verbose output
pytest -v

# With coverage
pytest --cov=jwtcheck

# Specific test file
pytest jwtcheck/tests/test_checks.py
```

### Test Coverage

- Aim for >90% coverage
- Test both positive and negative cases
- Test edge cases (malformed input, unicode, etc.)
- Ensure zero false positives on gold standard token

### Test Fixtures

- Use hand-crafted tokens for predictability
- Document what each fixture tests
- Include both triggering and non-triggering cases

## Logging

All checks should use the phase logger:

```python
from jwtcheck.logging_config import PhaseLogger

_phase = PhaseLogger("my_component")

def run(self, token):
    _phase.check_start("my_check")
    start_time = time.time()
    
    # Check logic
    
    elapsed_ms = (time.time() - start_time) * 1000
    _phase.check_end("my_check", len(findings), elapsed_ms)
```

## Pull Request Process

1. **Ensure all tests pass**:
   ```bash
   pytest
   ruff check jwtcheck/
   ```

2. **Update documentation**:
   - README.md for user-facing changes
   - ARCHITECTURE.md for design changes
   - Inline code comments

3. **Add changelog entry** (if applicable):
   - Describe the change
   - Link to the issue/PR

4. **Request review**:
   - Tag maintainers
   - Provide context in the PR description

5. **Address feedback**:
   - Respond to comments
   - Make requested changes
   - Push updates to the same branch

## Release Process

Releases are managed by maintainers:

1. Update version in `pyproject.toml`
2. Update CHANGELOG.md
3. Create a release tag
4. Build and publish to PyPI

## Questions?

- Open a GitHub issue
- Check existing documentation (README, ARCHITECTURE, SECURITY)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to jwtcheck! 🛡️

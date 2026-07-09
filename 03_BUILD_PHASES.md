# Build Phases — JWT Misconfiguration Checker

Estimated total: 4–7 focused evenings. Each phase ends in something runnable — don't move on until it does.

## Phase 0 — Setup (30 min)
- [ ] `uv init` or `poetry new` project, `pyproject.toml` with metadata
- [ ] Install `pyjwt`, `cryptography`, `click`, `rich`, `pytest`
- [ ] Repo skeleton per TRD §2, empty `__init__.py` files
- [ ] GitHub Actions workflow: lint (`ruff`) + test (`pytest`) on push
- **Done when:** `pytest` runs (even with 0 tests) and CI is green.

## Phase 1 — Decoder + Findings core (1 evening)
- [ ] `decoder.py`: split token, base64-decode header/payload, handle malformed input gracefully
- [ ] `findings.py`: `Finding` and `Severity` dataclasses, `Report` aggregator with sort-by-severity
- [ ] Unit tests: valid token decodes correctly, malformed token raises a clear error
- **Done when:** you can decode a real token from jwt.io into a Python object and print it.

## Phase 2 — Static checks (P0) (1–2 evenings)
- [ ] Implement each check in the P0 table (TRD §4) as an isolated pure function
- [ ] `CHECK_REGISTRY` list that the CLI iterates over
- [ ] Build the 15+ fixture tokens (one per check, plus the gold-standard clean token)
- [ ] Unit test every check against its fixture
- **Done when:** all P0 checks pass their fixture tests, gold-standard token returns zero findings.

## Phase 3 — CLI + reporting (1 evening)
- [ ] `cli.py` with `click`: `jwtcheck <token>`, `--json`, accept token via arg or stdin
- [ ] `text_report.py`: rich-formatted colored severity output
- [ ] `json_report.py`: matches TRD §6 schema exactly
- [ ] Exit code logic (0 clean, 1 if Critical/High present)
- **Done when:** `jwtcheck <token>` and `jwtcheck <token> --json` both work end-to-end from the terminal.

## Phase 4 — Active checks (P1) (1 evening, optional but high resume value)
- [ ] `wordlist.py` with ~50 common weak secrets
- [ ] `weak_secret_bruteforce` check
- [ ] `alg_confusion_probe` — fetch JWKS or accept `--pubkey`, re-sign, POST to target
- [ ] Safety gate: refuse to run without `--active --target --i-own-this-system` all three present
- **Done when:** brute-force check correctly identifies a token signed with a wordlist secret, and correctly reports "not found" for a strong secret.

## Phase 5 — Polish, docs, ship (1 evening)
- [ ] README: problem statement, install, 3 copy-pasteable demo commands, screenshot/GIF of output
- [ ] Publish to PyPI (`jwtcheck`)
- [ ] Add a GitHub Action example (`uses: jwtcheck-action` style snippet) even if not a real published Action yet
- [ ] Write a 3–5 sentence "why I built this" note for your resume/portfolio page
- **Done when:** a stranger can `pip install jwtcheck`, run the README's first command, and see a real finding — with zero help from you.

## Definition of Done (project-level)
1. All P0 checks implemented and tested against fixtures.
2. Gold-standard clean token produces zero findings (no false positives).
3. README demo works copy-paste, start to finish, in under 2 minutes.
4. Published (PyPI + public GitHub repo) — not just local.

Stop here. P1 active checks and P2 stretch items (GitHub Action, JWE support, config file) are genuinely optional — a clean, well-tested P0 tool with a good README is already a strong portfolio piece. Don't let stretch scope delay shipping.

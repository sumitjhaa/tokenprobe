import SectionHeader from "./SectionHeader";
import DocsCard from "./DocsCard";
import CodeBlock from "./CodeBlock";

export default function CICDSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="ci-cd" icon="rocket" label="CI/CD Integration" />
      <div style={{ paddingLeft: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          Integrating TokenProbe into your CI/CD pipeline ensures that JWT misconfigurations are caught before they
          reach production. The CLI supports multiple output formats and exit code conventions designed for automation.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <DocsCard icon="github" title="GitHub Actions">
            <CodeBlock>{`name: JWT Security Check
on: [push, pull_request]
jobs:
  token-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install TokenProbe
        run: pip install tokenprobe
      - name: Audit sample tokens
        run: |
          tokenprobe --json $(cat test/fixtures/bad_token.jwt) \\
            | jq '.findings[] | select(.severity == "Critical" or .severity == "High")'
          if [ $? -eq 0 ]; then exit 1; fi`}</CodeBlock>
          </DocsCard>
          <DocsCard icon="terminal" title="Pre-commit Hook">
            <CodeBlock>{`#!/bin/bash
for file in $(git diff --cached --name-only); do
  if [[ "$file" == *.jwt ]] || [[ "$file" == *.token ]]; then
    tokenprobe --json "$file" | jq -e '.severity_counts.critical == 0 and .severity_counts.high == 0'
    if [ $? -ne 0 ]; then
      echo "FAIL: $file contains critical/high findings"
      exit 1
    fi
  fi
done`}</CodeBlock>
          </DocsCard>
          <DocsCard icon="gitBranch" title="GitLab CI / Jenkins / CircleCI">
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              The same pattern applies to any CI system: install via pip, run <code>tokenprobe --json</code> on your test tokens, and fail the build if any findings exceed your threshold. The JSON output includes <code>severity_counts</code> for easy assertion.
            </div>
          </DocsCard>
        </div>
      </div>
    </section>
  );
}

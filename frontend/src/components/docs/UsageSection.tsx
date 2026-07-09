import SectionHeader from "./SectionHeader";
import DocsCard from "./DocsCard";
import CodeBlock from "./CodeBlock";

export default function UsageSection() {
  return (
    <section style={{ marginBottom: "4rem" }}>
      <SectionHeader id="usage" icon="terminal" label="CLI & Python Library" />
      <div style={{ paddingLeft: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <DocsCard icon="terminal" title="CLI Usage" desc="The CLI provides the fastest path to a security report. Pipe or pass a token directly.">
            <CodeBlock>{`# Analyze a single token
tokenprobe eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

# Read from stdin
echo $TOKEN | tokenprobe

# JSON output for tooling
tokenprobe --json $TOKEN

# Active checks against endpoint
tokenprobe --endpoint https://api.example.com/verify $TOKEN

# Batch analysis from file
tokenprobe --file tokens.txt

# With custom config
tokenprobe --config tokenprobe.toml $TOKEN`}</CodeBlock>
          </DocsCard>
          <DocsCard icon="download" title="Python Library" desc="Integrate TokenProbe directly into your Python applications and test suites.">
            <CodeBlock>{`from tokenprobe import analyze

result = analyze("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")

for finding in result.findings:
    print(f"[{finding.severity}] {finding.message}")
    print(f"  Remediation: {finding.remediation}")

# With custom configuration
result = analyze(token, config_path="./tokenprobe.toml")`}</CodeBlock>
          </DocsCard>
          <DocsCard icon="cog" title="CLI Options Reference">
            <CodeBlock>{`Usage: tokenprobe [OPTIONS] [TOKEN]

Options:
  --json                Output results in JSON format
  --endpoint URL        URL for active checks
  --config FILE         Path to TOML configuration file
  --file FILE           Read tokens from file (one per line)
  --bruteforce          Enable weak HMAC secret brute-force
  --version             Show version and exit
  --help                Show help message and exit`}</CodeBlock>
          </DocsCard>
        </div>
      </div>
    </section>
  );
}

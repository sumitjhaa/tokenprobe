"""
Command-line interface for jwtcheck.

Provides user-friendly CLI for analyzing JWT tokens.
"""

from __future__ import annotations

import sys
from pathlib import Path

import click
from rich.console import Console

from jwtcheck import __version__
from jwtcheck.core.checks.active import ACTIVE_CHECKS
from jwtcheck.core.checks.engine import CheckExecutor, CheckRegistry
from jwtcheck.core.checks.static import STATIC_CHECKS
from jwtcheck.core.config import (
    TokenProbeConfig,
    apply_severity_overrides,
    build_config_checks,
    filter_checks_by_config,
    load_config,
)
from jwtcheck.core.decoder import DecodeError, decode_token
from jwtcheck.core.findings import Report
from jwtcheck.logging_config import PhaseLogger, setup_logging
from jwtcheck.report.json_report import render_json_report
from jwtcheck.report.text_report import render_text_report

_phase = PhaseLogger("cli")


def _build_registry(active: bool = False, config: TokenProbeConfig | None = None) -> CheckRegistry:
    """Build check registry based on flags and config."""
    registry = CheckRegistry()

    # Start with static checks
    checks = list(STATIC_CHECKS)

    # Add active checks if enabled
    if active:
        checks.extend(ACTIVE_CHECKS)

    # Add config-based checks if config provided
    if config:
        checks.extend(build_config_checks(config))
        checks = filter_checks_by_config(checks, config)

    # Register all checks
    for check in checks:
        registry.register(check)

    return registry


@click.command()
@click.argument("token", required=False)
@click.option("--json", "output_json", is_flag=True, help="Output as JSON")
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose logging")
@click.option("--log-dir", type=click.Path(path_type=Path), help="Custom log directory")
@click.option("--no-log-file", is_flag=True, help="Disable file logging")
@click.option("--active", is_flag=True, help="Enable active checks")
@click.option("--target", type=str, help="Target endpoint for active checks")
@click.option("--i-own-this-system", is_flag=True, help="Confirm authorization")
@click.option("--pubkey", type=click.Path(exists=True), help="RSA public key PEM file")
@click.option("--config", "config_path", type=click.Path(exists=True), help="Config file (TOML)")
@click.option("--batch", is_flag=True, help="Batch mode: TOKEN is a file path with multiple tokens")
@click.option("--batch-output", type=click.Path(path_type=Path), help="Save batch results to file")
@click.version_option(version=__version__, prog_name="jwtcheck")
def main(
    token: str | None,
    output_json: bool,
    verbose: bool,
    log_dir: Path | None,
    no_log_file: bool,
    active: bool,
    target: str | None,
    i_own_this_system: bool,
    pubkey: str | None,
    config_path: str | None,
    batch: bool,
    batch_output: Path | None,
) -> None:
    """
    JWT Misconfiguration Checker - Audit JWT tokens for security issues.

    TOKEN is the JWT to analyze. If not provided, reads from stdin.

    Examples:

        jwtcheck eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

        echo $JWT_TOKEN | jwtcheck

        jwtcheck --json $JWT_TOKEN > report.json

        jwtcheck --active --target https://api.example.com/auth --i-own-this-system $JWT_TOKEN
    """
    _phase.start("CLI invocation", version=__version__)

    if active and (not target or not i_own_this_system):
        console = Console()
        console.print("[bold red]Error:[/bold red] Active checks require:", style="bold")
        console.print("  --active --target <url> --i-own-this-system")
        console.print()
        console.print("[yellow]Warning:[/yellow] Only use on systems you own.")
        _phase.end("Safety gate failed", success=False)
        sys.exit(2)

    log_to_file = not no_log_file
    setup_logging(verbose=verbose, log_to_file=log_to_file, log_dir=log_dir)

    console = Console()

    # Load config if provided
    config = None
    if config_path:
        try:
            config = load_config(config_path)
            _phase.info("Config loaded", path=config_path)
        except Exception as e:
            console.print(f"[red]Error loading config:[/red] {e}")
            _phase.end("Config load failed", success=False, error=e)
            sys.exit(2)

    # Batch mode
    if batch:
        if token is None:
            console.print("[red]Error:[/red] Batch mode requires a file path.", style="bold")
            _phase.end("No batch file", success=False)
            sys.exit(2)

        from jwtcheck.core.batch import load_tokens_from_file, process_batch, save_batch_result

        try:
            file_path = Path(token)
            tokens = load_tokens_from_file(file_path)

            if not tokens:
                console.print("[yellow]Warning:[/yellow] No tokens found in file.")
                _phase.end("Empty batch file", success=False)
                sys.exit(0)

            pubkey_pem = None
            if pubkey:
                with open(pubkey) as f:
                    pubkey_pem = f.read()

            _phase.info("Starting batch processing", token_count=len(tokens))
            result = process_batch(tokens, active, target, pubkey_pem, config)

            # Save to file if requested
            if batch_output:
                save_batch_result(result, batch_output)
                console.print(f"[green]✓[/green] Batch results saved to {batch_output}")

            # Output summary
            if output_json:
                import json
                console.print(json.dumps(result.to_dict(), indent=2))
            else:
                console.print()
                console.print("[bold]Batch Processing Summary[/bold]")
                console.print(f"  Total tokens:    {result.total_tokens}")
                console.print(f"  Processed:       {result.processed_tokens}")
                console.print(f"  Failed:          {len(result.errors)}")
                console.print(f"  Success rate:    {result.success_rate:.1f}%")
                console.print(f"  Total findings:  {result.total_findings}")
                console.print()

                severity = result.severity_summary
                console.print("[bold]Severity Breakdown:[/bold]")
                console.print(f"  Critical: {severity['critical']}")
                console.print(f"  High:     {severity['high']}")
                console.print(f"  Medium:   {severity['medium']}")
                console.print(f"  Low:      {severity['low']}")
                console.print(f"  Info:     {severity['info']}")

                if result.errors:
                    console.print()
                    console.print("[bold red]Errors:[/bold red]")
                    for err in result.errors:
                        console.print(f"  Token: {err['token']}")
                        console.print(f"  Error: {err['error']}")

            # Exit code based on findings
            has_critical_or_high = severity["critical"] > 0 or severity["high"] > 0
            exit_code = 1 if has_critical_or_high else 0

            _phase.end("Batch complete", exit_code=exit_code)
            sys.exit(exit_code)

        except Exception as e:
            console.print(f"[red]Error in batch mode:[/red] {e}")
            _phase.end("Batch failed", success=False, error=e)
            sys.exit(2)

    # Single token mode
    if token is None:
        if sys.stdin.isatty():
            console.print("[red]Error:[/red] No token provided.", style="bold")
            console.print("Run [bold]jwtcheck --help[/bold] for usage.")
            _phase.end("No token", success=False)
            sys.exit(2)
        token = sys.stdin.read().strip()

    if not token:
        console.print("[red]Error:[/red] Empty token.", style="bold")
        _phase.end("Empty token", success=False)
        sys.exit(2)

    report = Report()

    try:
        _phase.info("Decoding token", length=len(token))
        decoded = decode_token(token)
        report.token_valid_structure = True

        registry = _build_registry(active=active, config=config)
        executor = CheckExecutor(registry.all_checks())

        context = {}
        if active:
            context["target"] = target
            if pubkey:
                with open(pubkey) as f:
                    context["pubkey_pem"] = f.read()

        _phase.info("Executing checks", count=len(registry))
        executor.execute_all(decoded, **context)

        # Get findings and apply severity overrides if config provided
        findings = executor.all_findings
        if config:
            findings = apply_severity_overrides(findings, config)

        for finding in findings:
            report.add_finding(finding)

        if executor.failed_checks:
            _phase.info("Failed checks", count=len(executor.failed_checks))
            for failed in executor.failed_checks:
                console.print(
                    f"[yellow]Warning:[/yellow] Check '{failed.check_name}' failed: {failed.error_message}"
                )

        report.finalize()

    except DecodeError as e:
        _phase.end("Decode failed", success=False, error=str(e))
        report.token_valid_structure = False
        report.error = str(e)
        report.finalize()

    except Exception as e:
        _phase.end("Unexpected error", success=False, error=str(e))
        from jwtcheck.logging_config import ErrorLogger
        ErrorLogger("cli").critical("Unexpected error", error=e)
        report.token_valid_structure = False
        report.error = f"Unexpected error: {e}"
        report.finalize()

    _phase.info("Rendering report", format="json" if output_json else "text")

    if output_json:
        render_json_report(report)
    else:
        render_text_report(report, console)

    _phase.end("Complete", exit_code=report.exit_code)
    sys.exit(report.exit_code)


if __name__ == "__main__":
    main()

"""
Command-line interface for jwtcheck.

Provides a user-friendly CLI for analyzing JWT tokens with options for:
- Token input (argument or stdin)
- Output format (text or JSON)
- Verbose logging
- Custom log directory
"""

from __future__ import annotations

import sys
from pathlib import Path

import click
from rich.console import Console

from jwtcheck import __version__
from jwtcheck.core.decoder import DecodeError, decode_token
from jwtcheck.core.findings import Report
from jwtcheck.logging_config import PhaseLogger, setup_logging
from jwtcheck.report.json_report import render_json_report
from jwtcheck.report.text_report import render_text_report

_phase = PhaseLogger("cli")


@click.command()
@click.argument("token", required=False)
@click.option(
    "--json",
    "output_json",
    is_flag=True,
    help="Output results as JSON instead of formatted text",
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Enable verbose logging output",
)
@click.option(
    "--log-dir",
    type=click.Path(path_type=Path),
    help="Custom directory for log files (default: ./logs/)",
)
@click.option(
    "--no-log-file",
    is_flag=True,
    help="Disable logging to files (console only)",
)
@click.option(
    "--active",
    is_flag=True,
    help="Enable active checks (requires --target and --i-own-this-system)",
)
@click.option(
    "--target",
    type=str,
    help="Target endpoint URL for active checks",
)
@click.option(
    "--i-own-this-system",
    is_flag=True,
    help="Confirm you own or have permission to test the target system",
)
@click.option(
    "--pubkey",
    type=click.Path(exists=True),
    help="Path to RSA public key PEM file (for algorithm confusion probe)",
)
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
) -> None:
    """
    JWT Misconfiguration Checker - Audit JWT tokens for security issues.

    TOKEN is the JWT token to analyze. If not provided, reads from stdin.

    Examples:

        jwtcheck eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

        echo $JWT_TOKEN | jwtcheck

        jwtcheck --json $JWT_TOKEN > report.json

        jwtcheck --active --target https://api.example.com/auth --i-own-this-system $JWT_TOKEN
    """
    _phase.start("CLI invocation", version=__version__)

    # Validate active check safety gates
    if active and (not target or not i_own_this_system):
        console = Console()
        console.print(
            "[bold red]Error:[/bold red] Active checks require all three flags:",
            style="bold",
        )
        console.print("  --active --target <url> --i-own-this-system")
        console.print()
        console.print(
            "[yellow]Warning:[/yellow] Active checks probe a live endpoint. "
            "Only use on systems you own or have explicit permission to test."
        )
        _phase.end("Active check safety gate failed", success=False)
        sys.exit(2)

    # Setup logging
    log_to_file = not no_log_file
    setup_logging(verbose=verbose, log_to_file=log_to_file, log_dir=log_dir)

    console = Console()

    # Get token from argument or stdin
    if token is None:
        if sys.stdin.isatty():
            console.print(
                "[red]Error:[/red] No token provided. Pass token as argument or via stdin.",
                style="bold",
            )
            console.print("Run [bold]jwtcheck --help[/bold] for usage information.")
            _phase.end("No token provided", success=False)
            sys.exit(2)
        token = sys.stdin.read().strip()

    if not token:
        console.print("[red]Error:[/red] Empty token provided.", style="bold")
        _phase.end("Empty token", success=False)
        sys.exit(2)

    # Decode and analyze
    report = Report()

    try:
        _phase.info("Decoding token", length=len(token))
        decoded = decode_token(token)
        report.token_valid_structure = True

        _phase.info("Running static checks")
        from jwtcheck.core.checks.static import run_all_static_checks
        findings = run_all_static_checks(decoded)

        for finding in findings:
            report.add_finding(finding)

        # Run active checks if enabled
        if active:
            _phase.info("Running active checks", target=target)
            from jwtcheck.core.checks.active import run_all_active_checks

            pubkey_pem = None
            if pubkey:
                with open(pubkey) as f:
                    pubkey_pem = f.read()

            active_findings = run_all_active_checks(
                decoded, target=target, pubkey_pem=pubkey_pem
            )
            for finding in active_findings:
                report.add_finding(finding)

        report.finalize()

    except DecodeError as e:
        _phase.end("Token decode failed", success=False, error=str(e))
        report.token_valid_structure = False
        report.error = str(e)
        report.finalize()

    except Exception as e:
        _phase.end("Unexpected error", success=False, error=str(e))
        from jwtcheck.logging_config import ErrorLogger
        error_logger = ErrorLogger("cli")
        error_logger.critical("Unexpected error during analysis", error=e)

        report.token_valid_structure = False
        report.error = f"Unexpected error: {e}"
        report.finalize()

    # Render output
    _phase.info("Rendering report", format="json" if output_json else "text")

    if output_json:
        render_json_report(report)
    else:
        render_text_report(report, console)

    _phase.end("Analysis complete", exit_code=report.exit_code)

    sys.exit(report.exit_code)


if __name__ == "__main__":
    main()

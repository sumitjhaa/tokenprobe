"""
Human-readable report generation using Rich library.

Produces formatted, colored terminal output with severity-based styling,
structured layout, and clear remediation guidance.
"""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from tokenprobe.core.findings import Report, Severity
from tokenprobe.logging_config import PhaseLogger

_phase = PhaseLogger("text_report")

SEVERITY_STYLES = {
    Severity.CRITICAL: ("bold white on red", "CRITICAL"),
    Severity.HIGH: ("bold red", "HIGH"),
    Severity.MEDIUM: ("yellow", "MEDIUM"),
    Severity.LOW: ("blue", "LOW"),
    Severity.INFO: ("dim cyan", "INFO"),
}


def render_text_report(report: Report, console: Console | None = None) -> None:
    """
    Render a human-readable report to the console.

    Args:
        report: The analysis report to render.
        console: Optional Rich console (creates one if not provided).
    """
    _phase.start("Rendering text report", findings_count=len(report.findings))

    if console is None:
        console = Console()

    if not report.token_valid_structure:
        _render_error_report(report, console)
        _phase.end("Error report rendered", success=True)
        return

    _render_header(console, report)

    if not report.findings:
        _render_clean_report(console)
    else:
        _render_findings(console, report)

    _render_summary(console, report)
    _render_footer(console, report)

    _phase.end("Text report rendered", success=True)


def _render_error_report(report: Report, console: Console) -> None:
    """Render an error report for invalid tokens."""
    error_panel = Panel(
        f"[bold red]Error:[/bold red] {report.error}",
        title="[bold red]Token Decode Failed[/bold red]",
        border_style="red",
        padding=(1, 2),
    )
    console.print()
    console.print(error_panel)
    console.print()


def _render_header(console: Console, report: Report) -> None:
    """Render the report header."""
    console.print()
    header = Text("JWT Security Analysis Report", style="bold cyan")
    console.print(header, justify="center")
    console.print("━" * 60, style="dim")
    console.print()


def _render_clean_report(console: Console) -> None:
    """Render a clean report when no findings exist."""
    clean_panel = Panel(
        "[bold green]✓ No security issues detected[/bold green]\n\n"
        "This token follows JWT best practices.",
        title="[bold green]All Clear[/bold green]",
        border_style="green",
        padding=(1, 2),
    )
    console.print(clean_panel)
    console.print()


def _render_findings(console: Console, report: Report) -> None:
    """Render the findings table."""
    console.print(f"[bold]Found {len(report.findings)} security issue(s):[/bold]")
    console.print()

    for i, finding in enumerate(report.findings, 1):
        _render_single_finding(console, finding, i)


def _render_single_finding(console: Console, finding, index: int) -> None:
    """Render a single finding with styling."""
    style, label = SEVERITY_STYLES[finding.severity]

    finding_table = Table.grid(padding=(0, 2))
    finding_table.add_column(style="bold", width=12)
    finding_table.add_column()

    finding_table.add_row(
        f"[{style}]● {label}[/{style}]",
        f"[bold]{finding.check}[/bold]",
    )
    finding_table.add_row("", finding.message)

    if finding.details:
        finding_table.add_row("", f"[dim]{finding.details}[/dim]")

    finding_table.add_row("", "")
    finding_table.add_row(
        "[dim]Fix:[/dim]",
        f"[green]{finding.remediation}[/green]",
    )

    panel = Panel(
        finding_table,
        border_style=style.split()[-1] if "on" not in style else "red",
        padding=(0, 1),
    )

    console.print(panel)
    console.print()


def _render_summary(console: Console, report: Report) -> None:
    """Render the summary table."""
    summary_table = Table(title="Summary", show_header=True, header_style="bold")
    summary_table.add_column("Severity", style="bold")
    summary_table.add_column("Count", justify="right")

    summary_table.add_row(
        "[bold red]CRITICAL[/bold red]",
        str(report.summary.critical),
    )
    summary_table.add_row(
        "[red]HIGH[/red]",
        str(report.summary.high),
    )
    summary_table.add_row(
        "[yellow]MEDIUM[/yellow]",
        str(report.summary.medium),
    )
    summary_table.add_row(
        "[blue]LOW[/blue]",
        str(report.summary.low),
    )
    summary_table.add_row(
        "[cyan]INFO[/cyan]",
        str(report.summary.info),
    )
    summary_table.add_row(
        "[bold]Total[/bold]",
        f"[bold]{report.summary.total}[/bold]",
    )

    console.print(summary_table)
    console.print()


def _render_footer(console: Console, report: Report) -> None:
    """Render the footer with exit code info."""
    if report.exit_code == 0:
        footer_text = "[green]Exit code: 0 (no critical/high issues)[/green]"
    else:
        footer_text = "[red]Exit code: 1 (critical/high issues found)[/red]"

    console.print(footer_text, justify="center")
    console.print("━" * 60, style="dim")
    console.print()

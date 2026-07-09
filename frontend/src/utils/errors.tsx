import { Component, type ReactNode } from "react";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getErrorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "An unexpected error occurred";
}

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.75rem",
          padding: "1rem", margin: "1rem",
          background: "var(--danger-soft)", color: "var(--danger)",
          borderRadius: "0.75rem", border: "1px solid var(--danger)"
        }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Something went wrong</p>
            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

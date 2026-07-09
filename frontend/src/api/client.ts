import type { AnalyzeResult, BatchResponse, ConfigSchema } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}

export async function analyzeToken(token: string, config?: string): Promise<AnalyzeResult> {
  return request<AnalyzeResult>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ token, config }),
  });
}

export async function analyzeJwe(token: string, config?: string): Promise<AnalyzeResult> {
  return request<AnalyzeResult>("/api/analyze/jwe", {
    method: "POST",
    body: JSON.stringify({ token, config }),
  });
}

export async function analyzeBatch(file: File): Promise<BatchResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/analyze/batch`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `Batch failed: ${res.status}`);
  }
  return res.json();
}

export async function getConfigSchema(): Promise<ConfigSchema> {
  return request<ConfigSchema>("/api/config/schema");
}

export async function validateConfig(config: string): Promise<{ valid: boolean; error: string | null }> {
  return request("/api/config/validate", {
    method: "POST",
    body: JSON.stringify({ config }),
  });
}

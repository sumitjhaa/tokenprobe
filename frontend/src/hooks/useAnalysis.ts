import { useState } from "react";
import { analyzeToken } from "../api/client";
import type { AnalyzeResult } from "../types";

export function useAnalysis() {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (token: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeToken(token);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, analyze, reset };
}

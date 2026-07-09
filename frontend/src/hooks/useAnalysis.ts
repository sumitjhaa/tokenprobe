import { useCallback } from "react";
import { useApi } from "./useApi";
import { analyzeToken } from "../api/client";
import type { AnalyzeResult } from "../types";

export function useAnalysis() {
  const { data, loading, error, execute, reset } = useApi<AnalyzeResult>();

  const analyze = useCallback(
    (token: string) => execute(() => analyzeToken(token)),
    [execute],
  );

  return { result: data, loading, error, analyze, reset };
}

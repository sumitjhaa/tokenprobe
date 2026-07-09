import { useState, useCallback } from "react";

const STORAGE_KEY = "tokenprobe-recent";
const MAX_ITEMS = 10;

export interface RecentToken {
  id: string;
  token: string;
  preview: string;
  timestamp: number;
}

function load(): RecentToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: RecentToken[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useRecentTokens() {
  const [recent, setRecent] = useState<RecentToken[]>(load);

  const addToken = useCallback((token: string) => {
    const preview = token.length > 48 ? token.slice(0, 48) + "..." : token;
    const entry: RecentToken = {
      id: crypto.randomUUID(),
      token,
      preview,
      timestamp: Date.now(),
    };
    setRecent((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recent, addToken, clearRecent };
}

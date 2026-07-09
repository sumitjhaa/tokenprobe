import { useState, useEffect, useCallback } from "react";

export interface ThemeConfig {
  family: "catppuccin" | "cyberpunk";
  variant: string;
  label: string;
}

const DEFAULT_THEME: ThemeConfig = {
  family: "catppuccin",
  variant: "latte",
  label: "Catppuccin Latte",
};

function getInitial(): ThemeConfig {
  try {
    const stored = localStorage.getItem("theme-config");
    if (stored) return JSON.parse(stored) as ThemeConfig;
  } catch {}
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark
    ? { family: "catppuccin", variant: "mocha", label: "Catppuccin Mocha" }
    : DEFAULT_THEME;
}

export const THEMES: { family: "catppuccin" | "cyberpunk"; label: string; variants: { id: string; label: string; color: string }[] }[] = [
  {
    family: "catppuccin",
    label: "Catppuccin",
    variants: [
      { id: "latte", label: "Latte", color: "#eff1f5" },
      { id: "frappe", label: "Frappé", color: "#303446" },
      { id: "macchiato", label: "Macchiato", color: "#24273a" },
      { id: "mocha", label: "Mocha", color: "#11111b" },
    ],
  },
  {
    family: "cyberpunk",
    label: "Cyberpunk",
    variants: [
      { id: "neon", label: "Neon", color: "#0a0a0f" },
      { id: "dusk", label: "Dusk", color: "#0d0b15" },
      { id: "frost", label: "Frost", color: "#0a0e1a" },
    ],
  },
];

export function useTheme() {
  const [config, setConfig] = useState<ThemeConfig>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", config.family);
    root.setAttribute("data-variant", config.variant);
    localStorage.setItem("theme-config", JSON.stringify(config));
  }, [config]);

  const setTheme = useCallback((family: "catppuccin" | "cyberpunk", variant: string) => {
    const map: Record<string, Record<string, string>> = {
      catppuccin: { latte: "Catppuccin Latte", frappe: "Catppuccin Frappé", macchiato: "Catppuccin Macchiato", mocha: "Catppuccin Mocha" },
      cyberpunk: { neon: "Cyberpunk Neon", dusk: "Cyberpunk Dusk", frost: "Cyberpunk Frost" },
    };
    setConfig({ family, variant, label: map[family]?.[variant] || `${family} ${variant}` });
  }, []);

  return { theme: config, setTheme };
}

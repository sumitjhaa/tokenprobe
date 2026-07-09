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

export interface ThemeVariant {
  id: string;
  label: string;
  bg: string;
  accent: string;
  text: string;
}

export const THEMES: { family: "catppuccin" | "cyberpunk"; label: string; variants: ThemeVariant[] }[] = [
  {
    family: "catppuccin",
    label: "Catppuccin",
    variants: [
      { id: "latte", label: "Latte", bg: "#eff1f5", accent: "#1e66f5", text: "#4c4f69" },
      { id: "frappe", label: "Frappé", bg: "#303446", accent: "#8caaee", text: "#c6d0f5" },
      { id: "macchiato", label: "Macchiato", bg: "#24273a", accent: "#8aadf4", text: "#cad3f5" },
      { id: "mocha", label: "Mocha", bg: "#11111b", accent: "#89b4fa", text: "#cdd6f4" },
    ],
  },
  {
    family: "cyberpunk",
    label: "Cyberpunk",
    variants: [
      { id: "neon", label: "Neon", bg: "#0a0a0f", accent: "#00ff41", text: "#e0e0ff" },
      { id: "dusk", label: "Dusk", bg: "#0d0b15", accent: "#ff6b6b", text: "#e8d8ff" },
      { id: "frost", label: "Frost", bg: "#0a0e1a", accent: "#00d4ff", text: "#d0e4ff" },
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

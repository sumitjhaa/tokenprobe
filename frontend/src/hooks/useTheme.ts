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
      { id: "latte-mauve", label: "Latte Mauve", bg: "#eff1f5", accent: "#8839ef", text: "#4c4f69" },
      { id: "frappe", label: "Frappe", bg: "#303446", accent: "#8caaee", text: "#c6d0f5" },
      { id: "frappe-mauve", label: "Frappe Mauve", bg: "#303446", accent: "#ca9ee6", text: "#c6d0f5" },
      { id: "macchiato", label: "Macchiato", bg: "#24273a", accent: "#8aadf4", text: "#cad3f5" },
      { id: "macchiato-mauve", label: "Macchiato Mauve", bg: "#24273a", accent: "#c6a0f6", text: "#cad3f5" },
      { id: "mocha", label: "Mocha", bg: "#11111b", accent: "#89b4fa", text: "#cdd6f4" },
      { id: "mocha-mauve", label: "Mocha Mauve", bg: "#11111b", accent: "#cba6f7", text: "#cdd6f4" },
    ],
  },
  {
    family: "cyberpunk",
    label: "Cyberpunk",
    variants: [
      { id: "neon", label: "Neon", bg: "#0a0a0f", accent: "#00ff41", text: "#e0e0ff" },
      { id: "dusk", label: "Dusk", bg: "#0d0b15", accent: "#ff6b6b", text: "#e8d8ff" },
      { id: "frost", label: "Frost", bg: "#0a0e1a", accent: "#00d4ff", text: "#d0e4ff" },
      { id: "amber", label: "Amber", bg: "#0b0806", accent: "#ff9100", text: "#ffe0b2" },
      { id: "synthwave", label: "Synthwave", bg: "#0b0518", accent: "#ff00ff", text: "#e8d0ff" },
      { id: "blood", label: "Blood", bg: "#0a0406", accent: "#ff1744", text: "#ffcdd2" },
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
      catppuccin: {
        latte: "Catppuccin Latte", "latte-mauve": "Catppuccin Latte Mauve",
        frappe: "Catppuccin Frappe", "frappe-mauve": "Catppuccin Frappe Mauve",
        macchiato: "Catppuccin Macchiato", "macchiato-mauve": "Catppuccin Macchiato Mauve",
        mocha: "Catppuccin Mocha", "mocha-mauve": "Catppuccin Mocha Mauve",
      },
      cyberpunk: {
        neon: "Cyberpunk Neon", dusk: "Cyberpunk Dusk", frost: "Cyberpunk Frost",
        amber: "Cyberpunk Amber", synthwave: "Cyberpunk Synthwave", blood: "Cyberpunk Blood",
      },
    };
    setConfig({ family, variant, label: map[family]?.[variant] || `${family} ${variant}` });
  }, []);

  return { theme: config, setTheme };
}

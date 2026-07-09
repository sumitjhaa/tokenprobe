import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";
import { THEMES } from "../hooks/useTheme";
import type { ThemeConfig } from "../hooks/useTheme";

interface Props {
  current: ThemeConfig;
  onSelect: (family: "catppuccin" | "cyberpunk", variant: string) => void;
  onClose: () => void;
}

export default function ThemeModal({ current, onSelect, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: "24rem", maxWidth: "calc(100vw - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>Theme</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {THEMES.map((group) => (
          <div key={group.family} className="mb-4">
            <p style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              {group.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {group.variants.map((v) => {
                const isActive = current.family === group.family && current.variant === v.id;
                return (
                  <button
                    key={v.id}
                    className={cn("theme-option", isActive && "active")}
                    onClick={() => onSelect(group.family, v.id)}
                  >
                    <span className="theme-swatch" style={{ background: v.color }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{v.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{group.label} {v.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

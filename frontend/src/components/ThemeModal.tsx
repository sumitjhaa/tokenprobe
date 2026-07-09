import { useEffect } from "react";
import { X, Check } from "lucide-react";
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
        style={{ maxWidth: "28rem", width: "calc(100vw - 2rem)" }}
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
            <p style={{
              fontWeight: 600, fontSize: "0.6875rem", color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.625rem"
            }}>
              {group.label}
            </p>
            <div className={`theme-grid theme-grid--${group.variants.length}`}>
              {group.variants.map((v) => {
                const isActive = current.family === group.family && current.variant === v.id;
                return (
                  <button
                    key={v.id}
                    className={`theme-card${isActive ? " active" : ""}`}
                    onClick={() => onSelect(group.family, v.id)}
                  >
                    <div className="theme-palette" style={{ background: v.bg }}>
                      <span className="theme-palette-accent" style={{ background: v.accent }} />
                      <span className="theme-palette-text" style={{ background: v.text }} />
                      {isActive && (
                        <span className="theme-palette-check">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="theme-card-label">{v.label}</div>
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

import { Palette } from "lucide-react";

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenTheme: () => void;
}

const links = [
  { path: "home", label: "Home" },
  { path: "batch", label: "Batch" },
  { path: "config", label: "Config" },
  { path: "about", label: "About" },
];

export default function Navbar({ currentPath, onNavigate, onOpenTheme }: Props) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); onNavigate("home"); }}
            className="navbar-brand"
          >
            <span className="navbar-brand-marker">T</span>
            TokenProbe
          </a>

          <div className="nav-tabs">
            {links.map((link) => (
              <a
                key={link.path}
                href={`#${link.path}`}
                onClick={(e) => { e.preventDefault(); onNavigate(link.path); }}
                className={`nav-link${currentPath === link.path ? " active" : ""}`}
              >
                <span className="nav-slash">//</span>
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <span style={{
              fontSize: "0.5625rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              padding: "0.0625rem 0.3125rem",
              lineHeight: "1.4",
            }}>
              v1
            </span>
            <button
              onClick={onOpenTheme}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "color 0.15s ease",
              }}
              aria-label="Change theme"
              onMouseOver={(e) => e.currentTarget.style.color = "var(--accent)"}
              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <Palette size={13} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

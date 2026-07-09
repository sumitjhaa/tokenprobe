import { Palette, Shield } from "lucide-react";

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
      <div className="container navbar-inner">
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); onNavigate("home"); }}
          className="flex items-center gap-2 font-bold shrink-0"
          style={{ color: "var(--text)", fontSize: "1rem" }}
        >
          <Shield size={18} style={{ color: "var(--accent)" }} />
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

        <button
          onClick={onOpenTheme}
          className="btn btn-ghost btn-sm shrink-0"
          aria-label="Change theme"
        >
          <Palette size={16} />
        </button>
      </div>
    </nav>
  );
}

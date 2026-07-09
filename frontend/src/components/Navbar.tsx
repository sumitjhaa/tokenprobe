import { Palette, Shield } from "lucide-react";
import { cn } from "../utils/cn";

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
        <div className="flex items-center gap-6">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); onNavigate("home"); }}
            className="flex items-center gap-2 font-bold"
            style={{ color: "var(--text)", fontSize: "1.125rem" }}
          >
            <Shield size={20} style={{ color: "var(--accent)" }} />
            TokenProbe
          </a>
          <div className="flex gap-1">
            {links.map((link) => (
              <a
                key={link.path}
                href={`#${link.path}`}
                onClick={(e) => { e.preventDefault(); onNavigate(link.path); }}
                className={cn("nav-link", currentPath === link.path && "active")}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <button
          onClick={onOpenTheme}
          className="btn btn-ghost btn-sm"
          aria-label="Change theme"
        >
          <Palette size={16} />
        </button>
      </div>
    </nav>
  );
}

import { Moon, Sun } from "lucide-react";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const links = [
  { path: "home", label: "Home" },
  { path: "batch", label: "Batch" },
  { path: "config", label: "Config" },
  { path: "about", label: "About" },
];

export default function Navbar({ dark, onToggleDark, currentPath, onNavigate }: Props) {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); onNavigate("home"); }}
            className="text-lg font-bold text-gray-900 dark:text-gray-100"
          >
            TokenProbe
          </a>
          <div className="hidden sm:flex gap-1">
            {links.map((link) => (
              <a
                key={link.path}
                href={`#${link.path}`}
                onClick={(e) => { e.preventDefault(); onNavigate(link.path); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  currentPath === link.path
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
        </button>
      </div>
    </nav>
  );
}

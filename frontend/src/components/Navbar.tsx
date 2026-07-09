import { Moon, Sun } from "lucide-react";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

export default function Navbar({ dark, onToggleDark }: Props) {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
            TokenProbe
          </a>
          <div className="hidden sm:flex gap-4 text-sm">
            <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Home
            </a>
            <a href="/batch" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Batch
            </a>
            <a href="/config" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Config
            </a>
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

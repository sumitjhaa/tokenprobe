import type { FC } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BatchPage from "./pages/BatchPage";
import ConfigPage from "./pages/ConfigPage";
import AboutPage from "./pages/AboutPage";
import { useTheme } from "./hooks/useTheme";
import { useHash } from "./hooks/useHash";
import { ErrorBoundary } from "./utils/errors";

const pages: Record<string, FC> = {
  home: HomePage,
  batch: BatchPage,
  config: ConfigPage,
  about: AboutPage,
};

export default function App() {
  const { dark, toggle } = useTheme();
  const { hash, navigate } = useHash();
  const Page = pages[hash] || HomePage;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar dark={dark} onToggleDark={toggle} currentPath={hash} onNavigate={navigate} />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <Page />
          <footer className="mt-16 text-center text-xs text-gray-400 dark:text-gray-600">
            TokenProbe v1.0.0 &mdash; No tokens are stored or transmitted
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  );
}

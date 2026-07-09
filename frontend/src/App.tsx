import { lazy, Suspense, useEffect, type FC } from "react";
import Navbar from "./components/Navbar";
import { useTheme } from "./hooks/useTheme";
import { useHash } from "./hooks/useHash";
import { ErrorBoundary } from "./utils/errors";
import { Spinner } from "./components/ui/Spinner";
import { healthCheck } from "./api/client";

const HomePage = lazy(() => import("./pages/HomePage"));
const BatchPage = lazy(() => import("./pages/BatchPage"));
const ConfigPage = lazy(() => import("./pages/ConfigPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const pages: Record<string, FC> = {
  home: HomePage,
  batch: BatchPage,
  config: ConfigPage,
  about: AboutPage,
};

function PageFallback() {
  return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  const { dark, toggle } = useTheme();
  const { hash, navigate } = useHash();
  const Page = pages[hash] || HomePage;

  useEffect(() => {
    const id = setInterval(() => {
      healthCheck().catch(() => {});
    }, 780_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar dark={dark} onToggleDark={toggle} currentPath={hash} onNavigate={navigate} />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <Suspense fallback={<PageFallback />}>
            <Page />
          </Suspense>
          <footer className="mt-16 text-center text-xs text-gray-400 dark:text-gray-600">
            TokenProbe v1.0.0 &mdash; No tokens are stored or transmitted
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  );
}

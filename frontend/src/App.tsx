import { lazy, Suspense, useEffect, useState, type FC } from "react";
import Navbar from "./components/Navbar";
import ThemeModal from "./components/ThemeModal";
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
    <div className="flex justify-center" style={{ padding: "5rem 0" }}>
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  const { theme, setTheme } = useTheme();
  const { hash, navigate } = useHash();
  const [showTheme, setShowTheme] = useState(false);
  const Page = pages[hash] || HomePage;

  useEffect(() => {
    const id = setInterval(() => {
      healthCheck().catch(() => {});
    }, 780_000);
    return () => clearInterval(id);
  }, []);

  const isHome = hash === "home" || hash === "";

  return (
    <ErrorBoundary>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Navbar currentPath={hash} onNavigate={navigate} onOpenTheme={() => setShowTheme(true)} />

        {isHome ? (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ) : (
          <main className="container" style={{ paddingTop: "2rem", flex: 1, overflow: "auto" }}>
            <Suspense fallback={<PageFallback />}>
              <Page />
            </Suspense>
          </main>
        )}
      </div>

      {showTheme && (
        <ThemeModal
          current={theme}
          onSelect={setTheme}
          onClose={() => setShowTheme(false)}
        />
      )}
    </ErrorBoundary>
  );
}

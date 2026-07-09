import { useState, useEffect } from "react";

export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || "home");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash.slice(1) || "home");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return { hash, navigate };
}

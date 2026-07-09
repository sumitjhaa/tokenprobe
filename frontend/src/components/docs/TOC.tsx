import { useEffect, useState } from "react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "anatomy", label: "Anatomy" },
  { id: "claims", label: "Claims" },
  { id: "algorithms", label: "Algorithms" },
  { id: "vulns", label: "Vulnerabilities" },
  { id: "checks", label: "Detection Checks" },
  { id: "jwe", label: "JWE" },
  { id: "usage", label: "CLI & Library" },
  { id: "api", label: "API Reference" },
  { id: "web", label: "Web Interface" },
  { id: "config", label: "Configuration" },
  { id: "themes", label: "Themes" },
  { id: "samples", label: "Sample Tokens" },
  { id: "storage", label: "Token Storage" },
  { id: "best-practices", label: "Best Practices" },
  { id: "ci-cd", label: "CI/CD" },
  { id: "architecture", label: "Architecture" },
  { id: "faq", label: "FAQ" },
  { id: "glossary", label: "Glossary" },
];

export { sections };

export default function TOC() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      style={{
        position: "sticky", top: "5.5rem", width: "14rem", flexShrink: 0,
        maxHeight: "calc(100vh - 7rem)", overflowY: "auto",
      }}
    >
      <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        On this page
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                setActiveId(s.id);
              }}
              style={{
                fontSize: "0.75rem", color: isActive ? "var(--accent)" : "var(--text-muted)",
                textDecoration: "none", padding: "0.3rem 0.5rem",
                background: isActive ? "var(--accent-soft)" : "transparent",
                borderRadius: "4px", fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s ease",
              }}
            >
              {s.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

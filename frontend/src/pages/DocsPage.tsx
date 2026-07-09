import { ErrorBoundary } from "../utils/errors";
import NfIcon from "../components/docs/NfIcon";
import TOC from "../components/docs/TOC";
import OverviewSection from "../components/docs/OverviewSection";
import AnatomySection from "../components/docs/AnatomySection";
import ClaimsSection from "../components/docs/ClaimsSection";
import AlgorithmsSection from "../components/docs/AlgorithmsSection";
import VulnSection from "../components/docs/VulnSection";
import ChecksSection from "../components/docs/ChecksSection";
import JWESection from "../components/docs/JWESection";
import UsageSection from "../components/docs/UsageSection";
import ApiSection from "../components/docs/ApiSection";
import WebSection from "../components/docs/WebSection";
import ConfigSection from "../components/docs/ConfigSection";
import ThemesSection from "../components/docs/ThemesSection";
import SamplesSection from "../components/docs/SamplesSection";
import StorageSection from "../components/docs/StorageSection";
import BestPracticesSection from "../components/docs/BestPracticesSection";
import CICDSection from "../components/docs/CICDSection";
import ArchitectureSection from "../components/docs/ArchitectureSection";
import FAQSection from "../components/docs/FAQSection";
import GlossarySection from "../components/docs/GlossarySection";

export default function DocsPage() {
  return (
    <ErrorBoundary>
      <div className="animate-fade-in" style={{ maxWidth: "88rem", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ marginBottom: "3rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "1rem" }}>
            <div style={{
              width: "3rem", height: "3rem", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent)",
            }}>
              <NfIcon name="book" size={24} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Documentation</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: "44rem", lineHeight: 1.6 }}>
            Everything you need to understand JWTs, their vulnerabilities, and how TokenProbe helps secure your applications.
            Browse the sections below or use the index on the right to jump to a topic.
          </p>
        </div>

        <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: "68rem" }}>
            <OverviewSection />
            <AnatomySection />
            <ClaimsSection />
            <AlgorithmsSection />
            <VulnSection />
            <ChecksSection />
            <JWESection />
            <UsageSection />
            <ApiSection />
            <WebSection />
            <ConfigSection />
            <ThemesSection />
            <SamplesSection />
            <StorageSection />
            <BestPracticesSection />
            <CICDSection />
            <ArchitectureSection />
            <FAQSection />
            <GlossarySection />
          </div>
          <TOC />
        </div>
      </div>
    </ErrorBoundary>
  );
}

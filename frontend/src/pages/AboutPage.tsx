import { Shield, ExternalLink, BookOpen, ShieldCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorBoundary } from "../utils/errors";

const features = [
  { icon: Shield, label: "8 Static Checks", desc: "alg none, missing claims, PII exposure, algorithm confusion" },
  { icon: ShieldCheck, label: "4 JWE Checks", desc: "Weak encryption, missing protected header fields" },
  { icon: BookOpen, label: "Actionable Reports", desc: "Every finding includes remediation guidance" },
];

const techStack = [
  ["Python", "Core engine + CLI"],
  ["FastAPI", "REST API backend"],
  ["React", "Frontend UI"],
  ["Bun", "JS runtime + build"],
  ["Tailwind CSS", "Styling"],
  ["Vite", "Build tool"],
];

export default function AboutPage() {
  return (
    <ErrorBoundary>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <Shield size={28} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About TokenProbe</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A production-grade security auditing tool for JWT tokens.
          </p>
        </div>

        <Card padding="lg" className="bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why TokenProbe?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            JWTs are the default auth mechanism for modern APIs, but they're commonly misconfigured
            in ways that are silently exploitable. TokenProbe catches these issues in seconds
            with zero setup &mdash; no network calls or configuration.
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.label} className="text-center bg-gray-50 dark:bg-gray-900/50" padding="lg" hover>
              <f.icon size={22} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{f.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </Card>
          ))}
        </div>

        <Card padding="lg" className="bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {techStack.map(([tech, use]) => (
              <Card key={tech} padding="sm" className="bg-white dark:bg-gray-800/50">
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{tech}</div>
                <div className="text-xs text-gray-500 mt-0.5">{use}</div>
              </Card>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <a
            href="https://github.com/sumitjhaa/tokenprobe"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              <ExternalLink size={16} />
              View on GitHub
            </Button>
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
}

import { Shield, ExternalLink, BookOpen, ShieldCheck } from "lucide-react";

const features = [
  { icon: Shield, label: "8 Static Checks", desc: "Alg none, missing claims, PII, algorithm confusion" },
  { icon: ShieldCheck, label: "4 JWE Checks", desc: "Weak encryption algorithms, missing fields" },
  { icon: BookOpen, label: "Actionable Reports", desc: "Every finding includes remediation guidance" },
];

export default function AboutPage() {
  return (
    <>
      <div className="text-center mb-10">
        <Shield size={32} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          About TokenProbe
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          A production-grade security auditing tool for JWT tokens.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Why TokenProbe?</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            JWTs are the default auth mechanism for modern APIs, but they're commonly misconfigured
            in ways that are silently exploitable. TokenProbe catches these issues in seconds
            with zero setup — no network calls, no configuration, just paste your token.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.label} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 text-center">
              <f.icon size={24} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{f.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              ["Python", "Core engine + CLI"],
              ["FastAPI", "REST API backend"],
              ["React", "Frontend UI"],
              ["Bun", "JS runtime + build"],
              ["Tailwind CSS", "Styling"],
              ["Vite", "Build tool"],
            ].map(([tech, use]) => (
              <div key={tech} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">{tech}</div>
                <div className="text-xs text-gray-500">{use}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a
            href="https://github.com/sumitjhaa/tokenprobe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <ExternalLink size={18} />
            View on GitHub
          </a>
        </div>
      </div>
    </>
  );
}

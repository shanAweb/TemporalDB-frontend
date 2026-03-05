import Link from "next/link";

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Query Console", href: "/query" },
      { label: "Graph Explorer", href: "/graph" },
      { label: "API Docs", href: "/docs" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Architecture", href: "#architecture" },
      { label: "GitHub", href: "https://github.com" },
      { label: "License", href: "#" },
    ],
  },
  {
    heading: "Stack",
    links: [
      { label: "FastAPI", href: "#" },
      { label: "PostgreSQL + pgvector", href: "#" },
      { label: "Neo4j", href: "#" },
      { label: "Ollama", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex h-7 w-7 items-center justify-center">
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-accent-1 to-accent-2 opacity-80" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="relative z-10 h-4 w-4 text-white"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-text-primary">
                Temporal<span className="text-accent-2">DB</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              A database that understands time and causality. Fully local,
              fully private.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-xs text-text-muted">
            TemporalDB. Open source under the MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}

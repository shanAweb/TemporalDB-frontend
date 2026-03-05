"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-28">
      <div className="absolute inset-0 grid-pattern" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-1/20 via-surface to-accent-2/20" />
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-accent-1/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent-2/10 blur-3xl" />

          <div className="relative border border-border rounded-3xl px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Ready to Understand{" "}
              <span className="gradient-text">Why Things Happen</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
              Deploy TemporalDB locally, ingest your documents, and start asking
              causal questions in minutes. No cloud dependencies. No data
              leaves your machine.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-1/20 transition-all hover:shadow-xl hover:shadow-accent-1/30"
              >
                Launch Dashboard
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-text-secondary transition-all hover:border-border-light hover:bg-surface hover:text-text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

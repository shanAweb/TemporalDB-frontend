"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute inset-0 radial-hero" />

      {/* Animated orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent-1/5 blur-3xl animate-pulse-ring" />
      <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-accent-2/5 blur-3xl animate-pulse-ring" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-accent-3/5 blur-3xl animate-pulse-ring" style={{ animationDelay: "4s" }} />

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-8 lg:pt-44 lg:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
            </span>
            <span className="text-xs font-medium tracking-wide text-text-secondary">
              Fully local. Your data never leaves your infrastructure.
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The Database That{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">Understands Time</span>
            <br />
            and Causality
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg md:text-xl"
          >
            Ingest documents, automatically extract events and causal
            relationships, then query your knowledge base with natural language.
            Get structured, cited answers powered by causal graph traversal.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-1/20 transition-all hover:shadow-xl hover:shadow-accent-1/30"
            >
              Start Querying
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
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-text-secondary transition-all hover:border-border-light hover:bg-surface hover:text-text-primary"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-16 grid max-w-xl grid-cols-3 gap-8"
          >
            {[
              { value: "4", label: "Query Engines" },
              { value: "7-Stage", label: "NLP Pipeline" },
              { value: "100%", label: "Local & Private" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-text-primary sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium text-text-muted sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero visual - Interactive query demo */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-20 max-w-3xl"
        >
          <div className="gradient-border glow-accent p-1">
            <div className="rounded-[12px] bg-surface p-6">
              {/* Terminal header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs font-medium text-text-muted font-mono">
                  temporaldb query console
                </span>
              </div>

              {/* Query */}
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-accent-2 shrink-0">$</span>
                  <span className="text-text-primary">
                    curl -X POST /query -d &apos;{`{"question": "Why did revenue drop in Q3?"}`}&apos;
                  </span>
                </div>

                {/* Divider */}
                <div className="glow-line" />

                {/* Response */}
                <div className="space-y-2 text-text-secondary">
                  <div className="flex items-start gap-2">
                    <span className="text-accent-3 shrink-0">{"{"}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div>
                      <span className="text-accent-2">&quot;answer&quot;</span>
                      <span className="text-text-muted">: </span>
                      <span className="text-[#a5d6a7]">&quot;Revenue dropped 15% in Q3 due to supply chain disruptions...&quot;</span>
                    </div>
                    <div>
                      <span className="text-accent-2">&quot;confidence&quot;</span>
                      <span className="text-text-muted">: </span>
                      <span className="text-[#ffcc80]">0.87</span>
                    </div>
                    <div>
                      <span className="text-accent-2">&quot;intent&quot;</span>
                      <span className="text-text-muted">: </span>
                      <span className="text-[#a5d6a7]">&quot;CAUSAL_WHY&quot;</span>
                    </div>
                    <div>
                      <span className="text-accent-2">&quot;causal_chain&quot;</span>
                      <span className="text-text-muted">: [</span>
                      <span className="text-text-muted italic"> 3 events traced </span>
                      <span className="text-text-muted">]</span>
                    </div>
                    <div>
                      <span className="text-accent-2">&quot;sources&quot;</span>
                      <span className="text-text-muted">: [</span>
                      <span className="text-text-muted italic"> 2 documents cited </span>
                      <span className="text-text-muted">]</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-3">{"}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

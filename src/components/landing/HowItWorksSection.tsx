"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Ingest Documents",
    description:
      "Upload PDF, DOCX, TXT, or Markdown files through the REST API. Raw text can also be ingested directly. Documents are normalized, deduplicated, and queued for processing.",
    detail: "POST /ingest/file or POST /ingest",
    color: "accent-1",
  },
  {
    number: "02",
    title: "NLP Pipeline Extracts Knowledge",
    description:
      "A 7-stage pipeline powered by spaCy identifies entities, resolves coreferences, extracts events and timestamps, links entities, discovers causal relationships, and generates embeddings.",
    detail: "NER / Coref / Events / Temporal / Linking / Causal / Embeddings",
    color: "accent-2",
  },
  {
    number: "03",
    title: "Dual Storage Persists Everything",
    description:
      "Events are stored in PostgreSQL with pgvector for semantic search. Causal relationships are mapped in Neo4j as a directed graph. Redis handles deduplication and caching.",
    detail: "PostgreSQL + pgvector | Neo4j | Redis",
    color: "accent-3",
  },
  {
    number: "04",
    title: "Query with Natural Language",
    description:
      "Ask questions in plain English. The query engine classifies your intent, traverses the appropriate stores, and synthesizes a cited answer using a local LLM via Ollama.",
    detail: "POST /query",
    color: "accent-2",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="absolute inset-0 grid-pattern" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent-2">
            Pipeline
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            From Raw Documents to{" "}
            <span className="gradient-text">Causal Insights</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Four stages transform unstructured text into a queryable knowledge
            graph with full causal reasoning capabilities.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mx-auto mt-20 max-w-3xl">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent-1/50 via-accent-2/50 to-accent-3/50 lg:left-1/2 lg:-translate-x-px" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative flex flex-col lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                } items-start gap-8 lg:gap-16`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 top-0 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center lg:left-1/2">
                  <div className={`h-4 w-4 rounded-full bg-${step.color} shadow-lg shadow-${step.color}/30`} />
                  <div className={`absolute h-8 w-8 rounded-full bg-${step.color}/20 animate-ping`} />
                </div>

                {/* Content */}
                <div className={`ml-16 lg:ml-0 lg:w-1/2 ${index % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                  <span className={`text-sm font-mono font-bold text-${step.color}`}>
                    {step.number}
                  </span>
                  <h3 className="mt-1 text-xl font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                  <div className="mt-3 inline-block rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-muted">
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

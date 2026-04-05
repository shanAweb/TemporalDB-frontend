"use client";

import { motion } from "framer-motion";

const techStack = [
  {
    category: "API & Runtime",
    items: [
      { name: "FastAPI", desc: "Async REST API framework" },
      { name: "Pydantic v2", desc: "Request/response validation" },
      { name: "Celery", desc: "Distributed task queue" },
    ],
  },
  {
    category: "Storage",
    items: [
      { name: "PostgreSQL 16", desc: "Event store with pgvector" },
      { name: "Neo4j 5", desc: "Causal graph database" },
      { name: "Redis 7", desc: "Cache and deduplication" },
    ],
  },
  {
    category: "Intelligence",
    items: [
      { name: "spaCy", desc: "NER and dependency parsing" },
      { name: "sentence-transformers", desc: "Embedding generation" },
      { name: "Ollama", desc: "Local LLM inference" },
    ],
  },
  {
    category: "Infrastructure",
    items: [
      { name: "Redpanda", desc: "Kafka-compatible message bus" },
      { name: "Docker Compose", desc: "Service orchestration" },
      { name: "Alembic", desc: "Database migrations" },
    ],
  },
];

const queryTypes = [
  {
    intent: "CAUSAL_WHY",
    example: "Why did revenue drop in Q3?",
    engine: "Neo4j graph traversal",
  },
  {
    intent: "TEMPORAL_RANGE",
    example: "What happened between July and September?",
    engine: "PostgreSQL range scan",
  },
  {
    intent: "SIMILARITY",
    example: "Find events similar to the disruption",
    engine: "pgvector cosine similarity",
  },
  {
    intent: "ENTITY_TIMELINE",
    example: "Show me everything about Acme Corp",
    engine: "PostgreSQL + Neo4j combined",
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-28">
      <div className="absolute inset-0 radial-center" />

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
            Architecture
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Purpose-Built{" "}
            <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Every component chosen for a specific role. No bloat, no
            compromises. Fully containerized and ready to deploy.
          </p>
        </motion.div>

        {/* Tech stack grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {techStack.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm"
            >
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent-2">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.name}>
                    <div className="text-sm font-medium text-text-primary">
                      {item.name}
                    </div>
                    <div className="text-xs text-text-muted">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Query types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <h3 className="mb-6 text-center text-lg font-semibold text-text-primary">
            Four Query Engines, One Interface
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Intent
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Example
                  </th>
                  <th className="hidden px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-text-muted sm:table-cell">
                    Engine
                  </th>
                </tr>
              </thead>
              <tbody>
                {queryTypes.map((qt, i) => (
                  <tr
                    key={qt.intent}
                    className={
                      i < queryTypes.length - 1 ? "border-b border-border/60" : ""
                    }
                  >
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-accent-1/10 px-2 py-0.5 font-mono text-xs font-medium text-accent-2">
                        {qt.intent}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-text-secondary">
                      {qt.example}
                    </td>
                    <td className="hidden px-6 py-3.5 text-text-muted sm:table-cell">
                      {qt.engine}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const stats = [
  {
    label: "Documents",
    value: "128",
    change: "+12 this week",
    trend: "up" as const,
    gradient: "from-accent-1 to-accent-3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "Events Extracted",
    value: "3,847",
    change: "+284 this week",
    trend: "up" as const,
    gradient: "from-accent-2 to-accent-1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Entities",
    value: "612",
    change: "+45 this week",
    trend: "up" as const,
    gradient: "from-accent-3 to-[#ec4899]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Causal Links",
    value: "1,205",
    change: "+96 this week",
    trend: "up" as const,
    gradient: "from-[#f97316] to-accent-3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="12" r="3" />
        <line x1="8.59" y1="7.41" x2="15.42" y2="10.59" />
        <line x1="15.41" y1="13.41" x2="8.59" y2="16.59" />
      </svg>
    ),
  },
];

const quickActions = [
  {
    title: "Upload Document",
    description: "Ingest PDF, DOCX, TXT, or Markdown files for processing",
    href: "/ingest",
    gradient: "from-accent-1 to-accent-2",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: "Ask a Question",
    description: "Query your knowledge base with natural language",
    href: "/query",
    gradient: "from-accent-2 to-accent-3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "Explore Graph",
    description: "Visualize causal relationships between events and entities",
    href: "/graph",
    gradient: "from-accent-3 to-accent-1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="12" r="3" />
        <line x1="8.59" y1="7.41" x2="15.42" y2="10.59" />
        <line x1="15.41" y1="13.41" x2="8.59" y2="16.59" />
      </svg>
    ),
  },
];

const recentEvents = [
  {
    id: "evt-001",
    description: "Supply chain disruptions reported across Asia-Pacific region",
    type: "state_change",
    timestamp: "2024-10-15T09:30:00Z",
    confidence: 0.95,
    entity: "Asia-Pacific Supply Chain",
  },
  {
    id: "evt-002",
    description: "Q3 revenue declined 15% year-over-year for manufacturing sector",
    type: "action",
    timestamp: "2024-10-01T00:00:00Z",
    confidence: 0.92,
    entity: "Manufacturing Sector",
  },
  {
    id: "evt-003",
    description: "New trade regulations enacted affecting semiconductor imports",
    type: "state_change",
    timestamp: "2024-09-20T14:00:00Z",
    confidence: 0.88,
    entity: "Trade Policy",
  },
  {
    id: "evt-004",
    description: "Production capacity reduced by 20% at primary facilities",
    type: "action",
    timestamp: "2024-09-15T08:00:00Z",
    confidence: 0.91,
    entity: "Production Operations",
  },
  {
    id: "evt-005",
    description: "Strategic partnership announced between Acme Corp and GlobalTech",
    type: "action",
    timestamp: "2024-09-10T16:00:00Z",
    confidence: 0.87,
    entity: "Acme Corp",
  },
];

const recentQueries = [
  {
    question: "Why did revenue drop in Q3?",
    intent: "CAUSAL_WHY",
    confidence: 0.87,
    timestamp: "2 hours ago",
  },
  {
    question: "What happened between July and September?",
    intent: "TEMPORAL_RANGE",
    confidence: 0.92,
    timestamp: "5 hours ago",
  },
  {
    question: "Find events similar to the supply chain disruption",
    intent: "SIMILARITY",
    confidence: 0.79,
    timestamp: "1 day ago",
  },
  {
    question: "Show me everything about Acme Corp",
    intent: "ENTITY_TIMELINE",
    confidence: 0.94,
    timestamp: "1 day ago",
  },
];

const pipelineStages = [
  { name: "NER", status: "active" },
  { name: "Coref", status: "active" },
  { name: "Events", status: "active" },
  { name: "Temporal", status: "active" },
  { name: "Linking", status: "active" },
  { name: "Causal", status: "active" },
  { name: "Embeddings", status: "active" },
];

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function intentColor(intent: string) {
  switch (intent) {
    case "CAUSAL_WHY":
      return "bg-accent-1/10 text-accent-1";
    case "TEMPORAL_RANGE":
      return "bg-accent-2/10 text-accent-2";
    case "SIMILARITY":
      return "bg-accent-3/10 text-accent-3";
    case "ENTITY_TIMELINE":
      return "bg-[#f97316]/10 text-[#f97316]";
    default:
      return "bg-text-muted/10 text-text-muted";
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Overview of your TemporalDB knowledge base
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-border-light hover:bg-surface"
          >
            {/* Gradient background glow */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-5 transition-opacity duration-300 group-hover:opacity-10`} />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-text-primary">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-sm text-text-muted">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-border-light hover:bg-surface"
            >
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${action.gradient} opacity-5 transition-opacity duration-300 group-hover:opacity-10`} />
              <div className="relative">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg`}>
                  {action.icon}
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  {action.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent-2 transition-colors group-hover:text-accent-2">
                Open
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Two-column: Recent Events + Recent Queries */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Events - 2/3 width */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">
              Recent Events
            </h2>
            <Link
              href="/events"
              className="text-xs font-medium text-accent-2 transition-colors hover:text-accent-2/80"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Event
                  </th>
                  <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted md:table-cell">
                    Entity
                  </th>
                  <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted sm:table-cell">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event, i) => (
                  <tr
                    key={event.id}
                    className={`transition-colors hover:bg-surface-light ${
                      i < recentEvents.length - 1 ? "border-b border-border/60" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="max-w-xs truncate text-text-primary">
                        {event.description}
                      </div>
                      <div className="mt-0.5 text-xs text-text-muted">
                        {event.type}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 text-text-secondary md:table-cell">
                      {event.entity}
                    </td>
                    <td className="hidden px-5 py-3.5 text-text-muted sm:table-cell whitespace-nowrap">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                        event.confidence >= 0.9
                          ? "bg-green-400/10 text-green-400"
                          : event.confidence >= 0.8
                          ? "bg-accent-2/10 text-accent-2"
                          : "bg-[#f97316]/10 text-[#f97316]"
                      }`}>
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Queries - 1/3 width */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">
              Recent Queries
            </h2>
            <Link
              href="/query"
              className="text-xs font-medium text-accent-2 transition-colors hover:text-accent-2/80"
            >
              New query
            </Link>
          </div>
          <div className="space-y-3">
            {recentQueries.map((q, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-border-light hover:bg-surface"
              >
                <p className="text-sm font-medium text-text-primary leading-snug">
                  &ldquo;{q.question}&rdquo;
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${intentColor(q.intent)}`}>
                    {q.intent.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {q.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pipeline status */}
      <motion.div
        custom={8}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          NLP Pipeline Status
        </h2>
        <div className="rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            {pipelineStages.map((stage, i) => (
              <div key={stage.name} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-light px-3 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  <span className="text-xs font-medium text-text-primary">
                    {stage.name}
                  </span>
                </div>
                {i < pipelineStages.length - 1 && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-text-muted">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
            <span>All 7 stages operational</span>
            <span className="h-1 w-1 rounded-full bg-text-muted" />
            <span>Processing queue: 0 pending</span>
            <span className="h-1 w-1 rounded-full bg-text-muted" />
            <span>Last processed: 3 min ago</span>
          </div>
        </div>
      </motion.div>

      {/* System services */}
      <motion.div
        custom={9}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          System Services
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { name: "FastAPI", port: "8000", status: "running" },
            { name: "PostgreSQL", port: "5432", status: "running" },
            { name: "Neo4j", port: "7474", status: "running" },
            { name: "Redis", port: "6379", status: "running" },
            { name: "Redpanda", port: "9092", status: "running" },
            { name: "Ollama", port: "11434", status: "running" },
          ].map((service) => (
            <div
              key={service.name}
              className="rounded-xl border border-border bg-surface/50 p-3.5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
                <span className="text-xs font-medium text-text-primary">
                  {service.name}
                </span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-text-muted">
                :{service.port}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

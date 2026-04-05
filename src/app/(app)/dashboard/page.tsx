"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types for API responses                                           */
/* ------------------------------------------------------------------ */

interface ApiEvent {
  id: string;
  description: string;
  event_type: string;
  ts_start: string | null;
  ts_end: string | null;
  confidence: number;
  source_sentence: string | null;
  document_id: string | null;
  created_at: string;
}

interface EventsResponse {
  events: ApiEvent[];
  total: number;
  offset: number;
  limit: number;
}

interface ApiEntity {
  id: string;
  name: string;
  canonical_name: string;
  type: string;
  description: string | null;
  aliases: string[];
  created_at: string;
}

interface EntitiesResponse {
  entities: ApiEntity[];
  total: number;
  offset: number;
  limit: number;
}

/* ------------------------------------------------------------------ */
/*  Animation variant                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Static icon definitions for stat cards                            */
/* ------------------------------------------------------------------ */

const statIcons = {
  documents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  entities: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  causalLinks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="12" r="3" />
      <line x1="8.59" y1="7.41" x2="15.42" y2="10.59" />
      <line x1="15.41" y1="13.41" x2="8.59" y2="16.59" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Static data that doesn't come from the API                        */
/* ------------------------------------------------------------------ */

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


const pipelineStages = [
  { name: "NER", status: "active" },
  { name: "Coref", status: "active" },
  { name: "Events", status: "active" },
  { name: "Temporal", status: "active" },
  { name: "Linking", status: "active" },
  { name: "Causal", status: "active" },
  { name: "Embeddings", status: "active" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  interface RecentEvent {
    id: string;
    description: string;
    type: string;
    timestamp: string;
    confidence: number;
    entity: string;
  }

  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [totalEntities, setTotalEntities] = useState<number | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      // Fetch events and entities in parallel
      const [eventsResult, entitiesResult] = await Promise.allSettled([
        apiFetch<EventsResponse>("/events?limit=5"),
        apiFetch<EntitiesResponse>("/entities?limit=100"),
      ]);

      if (cancelled) return;

      // --- Events ---
      if (eventsResult.status === "fulfilled") {
        const data = eventsResult.value;
        setTotalEvents(data.total);
        setRecentEvents(
          data.events.map((e) => ({
            id: e.id,
            description: e.description,
            type: e.event_type,
            timestamp: e.ts_start || e.created_at,
            confidence: e.confidence,
            entity: e.source_sentence
              ? e.source_sentence.slice(0, 30) + (e.source_sentence.length > 30 ? "..." : "")
              : "—",
          }))
        );
      }

      // --- Entities ---
      if (entitiesResult.status === "fulfilled") {
        setTotalEntities(entitiesResult.value.total);
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Build stat cards dynamically so values reflect API data */
  const stats = [
    {
      label: "Documents",
      value: "\u2014",
      change: "\u2014",
      trend: "up" as const,
      gradient: "from-accent-1 to-accent-3",
      icon: statIcons.documents,
    },
    {
      label: "Events Extracted",
      value: loading ? "..." : totalEvents !== null ? formatNumber(totalEvents) : "0",
      change: loading ? "..." : totalEvents !== null ? `${formatNumber(totalEvents)} total` : "0 total",
      trend: "up" as const,
      gradient: "from-accent-2 to-accent-1",
      icon: statIcons.events,
    },
    {
      label: "Entities",
      value: loading ? "..." : totalEntities !== null ? formatNumber(totalEntities) : "0",
      change: loading ? "..." : totalEntities !== null ? `${formatNumber(totalEntities)} total` : "0 total",
      trend: "up" as const,
      gradient: "from-accent-3 to-[#ec4899]",
      icon: statIcons.entities,
    },
    {
      label: "Causal Links",
      value: "\u2014",
      change: "\u2014",
      trend: "up" as const,
      gradient: "from-[#f97316] to-accent-3",
      icon: statIcons.causalLinks,
    },
  ];

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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading events...
                </div>
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 h-8 w-8">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <p className="text-sm font-medium">No events yet</p>
                <p className="mt-1 text-xs">Upload documents via the <Link href="/ingest" className="text-accent-2 hover:underline">Ingest</Link> page to extract events</p>
              </div>
            ) : (
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
            )}
          </div>
        </motion.div>

        {/* Quick Start - 1/3 width */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">
              Get Started
            </h2>
            <Link
              href="/query"
              className="text-xs font-medium text-accent-2 transition-colors hover:text-accent-2/80"
            >
              New query
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { title: "1. Upload Documents", desc: "Ingest PDF, DOCX, TXT, or Markdown files", href: "/ingest" },
              { title: "2. Explore Events", desc: "View extracted events and their timelines", href: "/events" },
              { title: "3. Browse Entities", desc: "See entities extracted from your documents", href: "/entities" },
              { title: "4. Ask Questions", desc: "Query your knowledge base with natural language", href: "/query" },
            ].map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="block rounded-xl border border-border bg-surface/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-border-light hover:bg-surface"
              >
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {step.desc}
                </p>
              </Link>
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

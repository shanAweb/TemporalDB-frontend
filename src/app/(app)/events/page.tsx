"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

type EventType = "state_change" | "action" | "observation" | "declaration";
type SortField = "timestamp" | "confidence" | "entity";
type SortDir = "asc" | "desc";

interface TimelineEvent {
  id: string;
  description: string;
  type: EventType;
  timestamp: string;
  rawDate: string;
  confidence: number;
  entity: string;
  source: string;
  causalParent?: string;
}

interface ApiEvent {
  id: string;
  description: string;
  event_type: string | null;
  ts_start: string | null;
  ts_end: string | null;
  confidence: number;
  source_sentence: string | null;
  document_id: string;
  created_at: string;
}

interface ApiEventsResponse {
  events: ApiEvent[];
  total: number;
  offset: number;
  limit: number;
}


/* ── Helpers ────────────────────────────────────────────────────────── */

const VALID_EVENT_TYPES: EventType[] = ["state_change", "action", "observation", "declaration"];

function normalizeEventType(raw: string | null): EventType {
  if (raw && VALID_EVENT_TYPES.includes(raw as EventType)) return raw as EventType;
  return "observation"; // sensible default
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "\u2014";
  }
}

function toRawDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function shortenUUID(uuid: string): string {
  return uuid.length > 8 ? uuid.slice(0, 8) + "\u2026" : uuid;
}

function mapApiEvent(e: ApiEvent): TimelineEvent {
  return {
    id: e.id,
    description: e.description,
    type: normalizeEventType(e.event_type),
    timestamp: formatDate(e.ts_start),
    rawDate: toRawDate(e.ts_start) || toRawDate(e.created_at),
    confidence: e.confidence,
    entity: e.event_type
      ? e.event_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "\u2014",
    source: e.document_id ? shortenUUID(e.document_id) : "\u2014",
  };
}

const eventTypes: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "state_change", label: "State Change" },
  { value: "action", label: "Action" },
  { value: "observation", label: "Observation" },
  { value: "declaration", label: "Declaration" },
];

function typeColor(type: EventType): string {
  switch (type) {
    case "state_change": return "bg-accent-1/10 text-accent-1 border-accent-1/20";
    case "action": return "bg-accent-2/10 text-accent-2 border-accent-2/20";
    case "observation": return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20";
    case "declaration": return "bg-accent-3/10 text-accent-3 border-accent-3/20";
  }
}

function typeDotColor(type: EventType): string {
  switch (type) {
    case "state_change": return "bg-accent-1";
    case "action": return "bg-accent-2";
    case "observation": return "bg-[#f97316]";
    case "declaration": return "bg-accent-3";
  }
}

function confidenceColor(c: number): string {
  if (c >= 0.9) return "bg-green-400/10 text-green-400";
  if (c >= 0.8) return "bg-accent-2/10 text-accent-2";
  return "bg-[#f97316]/10 text-[#f97316]";
}

/* ── Skeleton component ─────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-light" />
              <div className="space-y-2">
                <div className="h-6 w-12 animate-pulse rounded bg-surface-light" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-light" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
        <div className="border-b border-border px-5 py-3">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-light" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-3.5 ${
              i < 5 ? "border-b border-border/60" : ""
            }`}
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-surface-light" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-light" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-surface-light" />
            </div>
            <div className="h-5 w-12 animate-pulse rounded bg-surface-light" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page component ─────────────────────────────────────────────────── */

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [totalFromApi, setTotalFromApi] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [entityFilter, setEntityFilter] = useState("All Entities");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [view, setView] = useState<"table" | "timeline">("table");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100", offset: "0" });
      if (typeFilter !== "all") {
        params.set("event_type", typeFilter);
      }
      const data = await apiFetch<ApiEventsResponse>(`/events?${params.toString()}`);
      const mapped = data.events.map(mapApiEvent);
      setAllEvents(mapped);
      setTotalFromApi(data.total);
    } catch {
      setAllEvents([]);
      setTotalFromApi(0);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const entities = useMemo(
    () => ["All Entities", ...Array.from(new Set(allEvents.map((e) => e.entity)))],
    [allEvents]
  );

  const filtered = useMemo(() => {
    let result = allEvents;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.entity.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter);
    }

    if (entityFilter !== "All Entities") {
      result = result.filter((e) => e.entity === entityFilter);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "timestamp":
          cmp = a.rawDate.localeCompare(b.rawDate);
          break;
        case "confidence":
          cmp = a.confidence - b.confidence;
          break;
        case "entity":
          cmp = a.entity.localeCompare(b.entity);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [allEvents, search, typeFilter, entityFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={`ml-1 inline h-3 w-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`}>
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
      </svg>
    );
  };

  // Stats derived from real data
  const stats = [
    {
      label: "Total Events",
      value: totalFromApi.toString(),
      gradient: "from-accent-1 to-accent-2",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Avg Confidence",
      value: allEvents.length
        ? (allEvents.reduce((s, e) => s + e.confidence, 0) / allEvents.length * 100).toFixed(0) + "%"
        : "\u2014",
      gradient: "from-accent-2 to-accent-3",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Entities",
      value: new Set(allEvents.map((e) => e.entity)).size.toString(),
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
      value: allEvents.filter((e) => e.causalParent).length.toString(),
      gradient: "from-[#ec4899] to-[#f97316]",
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

  if (loading) {
    return (
      <div className="space-y-8">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Events</h1>
          <p className="mt-1 text-sm text-text-muted">
            Browse and explore all extracted events from your documents
          </p>
        </motion.div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Events</h1>
        <p className="mt-1 text-sm text-text-muted">
          Browse and explore all extracted events from your documents
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm"
            >
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <div className="relative flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters bar */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-1/50 focus:bg-surface"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EventType | "all")}
            className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
          >
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
          >
            {entities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("table")}
              className={`flex h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                view === "table" ? "bg-surface-light text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Table
            </button>
            <button
              onClick={() => setView("timeline")}
              className={`flex h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                view === "timeline" ? "bg-surface-light text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="12" y1="2" x2="12" y2="22" />
                <circle cx="12" cy="6" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="18" r="2" />
              </svg>
              Timeline
            </button>
          </div>
        </div>

        {/* Active filters + result count */}
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          <span>{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
          {(typeFilter !== "all" || entityFilter !== "All Entities" || search) && (
            <>
              <span className="h-1 w-1 rounded-full bg-text-muted" />
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); setEntityFilter("All Entities"); }}
                className="text-accent-2 hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Table view */}
      {view === "table" && (
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Event
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted sm:table-cell">
                      Type
                    </th>
                    <th
                      className="hidden cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary md:table-cell"
                      onClick={() => toggleSort("entity")}
                    >
                      Entity {sortIcon("entity")}
                    </th>
                    <th
                      className="hidden cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary lg:table-cell"
                      onClick={() => toggleSort("timestamp")}
                    >
                      Date {sortIcon("timestamp")}
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted xl:table-cell">
                      Source
                    </th>
                    <th
                      className="cursor-pointer px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary"
                      onClick={() => toggleSort("confidence")}
                    >
                      Conf. {sortIcon("confidence")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((event, i) => (
                      <motion.tr
                        key={event.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`cursor-pointer transition-colors hover:bg-surface-light ${
                          i < filtered.length - 1 ? "border-b border-border/60" : ""
                        } ${expandedEvent === event.id ? "bg-surface-light/50" : ""}`}
                        onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-2">
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeDotColor(event.type)}`} />
                            <div>
                              <div className="max-w-xs text-text-primary sm:max-w-sm">
                                {event.description}
                              </div>
                              {event.causalParent && (
                                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-accent-3">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                                    <polyline points="15 10 20 15 15 20" />
                                    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                                  </svg>
                                  Causal link
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-5 py-3.5 sm:table-cell">
                          <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeColor(event.type)}`}>
                            {event.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="hidden px-5 py-3.5 text-text-secondary md:table-cell">
                          {event.entity}
                        </td>
                        <td className="hidden px-5 py-3.5 whitespace-nowrap text-text-muted lg:table-cell">
                          {event.timestamp}
                        </td>
                        <td className="hidden px-5 py-3.5 xl:table-cell">
                          <span className="text-xs text-text-muted">{event.source}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${confidenceColor(event.confidence)}`}>
                            {(event.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 h-8 w-8">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <p className="text-sm font-medium">{allEvents.length === 0 ? "No events yet" : "No events match your filters"}</p>
                {allEvents.length === 0 && (
                  <p className="mt-1 text-xs">Upload documents to extract events from your content</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <div className="relative ml-4 border-l-2 border-border pl-8 space-y-6">
            <AnimatePresence>
              {filtered.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[41px] top-2 h-4 w-4 rounded-full border-2 border-background ${typeDotColor(event.type)}`} />

                  <div
                    className={`cursor-pointer rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-border-light hover:bg-surface ${
                      expandedEvent === event.id ? "border-border-light bg-surface" : ""
                    }`}
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  >
                    {/* Date badge */}
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                      {event.timestamp}
                    </div>

                    <p className="text-sm font-medium text-text-primary">
                      {event.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeColor(event.type)}`}>
                        {event.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-text-secondary">{event.entity}</span>
                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${confidenceColor(event.confidence)}`}>
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                      {event.causalParent && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-text-muted" />
                          <span className="flex items-center gap-1 text-[10px] text-accent-3">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                              <polyline points="15 10 20 15 15 20" />
                              <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                            </svg>
                            Causal link
                          </span>
                        </>
                      )}
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {expandedEvent === event.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 border-t border-border/60 pt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-text-muted">Source:</span>
                              <span className="text-text-secondary">{event.source}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-text-muted">Event ID:</span>
                              <span className="font-mono text-text-secondary">{event.id}</span>
                            </div>
                            {event.causalParent && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-text-muted">Caused by:</span>
                                <span className="font-mono text-accent-3">{event.causalParent}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <p className="text-sm">No events match your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

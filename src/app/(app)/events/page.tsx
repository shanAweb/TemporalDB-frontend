"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const allEvents: TimelineEvent[] = [
  {
    id: "evt-001",
    description: "Supply chain disruptions reported across Asia-Pacific region",
    type: "state_change",
    timestamp: "Oct 15, 2024",
    rawDate: "2024-10-15",
    confidence: 0.95,
    entity: "Asia-Pacific Supply Chain",
    source: "supply_chain_analysis.docx",
    causalParent: "evt-003",
  },
  {
    id: "evt-002",
    description: "Q3 revenue declined 15% year-over-year for manufacturing sector",
    type: "observation",
    timestamp: "Oct 1, 2024",
    rawDate: "2024-10-01",
    confidence: 0.92,
    entity: "Manufacturing Sector",
    source: "Q3_Financial_Report.pdf",
    causalParent: "evt-004",
  },
  {
    id: "evt-003",
    description: "New trade regulations enacted affecting semiconductor imports",
    type: "declaration",
    timestamp: "Sep 20, 2024",
    rawDate: "2024-09-20",
    confidence: 0.88,
    entity: "Trade Policy",
    source: "trade_regulations_update.md",
  },
  {
    id: "evt-004",
    description: "Production capacity reduced by 20% at primary facilities",
    type: "action",
    timestamp: "Sep 15, 2024",
    rawDate: "2024-09-15",
    confidence: 0.91,
    entity: "Production Operations",
    source: "supply_chain_analysis.docx",
    causalParent: "evt-001",
  },
  {
    id: "evt-005",
    description: "Strategic partnership announced between Acme Corp and GlobalTech",
    type: "declaration",
    timestamp: "Sep 10, 2024",
    rawDate: "2024-09-10",
    confidence: 0.87,
    entity: "Acme Corp",
    source: "meeting_notes_oct.txt",
  },
  {
    id: "evt-006",
    description: "Warehouse inventory levels dropped below critical threshold",
    type: "state_change",
    timestamp: "Sep 5, 2024",
    rawDate: "2024-09-05",
    confidence: 0.93,
    entity: "Logistics",
    source: "supply_chain_analysis.docx",
    causalParent: "evt-001",
  },
  {
    id: "evt-007",
    description: "Emergency board meeting convened to address supply chain crisis",
    type: "action",
    timestamp: "Sep 3, 2024",
    rawDate: "2024-09-03",
    confidence: 0.96,
    entity: "Acme Corp",
    source: "meeting_notes_oct.txt",
  },
  {
    id: "evt-008",
    description: "Shipping delays averaging 14 days on trans-Pacific routes",
    type: "observation",
    timestamp: "Aug 28, 2024",
    rawDate: "2024-08-28",
    confidence: 0.89,
    entity: "Asia-Pacific Supply Chain",
    source: "supply_chain_analysis.docx",
  },
  {
    id: "evt-009",
    description: "Alternative supplier contract signed with EuroTech Industries",
    type: "action",
    timestamp: "Aug 20, 2024",
    rawDate: "2024-08-20",
    confidence: 0.94,
    entity: "Acme Corp",
    source: "Q3_Financial_Report.pdf",
  },
  {
    id: "evt-010",
    description: "Consumer demand forecast revised downward by 12%",
    type: "observation",
    timestamp: "Aug 15, 2024",
    rawDate: "2024-08-15",
    confidence: 0.86,
    entity: "Manufacturing Sector",
    source: "Q3_Financial_Report.pdf",
  },
  {
    id: "evt-011",
    description: "New tariff schedule published for Q4 semiconductor imports",
    type: "declaration",
    timestamp: "Aug 10, 2024",
    rawDate: "2024-08-10",
    confidence: 0.91,
    entity: "Trade Policy",
    source: "trade_regulations_update.md",
  },
  {
    id: "evt-012",
    description: "Acme Corp stock price declined 8% following earnings miss",
    type: "state_change",
    timestamp: "Aug 5, 2024",
    rawDate: "2024-08-05",
    confidence: 0.97,
    entity: "Acme Corp",
    source: "Q3_Financial_Report.pdf",
    causalParent: "evt-002",
  },
];

const eventTypes: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "state_change", label: "State Change" },
  { value: "action", label: "Action" },
  { value: "observation", label: "Observation" },
  { value: "declaration", label: "Declaration" },
];

const entities = ["All Entities", ...Array.from(new Set(allEvents.map((e) => e.entity)))];

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

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [entityFilter, setEntityFilter] = useState("All Entities");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [view, setView] = useState<"table" | "timeline">("table");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

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
  }, [search, typeFilter, entityFilter, sortField, sortDir]);

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

  // Stats
  const stats = [
    {
      label: "Total Events",
      value: allEvents.length.toString(),
      gradient: "from-accent-1 to-accent-2",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Avg Confidence",
      value: (allEvents.reduce((s, e) => s + e.confidence, 0) / allEvents.length * 100).toFixed(0) + "%",
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-sm">No events match your filters</p>
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

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

type EntityCategory = "organization" | "person" | "location" | "policy" | "sector" | "infrastructure";

interface EntityEvent {
  id: string;
  description: string;
  timestamp: string;
  type: string;
  confidence: number;
}

interface Entity {
  id: string;
  name: string;
  category: EntityCategory;
  eventCount: number;
  connectionCount: number;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  aliases: string[];
  events: EntityEvent[];
}

const allEntities: Entity[] = [
  {
    id: "ent-001",
    name: "Acme Corp",
    category: "organization",
    eventCount: 24,
    connectionCount: 8,
    firstSeen: "Jun 12, 2024",
    lastSeen: "Oct 15, 2024",
    confidence: 0.96,
    aliases: ["Acme Corporation", "ACME"],
    events: [
      { id: "evt-005", description: "Strategic partnership announced between Acme Corp and GlobalTech", timestamp: "Sep 10, 2024", type: "declaration", confidence: 0.87 },
      { id: "evt-007", description: "Emergency board meeting convened to address supply chain crisis", timestamp: "Sep 3, 2024", type: "action", confidence: 0.96 },
      { id: "evt-009", description: "Alternative supplier contract signed with EuroTech Industries", timestamp: "Aug 20, 2024", type: "action", confidence: 0.94 },
      { id: "evt-012", description: "Acme Corp stock price declined 8% following earnings miss", timestamp: "Aug 5, 2024", type: "state_change", confidence: 0.97 },
    ],
  },
  {
    id: "ent-002",
    name: "Asia-Pacific Supply Chain",
    category: "infrastructure",
    eventCount: 18,
    connectionCount: 6,
    firstSeen: "Jul 3, 2024",
    lastSeen: "Oct 15, 2024",
    confidence: 0.93,
    aliases: ["APAC Supply Chain", "Asia-Pacific logistics network"],
    events: [
      { id: "evt-001", description: "Supply chain disruptions reported across Asia-Pacific region", timestamp: "Oct 15, 2024", type: "state_change", confidence: 0.95 },
      { id: "evt-008", description: "Shipping delays averaging 14 days on trans-Pacific routes", timestamp: "Aug 28, 2024", type: "observation", confidence: 0.89 },
    ],
  },
  {
    id: "ent-003",
    name: "Manufacturing Sector",
    category: "sector",
    eventCount: 15,
    connectionCount: 5,
    firstSeen: "Jul 15, 2024",
    lastSeen: "Oct 1, 2024",
    confidence: 0.91,
    aliases: ["Manufacturing industry", "Industrial manufacturing"],
    events: [
      { id: "evt-002", description: "Q3 revenue declined 15% year-over-year for manufacturing sector", timestamp: "Oct 1, 2024", type: "observation", confidence: 0.92 },
      { id: "evt-010", description: "Consumer demand forecast revised downward by 12%", timestamp: "Aug 15, 2024", type: "observation", confidence: 0.86 },
    ],
  },
  {
    id: "ent-004",
    name: "Trade Policy",
    category: "policy",
    eventCount: 11,
    connectionCount: 4,
    firstSeen: "Aug 1, 2024",
    lastSeen: "Sep 20, 2024",
    confidence: 0.89,
    aliases: ["Trade regulations", "Import/export policy"],
    events: [
      { id: "evt-003", description: "New trade regulations enacted affecting semiconductor imports", timestamp: "Sep 20, 2024", type: "declaration", confidence: 0.88 },
      { id: "evt-011", description: "New tariff schedule published for Q4 semiconductor imports", timestamp: "Aug 10, 2024", type: "declaration", confidence: 0.91 },
    ],
  },
  {
    id: "ent-005",
    name: "Production Operations",
    category: "infrastructure",
    eventCount: 9,
    connectionCount: 3,
    firstSeen: "Aug 10, 2024",
    lastSeen: "Sep 15, 2024",
    confidence: 0.90,
    aliases: ["Production facilities", "Manufacturing operations"],
    events: [
      { id: "evt-004", description: "Production capacity reduced by 20% at primary facilities", timestamp: "Sep 15, 2024", type: "action", confidence: 0.91 },
    ],
  },
  {
    id: "ent-006",
    name: "GlobalTech",
    category: "organization",
    eventCount: 7,
    connectionCount: 3,
    firstSeen: "Aug 22, 2024",
    lastSeen: "Sep 10, 2024",
    confidence: 0.85,
    aliases: ["GlobalTech Inc.", "Global Technologies"],
    events: [
      { id: "evt-005", description: "Strategic partnership announced between Acme Corp and GlobalTech", timestamp: "Sep 10, 2024", type: "declaration", confidence: 0.87 },
    ],
  },
  {
    id: "ent-007",
    name: "Logistics",
    category: "infrastructure",
    eventCount: 6,
    connectionCount: 4,
    firstSeen: "Jul 20, 2024",
    lastSeen: "Sep 5, 2024",
    confidence: 0.92,
    aliases: ["Logistics operations", "Supply logistics"],
    events: [
      { id: "evt-006", description: "Warehouse inventory levels dropped below critical threshold", timestamp: "Sep 5, 2024", type: "state_change", confidence: 0.93 },
    ],
  },
  {
    id: "ent-008",
    name: "EuroTech Industries",
    category: "organization",
    eventCount: 4,
    connectionCount: 2,
    firstSeen: "Aug 15, 2024",
    lastSeen: "Aug 20, 2024",
    confidence: 0.88,
    aliases: ["EuroTech", "EuroTech Ind."],
    events: [
      { id: "evt-009", description: "Alternative supplier contract signed with EuroTech Industries", timestamp: "Aug 20, 2024", type: "action", confidence: 0.94 },
    ],
  },
];

const categories: { value: EntityCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "organization", label: "Organization" },
  { value: "person", label: "Person" },
  { value: "location", label: "Location" },
  { value: "policy", label: "Policy" },
  { value: "sector", label: "Sector" },
  { value: "infrastructure", label: "Infrastructure" },
];

function categoryColor(cat: EntityCategory): string {
  switch (cat) {
    case "organization": return "bg-accent-1/10 text-accent-1 border-accent-1/20";
    case "person": return "bg-accent-2/10 text-accent-2 border-accent-2/20";
    case "location": return "bg-green-400/10 text-green-400 border-green-400/20";
    case "policy": return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20";
    case "sector": return "bg-accent-3/10 text-accent-3 border-accent-3/20";
    case "infrastructure": return "bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20";
  }
}

function categoryGradient(cat: EntityCategory): string {
  switch (cat) {
    case "organization": return "from-accent-1 to-accent-2";
    case "person": return "from-accent-2 to-accent-3";
    case "location": return "from-green-500 to-green-600";
    case "policy": return "from-[#f97316] to-[#ef4444]";
    case "sector": return "from-accent-3 to-[#ec4899]";
    case "infrastructure": return "from-[#ec4899] to-accent-1";
  }
}

function categoryIcon(cat: EntityCategory) {
  switch (cat) {
    case "organization":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
          <line x1="9" y1="9" x2="9" y2="9.01" /><line x1="9" y1="13" x2="9" y2="13.01" /><line x1="9" y1="17" x2="9" y2="17.01" />
        </svg>
      );
    case "person":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "policy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "sector":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "infrastructure":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
        </svg>
      );
  }
}

type SortField = "name" | "eventCount" | "connectionCount" | "confidence";
type SortDir = "asc" | "desc";

export default function EntitiesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EntityCategory | "all">("all");
  const [sortField, setSortField] = useState<SortField>("eventCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = allEntities;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.aliases.some((a) => a.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((e) => e.category === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "eventCount": cmp = a.eventCount - b.eventCount; break;
        case "connectionCount": cmp = a.connectionCount - b.connectionCount; break;
        case "confidence": cmp = a.confidence - b.confidence; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [search, categoryFilter, sortField, sortDir]);

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

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    allEntities.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const stats = [
    {
      label: "Total Entities",
      value: allEntities.length.toString(),
      gradient: "from-accent-1 to-accent-2",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Total Events",
      value: allEntities.reduce((s, e) => s + e.eventCount, 0).toString(),
      gradient: "from-accent-2 to-accent-3",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Connections",
      value: allEntities.reduce((s, e) => s + e.connectionCount, 0).toString(),
      gradient: "from-accent-3 to-[#ec4899]",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="12" r="3" />
          <line x1="8.59" y1="7.41" x2="15.42" y2="10.59" /><line x1="15.41" y1="13.41" x2="8.59" y2="16.59" />
        </svg>
      ),
    },
    {
      label: "Categories",
      value: categoryDistribution.length.toString(),
      gradient: "from-[#ec4899] to-[#f97316]",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Entities</h1>
        <p className="mt-1 text-sm text-text-muted">
          Browse all entities extracted from your documents and explore their relationships
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm">
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

      {/* Filters */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities or aliases..."
              className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-1/50 focus:bg-surface"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as EntityCategory | "all")}
            className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split("-") as [SortField, SortDir];
              setSortField(f);
              setSortDir(d);
            }}
            className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
          >
            <option value="eventCount-desc">Most Events</option>
            <option value="eventCount-asc">Fewest Events</option>
            <option value="connectionCount-desc">Most Connections</option>
            <option value="confidence-desc">Highest Confidence</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`flex h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                view === "grid" ? "bg-surface-light text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
                view === "table" ? "bg-surface-light text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Table
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          <span>{filtered.length} entit{filtered.length !== 1 ? "ies" : "y"}</span>
          {(categoryFilter !== "all" || search) && (
            <>
              <span className="h-1 w-1 rounded-full bg-text-muted" />
              <button
                onClick={() => { setSearch(""); setCategoryFilter("all"); }}
                className="text-accent-2 hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filtered.map((entity, i) => {
              const isExpanded = expandedEntity === entity.id;
              return (
                <motion.div
                  key={entity.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group relative overflow-hidden rounded-2xl border bg-surface/50 backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                    isExpanded ? "border-border-light bg-surface col-span-1 sm:col-span-2 xl:col-span-3" : "border-border hover:border-border-light hover:bg-surface"
                  }`}
                  onClick={() => setExpandedEntity(isExpanded ? null : entity.id)}
                >
                  <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${categoryGradient(entity.category)} opacity-5 transition-opacity group-hover:opacity-10`} />

                  <div className="relative p-5">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${categoryGradient(entity.category)} text-white shadow-lg`}>
                        {categoryIcon(entity.category)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-text-primary truncate">{entity.name}</h3>
                          <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${categoryColor(entity.category)}`}>
                            {entity.category}
                          </span>
                        </div>
                        {entity.aliases.length > 0 && (
                          <p className="mt-0.5 text-[10px] text-text-muted truncate">
                            aka {entity.aliases.join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Expand indicator */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>

                    {/* Metrics */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-lg font-bold text-text-primary">{entity.eventCount}</div>
                        <div className="text-[10px] text-text-muted">Events</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-text-primary">{entity.connectionCount}</div>
                        <div className="text-[10px] text-text-muted">Connections</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-text-primary">{(entity.confidence * 100).toFixed(0)}%</div>
                        <div className="text-[10px] text-text-muted">Confidence</div>
                      </div>
                    </div>

                    {/* Time range */}
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-text-muted">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {entity.firstSeen} — {entity.lastSeen}
                    </div>

                    {/* Expanded: Recent events */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 border-t border-border/60 pt-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                              Recent Events
                            </h4>
                            <div className="space-y-2">
                              {entity.events.map((event) => (
                                <div key={event.id} className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-light/30 p-3">
                                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-text-primary">{event.description}</p>
                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                                      <span>{event.timestamp}</span>
                                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                                      <span className="uppercase">{event.type.replace("_", " ")}</span>
                                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                                      <span>{(event.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 flex items-center gap-3">
                              <Link
                                href="/graph"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-xs font-medium text-accent-2 transition-colors hover:text-accent-2/80"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                  <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="12" r="3" />
                                  <line x1="8.59" y1="7.41" x2="15.42" y2="10.59" /><line x1="15.41" y1="13.41" x2="8.59" y2="16.59" />
                                </svg>
                                View in graph
                              </Link>
                              <Link
                                href="/events"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-xs font-medium text-accent-2 transition-colors hover:text-accent-2/80"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                All events
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Entity
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted sm:table-cell">
                      Category
                    </th>
                    <th
                      className="cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary"
                      onClick={() => toggleSort("eventCount")}
                    >
                      Events {sortIcon("eventCount")}
                    </th>
                    <th
                      className="hidden cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary md:table-cell"
                      onClick={() => toggleSort("connectionCount")}
                    >
                      Connections {sortIcon("connectionCount")}
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted lg:table-cell">
                      Active Period
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
                    {filtered.map((entity, i) => (
                      <motion.tr
                        key={entity.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`transition-colors hover:bg-surface-light ${
                          i < filtered.length - 1 ? "border-b border-border/60" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${categoryGradient(entity.category)} text-white text-xs`}>
                              {categoryIcon(entity.category)}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">{entity.name}</div>
                              {entity.aliases.length > 0 && (
                                <div className="mt-0.5 text-[10px] text-text-muted truncate max-w-[180px]">
                                  aka {entity.aliases[0]}
                                  {entity.aliases.length > 1 && ` +${entity.aliases.length - 1}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-5 py-3.5 sm:table-cell">
                          <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColor(entity.category)}`}>
                            {entity.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary">{entity.eventCount}</td>
                        <td className="hidden px-5 py-3.5 text-text-secondary md:table-cell">{entity.connectionCount}</td>
                        <td className="hidden px-5 py-3.5 lg:table-cell">
                          <span className="text-xs text-text-muted whitespace-nowrap">{entity.firstSeen} — {entity.lastSeen}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                            entity.confidence >= 0.9
                              ? "bg-green-400/10 text-green-400"
                              : entity.confidence >= 0.8
                              ? "bg-accent-2/10 text-accent-2"
                              : "bg-[#f97316]/10 text-[#f97316]"
                          }`}>
                            {(entity.confidence * 100).toFixed(0)}%
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
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-sm">No entities match your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Category distribution */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Category Distribution</h2>
        <div className="rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm">
          <div className="space-y-3">
            {categoryDistribution.map(([cat, count]) => {
              const pct = (count / allEntities.length) * 100;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="flex w-28 items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${categoryGradient(cat as EntityCategory)} text-white`}>
                      {categoryIcon(cat as EntityCategory)}
                    </span>
                    <span className="text-xs font-medium text-text-secondary capitalize">{cat}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${categoryGradient(cat as EntityCategory)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs font-medium text-text-muted">{count} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

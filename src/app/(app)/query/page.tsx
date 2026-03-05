"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

type IntentType =
  | "CAUSAL_WHY"
  | "TEMPORAL_RANGE"
  | "SIMILARITY"
  | "ENTITY_TIMELINE"
  | "COUNTERFACTUAL"
  | "GENERAL";

interface SourceDoc {
  name: string;
  relevance: number;
}

interface EventResult {
  id: string;
  description: string;
  entity: string;
  timestamp: string;
  confidence: number;
  type: string;
}

interface QueryResult {
  id: string;
  query: string;
  intent: IntentType;
  intentConfidence: number;
  answer: string;
  events: EventResult[];
  sources: SourceDoc[];
  timestamp: string;
}

const suggestedQueries = [
  { text: "Why did revenue drop in Q3?", intent: "CAUSAL_WHY" as IntentType },
  { text: "What happened between July and September 2024?", intent: "TEMPORAL_RANGE" as IntentType },
  { text: "Find events similar to the supply chain disruption", intent: "SIMILARITY" as IntentType },
  { text: "Show me everything about Acme Corp", intent: "ENTITY_TIMELINE" as IntentType },
  { text: "What if the trade regulations hadn't been enacted?", intent: "COUNTERFACTUAL" as IntentType },
];

const mockResults: QueryResult[] = [
  {
    id: "qr-001",
    query: "Why did revenue drop in Q3?",
    intent: "CAUSAL_WHY",
    intentConfidence: 0.94,
    answer:
      "Revenue declined 15% in Q3 primarily due to a cascade of supply chain disruptions across the Asia-Pacific region beginning in July 2024. New semiconductor import regulations enacted in September further constrained production capacity, which was reduced by 20% at primary facilities. The causal chain shows: trade regulations → supply chain disruption → production cuts → revenue decline.",
    events: [
      {
        id: "evt-001",
        description: "Supply chain disruptions reported across Asia-Pacific region",
        entity: "Asia-Pacific Supply Chain",
        timestamp: "Oct 15, 2024",
        confidence: 0.95,
        type: "state_change",
      },
      {
        id: "evt-002",
        description: "Q3 revenue declined 15% year-over-year for manufacturing sector",
        entity: "Manufacturing Sector",
        timestamp: "Oct 1, 2024",
        confidence: 0.92,
        type: "action",
      },
      {
        id: "evt-003",
        description: "New trade regulations enacted affecting semiconductor imports",
        entity: "Trade Policy",
        timestamp: "Sep 20, 2024",
        confidence: 0.88,
        type: "state_change",
      },
      {
        id: "evt-004",
        description: "Production capacity reduced by 20% at primary facilities",
        entity: "Production Operations",
        timestamp: "Sep 15, 2024",
        confidence: 0.91,
        type: "action",
      },
    ],
    sources: [
      { name: "Q3_Financial_Report.pdf", relevance: 0.96 },
      { name: "supply_chain_analysis.docx", relevance: 0.89 },
      { name: "trade_regulations_update.md", relevance: 0.82 },
    ],
    timestamp: "Just now",
  },
];

function intentColor(intent: IntentType): string {
  switch (intent) {
    case "CAUSAL_WHY": return "bg-accent-1/10 text-accent-1 border-accent-1/20";
    case "TEMPORAL_RANGE": return "bg-accent-2/10 text-accent-2 border-accent-2/20";
    case "SIMILARITY": return "bg-accent-3/10 text-accent-3 border-accent-3/20";
    case "ENTITY_TIMELINE": return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20";
    case "COUNTERFACTUAL": return "bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20";
    default: return "bg-text-muted/10 text-text-muted border-text-muted/20";
  }
}

function intentLabel(intent: IntentType): string {
  return intent.replace(/_/g, " ");
}

function intentIcon(intent: IntentType) {
  switch (intent) {
    case "CAUSAL_WHY":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "TEMPORAL_RANGE":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "SIMILARITY":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "ENTITY_TIMELINE":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "COUNTERFACTUAL":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
  }
}

export default function QueryPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = useCallback(
    (query?: string) => {
      const q = query ?? input.trim();
      if (!q || isLoading) return;

      setInput("");
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        const mockResult: QueryResult = {
          ...mockResults[0],
          id: crypto.randomUUID(),
          query: q,
          timestamp: "Just now",
        };
        setResults((prev) => [mockResult, ...prev]);
        setExpandedResult(mockResult.id);
        setIsLoading(false);
      }, 1500);
    },
    [input, isLoading]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Query
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Ask questions about your knowledge base using natural language
        </p>
      </motion.div>

      {/* Query input */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="relative rounded-2xl border border-border bg-surface/50 backdrop-blur-sm transition-all duration-300 focus-within:border-accent-1/50 focus-within:bg-surface/80">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="w-full resize-none rounded-2xl bg-transparent px-5 pt-5 pb-14 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-surface-light px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                Enter
              </kbd>
              <span className="text-[10px] text-text-muted">to send</span>
              <span className="mx-1 text-[10px] text-text-muted/50">|</span>
              <kbd className="rounded border border-border bg-surface-light px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                Shift+Enter
              </kbd>
              <span className="text-[10px] text-text-muted">new line</span>
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="flex h-8 items-center gap-2 rounded-lg bg-gradient-to-r from-accent-1 to-accent-2 px-4 text-xs font-semibold text-white shadow-lg transition-opacity disabled:opacity-40 hover:opacity-90"
            >
              {isLoading ? (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              Send
            </button>
          </div>
        </div>
      </motion.div>

      {/* Suggested queries */}
      {results.length === 0 && !isLoading && (
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <h2 className="mb-3 text-sm font-semibold text-text-muted">
            Try asking
          </h2>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq) => (
              <button
                key={sq.text}
                onClick={() => {
                  setInput(sq.text);
                  handleSubmit(sq.text);
                }}
                className="group flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-text-secondary backdrop-blur-sm transition-all duration-200 hover:border-border-light hover:bg-surface hover:text-text-primary"
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${intentColor(sq.intent)}`}>
                  {intentIcon(sq.intent)}
                </span>
                {sq.text}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-1 to-accent-2">
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">Analyzing your query...</div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-2" />
                    </span>
                    Classifying intent and extracting parameters
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
                    Searching temporal knowledge graph
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted/30" />
                    Generating answer with source attribution
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results.map((result) => {
          const isExpanded = expandedResult === result.id;
          return (
            <motion.div
              key={result.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-surface/50 backdrop-blur-sm overflow-hidden"
            >
              {/* Query header */}
              <button
                onClick={() => setExpandedResult(isExpanded ? null : result.id)}
                className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-surface/80"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-2 to-accent-3 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">
                    &ldquo;{result.query}&rdquo;
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${intentColor(result.intent)}`}>
                      {intentIcon(result.intent)}
                      {intentLabel(result.intent)}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Confidence: {(result.intentConfidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {result.timestamp}
                    </span>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-5 pb-5">
                      {/* Answer */}
                      <div className="mt-5">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                          Answer
                        </h3>
                        <p className="text-sm leading-relaxed text-text-secondary">
                          {result.answer}
                        </p>
                      </div>

                      {/* Related events */}
                      <div className="mt-6">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                          Related Events
                          <span className="ml-1.5 text-text-muted/60">({result.events.length})</span>
                        </h3>
                        <div className="space-y-2">
                          {result.events.map((event, i) => (
                            <div
                              key={event.id}
                              className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-light/30 p-3"
                            >
                              {/* Timeline dot */}
                              <div className="mt-1.5 flex flex-col items-center">
                                <div className="h-2 w-2 rounded-full bg-accent-2" />
                                {i < result.events.length - 1 && (
                                  <div className="mt-1 h-8 w-px bg-border" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-text-primary">
                                  {event.description}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                                  <span className="font-medium text-text-secondary">{event.entity}</span>
                                  <span className="h-1 w-1 rounded-full bg-text-muted" />
                                  <span>{event.timestamp}</span>
                                  <span className="h-1 w-1 rounded-full bg-text-muted" />
                                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                                    event.confidence >= 0.9
                                      ? "bg-green-400/10 text-green-400"
                                      : "bg-accent-2/10 text-accent-2"
                                  }`}>
                                    {(event.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sources */}
                      <div className="mt-6">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                          Sources
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.sources.map((source) => (
                            <div
                              key={source.name}
                              className="flex items-center gap-2 rounded-lg border border-border bg-surface-light/50 px-3 py-2"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-text-muted">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <span className="text-xs font-medium text-text-secondary">
                                {source.name}
                              </span>
                              <span className="rounded bg-accent-2/10 px-1.5 py-0.5 text-[9px] font-semibold text-accent-2">
                                {(source.relevance * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Intent types reference */}
      {results.length === 0 && !isLoading && (
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            Supported Query Types
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                intent: "CAUSAL_WHY" as IntentType,
                title: "Causal Analysis",
                description: "Understand why events happened and trace cause-effect chains",
                example: "Why did production capacity decrease?",
              },
              {
                intent: "TEMPORAL_RANGE" as IntentType,
                title: "Temporal Range",
                description: "Find events within a specific time window",
                example: "What happened in September 2024?",
              },
              {
                intent: "SIMILARITY" as IntentType,
                title: "Similarity Search",
                description: "Find events similar to a reference event or description",
                example: "Find events like the supply chain disruption",
              },
              {
                intent: "ENTITY_TIMELINE" as IntentType,
                title: "Entity Timeline",
                description: "Get the complete history of a specific entity",
                example: "Show me everything about Acme Corp",
              },
              {
                intent: "COUNTERFACTUAL" as IntentType,
                title: "Counterfactual",
                description: "Explore alternative scenarios and their potential outcomes",
                example: "What if the merger hadn't happened?",
              },
              {
                intent: "GENERAL" as IntentType,
                title: "General Query",
                description: "Open-ended questions answered from your knowledge base",
                example: "Summarize the key trends this quarter",
              },
            ].map((item) => (
              <div
                key={item.intent}
                className="group rounded-xl border border-border bg-surface/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-border-light hover:bg-surface"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${intentColor(item.intent)}`}>
                    {intentIcon(item.intent)}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
                <p className="mt-2 text-[11px] italic text-text-muted/70">
                  &ldquo;{item.example}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

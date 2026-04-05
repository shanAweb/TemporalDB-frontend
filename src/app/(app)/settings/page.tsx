"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

type Tab = "general" | "pipeline" | "connections" | "api" | "danger";

const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
  {
    value: "general",
    label: "General",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    value: "pipeline",
    label: "Pipeline",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    value: "connections",
    label: "Connections",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    value: "api",
    label: "API Keys",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
  {
    value: "danger",
    label: "Danger Zone",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? "bg-accent-1" : "bg-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        {description && <div className="mt-0.5 text-xs text-text-muted leading-relaxed">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
      {title && (
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-border/60 px-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  // General
  const [projectName, setProjectName] = useState("TemporalDB Project");
  const [autoProcess, setAutoProcess] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // Pipeline
  const [nerModel, setNerModel] = useState("spacy-lg");
  const [corefEnabled, setCorefEnabled] = useState(true);
  const [temporalParser, setTemporalParser] = useState("sutime");
  const [causalThreshold, setCausalThreshold] = useState("0.75");
  const [embeddingModel, setEmbeddingModel] = useState("nomic-embed");
  const [chunkSize, setChunkSize] = useState("512");
  const [chunkOverlap, setChunkOverlap] = useState("64");

  // Connections
  const [pgHost, setPgHost] = useState("localhost:5432");
  const [pgDb, setPgDb] = useState("temporaldb");
  const [neoHost, setNeoHost] = useState("localhost:7474");
  const [redisHost, setRedisHost] = useState("localhost:6379");
  const [redpandaHost, setRedpandaHost] = useState("localhost:9092");
  const [ollamaHost, setOllamaHost] = useState("localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.1:8b");

  // API
  const [apiKeys] = useState([
    { id: "key-1", name: "Production API Key", key: "tdb_prod_••••••••••••k8f2", created: "Oct 10, 2024", lastUsed: "2 hours ago" },
    { id: "key-2", name: "Development Key", key: "tdb_dev_••••••••••••m3j7", created: "Sep 5, 2024", lastUsed: "5 days ago" },
  ]);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure your TemporalDB instance and processing pipeline
        </p>
      </motion.div>

      {/* Tabs + Content */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex gap-8">
          {/* Sidebar tabs */}
          <nav className="hidden w-48 shrink-0 space-y-1 sm:block">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.value
                    ? "bg-accent-1/10 text-text-primary"
                    : "text-text-muted hover:bg-surface-light hover:text-text-secondary"
                }`}
              >
                <span className={activeTab === tab.value ? "text-accent-2" : ""}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 sm:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-accent-1/10 text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* General */}
            {activeTab === "general" && (
              <>
                <SectionCard title="Project">
                  <SettingRow label="Project Name" description="Display name for this TemporalDB instance">
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="h-9 w-56 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-1/50 focus:bg-surface"
                    />
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Processing">
                  <SettingRow label="Auto-process uploads" description="Automatically run the NLP pipeline on new documents">
                    <Toggle checked={autoProcess} onChange={setAutoProcess} />
                  </SettingRow>
                  <SettingRow label="Notifications" description="Show desktop notifications when processing completes">
                    <Toggle checked={notifications} onChange={setNotifications} />
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Appearance">
                  <SettingRow label="Dark mode" description="Use dark color scheme (recommended)">
                    <Toggle checked={darkMode} onChange={setDarkMode} />
                  </SettingRow>
                  <SettingRow label="Compact view" description="Reduce spacing in tables and lists">
                    <Toggle checked={compactView} onChange={setCompactView} />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* Pipeline */}
            {activeTab === "pipeline" && (
              <>
                <SectionCard title="NLP Models">
                  <SettingRow label="NER Model" description="Named Entity Recognition model for extracting entities">
                    <select
                      value={nerModel}
                      onChange={(e) => setNerModel(e.target.value)}
                      className="h-9 w-48 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
                    >
                      <option value="spacy-sm">spaCy (small)</option>
                      <option value="spacy-lg">spaCy (large)</option>
                      <option value="flair">Flair NER</option>
                      <option value="stanza">Stanza</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Coreference Resolution" description="Resolve pronouns and references to the same entity">
                    <Toggle checked={corefEnabled} onChange={setCorefEnabled} />
                  </SettingRow>
                  <SettingRow label="Temporal Parser" description="Engine for parsing and normalizing time expressions">
                    <select
                      value={temporalParser}
                      onChange={(e) => setTemporalParser(e.target.value)}
                      className="h-9 w-48 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
                    >
                      <option value="sutime">SUTime</option>
                      <option value="heideltime">HeidelTime</option>
                      <option value="duckling">Duckling</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Embedding Model" description="Model for generating semantic vector embeddings">
                    <select
                      value={embeddingModel}
                      onChange={(e) => setEmbeddingModel(e.target.value)}
                      className="h-9 w-48 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
                    >
                      <option value="nomic-embed">Nomic Embed</option>
                      <option value="bge-large">BGE Large</option>
                      <option value="e5-large">E5 Large</option>
                      <option value="gte-large">GTE Large</option>
                    </select>
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Extraction">
                  <SettingRow label="Causal Confidence Threshold" description="Minimum confidence score to create a causal link">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.5"
                        max="0.99"
                        step="0.01"
                        value={causalThreshold}
                        onChange={(e) => setCausalThreshold(e.target.value)}
                        className="w-28 accent-accent-1"
                      />
                      <span className="w-10 text-right text-xs font-medium text-text-secondary tabular-nums">
                        {Number(causalThreshold).toFixed(2)}
                      </span>
                    </div>
                  </SettingRow>
                  <SettingRow label="Chunk Size" description="Number of tokens per document chunk">
                    <input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value)}
                      className="h-9 w-24 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-1/50 text-right tabular-nums"
                    />
                  </SettingRow>
                  <SettingRow label="Chunk Overlap" description="Overlap tokens between consecutive chunks">
                    <input
                      type="number"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(e.target.value)}
                      className="h-9 w-24 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-1/50 text-right tabular-nums"
                    />
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* Connections */}
            {activeTab === "connections" && (
              <>
                <SectionCard title="Databases">
                  <SettingRow label="PostgreSQL" description="Primary relational store for documents and metadata">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pgHost}
                        onChange={(e) => setPgHost(e.target.value)}
                        className="h-9 w-40 rounded-lg border border-border bg-surface/60 px-3 text-xs font-mono text-text-primary outline-none transition-colors focus:border-accent-1/50"
                      />
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                      </span>
                    </div>
                  </SettingRow>
                  <SettingRow label="Database Name">
                    <input
                      type="text"
                      value={pgDb}
                      onChange={(e) => setPgDb(e.target.value)}
                      className="h-9 w-40 rounded-lg border border-border bg-surface/60 px-3 text-xs font-mono text-text-primary outline-none transition-colors focus:border-accent-1/50"
                    />
                  </SettingRow>
                  <SettingRow label="Neo4j" description="Graph database for entity relationships and causal chains">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={neoHost}
                        onChange={(e) => setNeoHost(e.target.value)}
                        className="h-9 w-40 rounded-lg border border-border bg-surface/60 px-3 text-xs font-mono text-text-primary outline-none transition-colors focus:border-accent-1/50"
                      />
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                      </span>
                    </div>
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Infrastructure">
                  <SettingRow label="Redis" description="Cache layer and session storage">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={redisHost}
                        onChange={(e) => setRedisHost(e.target.value)}
                        className="h-9 w-40 rounded-lg border border-border bg-surface/60 px-3 text-xs font-mono text-text-primary outline-none transition-colors focus:border-accent-1/50"
                      />
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                      </span>
                    </div>
                  </SettingRow>
                  <SettingRow label="Redpanda" description="Event streaming for pipeline processing queue">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={redpandaHost}
                        onChange={(e) => setRedpandaHost(e.target.value)}
                        className="h-9 w-40 rounded-lg border border-border bg-surface/60 px-3 text-xs font-mono text-text-primary outline-none transition-colors focus:border-accent-1/50"
                      />
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                      </span>
                    </div>
                  </SettingRow>
                </SectionCard>

                <SectionCard title="LLM">
                  <SettingRow label="Ollama Host" description="Local LLM inference server">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ollamaHost}
                        onChange={(e) => setOllamaHost(e.target.value)}
                        className="h-9 w-40 rounded-lg border border-border bg-surface/60 px-3 text-xs font-mono text-text-primary outline-none transition-colors focus:border-accent-1/50"
                      />
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                      </span>
                    </div>
                  </SettingRow>
                  <SettingRow label="Default Model" description="LLM model for causal reasoning and query answering">
                    <select
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className="h-9 w-48 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
                    >
                      <option value="llama3.1:8b">Llama 3.1 (8B)</option>
                      <option value="llama3.1:70b">Llama 3.1 (70B)</option>
                      <option value="mistral:7b">Mistral (7B)</option>
                      <option value="mixtral:8x7b">Mixtral (8x7B)</option>
                      <option value="qwen2.5:14b">Qwen 2.5 (14B)</option>
                    </select>
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* API Keys */}
            {activeTab === "api" && (
              <>
                <SectionCard title="API Keys">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary">{key.name}</div>
                        <div className="mt-0.5 font-mono text-xs text-text-muted">{key.key}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted">
                          <span>Created {key.created}</span>
                          <span className="h-1 w-1 rounded-full bg-text-muted" />
                          <span>Last used {key.lastUsed}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary">
                          Regenerate
                        </button>
                        <button className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10">
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </SectionCard>

                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Generate New API Key
                </button>

                <SectionCard title="API Endpoints">
                  <SettingRow label="Base URL" description="Root endpoint for the TemporalDB REST API">
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs font-mono text-text-secondary">
                        http://localhost:8000/api/v1
                      </code>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                    </div>
                  </SettingRow>
                  <SettingRow label="WebSocket" description="Real-time streaming for pipeline status updates">
                    <code className="rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs font-mono text-text-secondary">
                      ws://localhost:8000/ws
                    </code>
                  </SettingRow>
                </SectionCard>
              </>
            )}

            {/* Danger Zone */}
            {activeTab === "danger" && (
              <>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5">
                  <div className="border-b border-red-500/20 px-5 py-3">
                    <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
                    <p className="mt-0.5 text-xs text-text-muted">These actions are irreversible. Proceed with caution.</p>
                  </div>
                  <div className="divide-y divide-red-500/10 px-5">
                    <div className="flex items-center justify-between gap-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary">Clear all events</div>
                        <div className="mt-0.5 text-xs text-text-muted">Remove all extracted events from the database. Documents will be preserved.</div>
                      </div>
                      <button className="shrink-0 rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10">
                        Clear Events
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary">Reset knowledge graph</div>
                        <div className="mt-0.5 text-xs text-text-muted">Delete all nodes and edges from Neo4j. Requires re-processing all documents.</div>
                      </div>
                      <button className="shrink-0 rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10">
                        Reset Graph
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary">Delete all data</div>
                        <div className="mt-0.5 text-xs text-text-muted">Permanently remove all documents, events, entities, and graph data. This cannot be undone.</div>
                      </div>
                      <button className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20">
                        Delete Everything
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Save button */}
            {activeTab !== "danger" && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                >
                  {saved ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-green-400"
                  >
                    Settings updated successfully
                  </motion.span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

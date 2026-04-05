"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { connectorsApi, oauthApi, type Connector, type ConnectorType, type SyncStatus } from "@/lib/api";
import ConnectorFormModal from "@/components/app/ConnectorFormModal";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusBadge(status: SyncStatus | null) {
  if (!status) return <span className="text-xs text-text-muted">—</span>;
  const styles: Record<SyncStatus, string> = {
    success: "bg-green-400/10 text-green-400 border-green-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    partial: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    running: "bg-accent-2/10 text-accent-2 border-accent-2/20",
  };
  const labels: Record<SyncStatus, string> = { success: "Success", error: "Error", partial: "Partial", running: "Running…" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {labels[status]}
    </span>
  );
}

const TYPE_LABELS: Record<ConnectorType, string> = { jira: "Jira", clickup: "ClickUp", timedoctor: "Time Doctor" };
const TYPE_COLORS: Record<ConnectorType, string> = {
  jira: "from-[#0052CC] to-[#2684FF]",
  clickup: "from-[#7B68EE] to-[#FF79C6]",
  timedoctor: "from-[#00B4D8] to-[#0077B6]",
};

function TypeIcon({ type }: { type: ConnectorType }) {
  const icons: Record<ConnectorType, React.ReactNode> = {
    jira: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4 text-white">
        <path d="M15.993 1.01C8.84 1.01 3.04 6.81 3.04 13.963c0 4.13 1.916 7.817 4.912 10.256L15.993 31l8.04-6.781c2.997-2.44 4.913-6.126 4.913-10.256 0-7.153-5.8-12.953-12.953-12.953zm0 19.905c-3.84 0-6.952-3.112-6.952-6.952s3.112-6.952 6.952-6.952 6.952 3.112 6.952 6.952-3.112 6.952-6.952 6.952zm0-10.92a3.968 3.968 0 1 0 0 7.936 3.968 3.968 0 0 0 0-7.936z" />
      </svg>
    ),
    clickup: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4 text-white">
        <path d="M4 20.5l3.5-2.7c1.8 2.4 4.4 3.8 7.1 3.8 2.7 0 5.2-1.4 7.1-3.8l3.5 2.7C22.6 23.7 19.4 25.5 15.6 25.5S8.6 23.7 4 20.5zM15.6 6.5l-8 6.9-3-3.3L15.6 1l11 9.1-3 3.3-8-6.9z" />
      </svg>
    ),
    timedoctor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
        <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  };
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${TYPE_COLORS[type]}`}>
      {icons[type]}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface/50 p-5">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-surface-light" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-light" />
              <div className="h-3 w-24 animate-pulse rounded bg-surface-light" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-light" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [oauthConnecting, setOauthConnecting] = useState<ConnectorType | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Connector | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchConnectors = useCallback(async () => {
    try {
      const data = await connectorsApi.list();
      setConnectors(data.connectors);
    } catch {
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnectors(); }, [fetchConnectors]);

  const handleSyncNow = async (id: string) => {
    setSyncing((prev) => ({ ...prev, [id]: true }));
    try {
      await connectorsApi.syncNow(id);
      setTimeout(() => fetchConnectors(), 1500);
    } finally {
      setSyncing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await connectorsApi.delete(id);
      setConnectors((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleOAuthConnect = (type: ConnectorType) => {
    setOauthError(null);
    setOauthConnecting(type);

    const url = oauthApi.authorizeUrl(type);
    const popup = window.open(url, `oauth_${type}`, "width=600,height=720,scrollbars=yes,resizable=yes");

    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "oauth_success") {
        window.removeEventListener("message", handler);
        setOauthConnecting(null);
        fetchConnectors();
      } else if (event.data?.type === "oauth_error") {
        window.removeEventListener("message", handler);
        setOauthConnecting(null);
        setOauthError(event.data.message || "OAuth connection failed.");
      }
    };
    window.addEventListener("message", handler);

    // If user closes popup without completing
    const poll = setInterval(() => {
      if (popup?.closed) {
        clearInterval(poll);
        window.removeEventListener("message", handler);
        setOauthConnecting(null);
      }
    }, 500);
  };

  const handleSaved = (connector: Connector) => {
    setConnectors((prev) => {
      const idx = prev.findIndex((c) => c.id === connector.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = connector; return next; }
      return [connector, ...prev];
    });
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Connectors</h1>
          <p className="mt-1 text-sm text-text-muted">Sync Jira, ClickUp, and Time Doctor into TemporalDB</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Connector
        </button>
      </motion.div>

      {/* Quick Connect */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="rounded-2xl border border-border bg-surface/50 p-5">
          <p className="text-sm font-semibold text-text-primary">Quick Connect</p>
          <p className="mt-0.5 text-xs text-text-muted">Connect your existing logged-in account with one click</p>
          {oauthError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-3.5 w-3.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {oauthError}
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["jira", "clickup", "timedoctor"] as ConnectorType[]).map((type) => {
              const labels = { jira: "Jira", clickup: "ClickUp", timedoctor: "Time Doctor" };
              const isConnecting = oauthConnecting === type;
              return (
                <button
                  key={type}
                  onClick={() => handleOAuthConnect(type)}
                  disabled={oauthConnecting !== null}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-light hover:bg-surface-light disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${TYPE_COLORS[type]}`}>
                    {isConnecting ? (
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary">
                      {isConnecting ? "Connecting…" : `Connect ${labels[type]}`}
                    </p>
                    <p className="text-[10px] text-text-muted">Use your logged-in account</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        {loading ? <LoadingSkeleton /> : connectors.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/30 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-text-muted">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">No connectors yet</p>
            <p className="mt-1 text-xs text-text-muted">Connect Jira, ClickUp, or Time Doctor to start syncing</p>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              Add your first connector
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {connectors.map((connector, i) => (
                <motion.div
                  key={connector.id}
                  layout
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group relative rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm transition-colors hover:border-border-light"
                >
                  <div className="flex items-center gap-4">
                    <TypeIcon type={connector.connector_type} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">{connector.name}</span>
                        <span className="rounded-md bg-surface-light px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                          {TYPE_LABELS[connector.connector_type]}
                        </span>
                        {!connector.is_enabled && (
                          <span className="rounded-md bg-surface-light px-1.5 py-0.5 text-[10px] font-medium text-text-muted">Disabled</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span>Last sync: {relativeTime(connector.last_synced_at)}</span>
                        {connector.last_run && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-text-muted" />
                            <span>{connector.last_run.items_ingested} ingested</span>
                            {connector.last_run.items_skipped > 0 && (
                              <><span className="h-1 w-1 rounded-full bg-text-muted" /><span>{connector.last_run.items_skipped} skipped</span></>
                            )}
                          </>
                        )}
                        <span className="h-1 w-1 rounded-full bg-text-muted" />
                        {statusBadge(connector.last_sync_status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/connectors/${connector.id}/runs`}
                        className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary sm:block"
                      >
                        History
                      </Link>

                      <button
                        onClick={() => handleSyncNow(connector.id)}
                        disabled={syncing[connector.id] || connector.last_run?.status === "running"}
                        className="flex items-center gap-1.5 rounded-lg border border-accent-1/30 bg-accent-1/5 px-3 py-1.5 text-xs font-medium text-accent-2 transition-colors hover:bg-accent-1/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {syncing[connector.id] ? (
                          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                          </svg>
                        )}
                        Sync Now
                      </button>

                      {/* Three-dot menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === connector.id ? null : connector.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {menuOpen === connector.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 top-9 z-10 w-40 rounded-xl border border-border bg-surface shadow-lg"
                            >
                              <button
                                onClick={() => { setEditing(connector); setShowModal(true); setMenuOpen(null); }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-light"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => { setDeleteConfirm(connector.id); setMenuOpen(null); }}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Delete confirm dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
              <h3 className="text-base font-semibold text-text-primary">Delete connector?</h3>
              <p className="mt-2 text-sm text-text-muted">This will permanently delete the connector and all its sync history. This cannot be undone.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-light">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-red-500/10 border border-red-500/30 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dismiss menu on outside click */}
      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />}

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showModal && (
          <ConnectorFormModal
            editing={editing}
            onClose={() => { setShowModal(false); setEditing(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

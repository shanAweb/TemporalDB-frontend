"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { connectorsApi, type Connector, type SyncRun, type SyncStatus } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function duration(run: SyncRun): string {
  if (!run.finished_at) return "—";
  const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function StatusBadge({ status }: { status: SyncStatus }) {
  const styles: Record<SyncStatus, string> = {
    success: "bg-green-400/10 text-green-400 border-green-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    partial: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    running: "bg-accent-2/10 text-accent-2 border-accent-2/20",
  };
  const labels: Record<SyncStatus, string> = { success: "Success", error: "Error", partial: "Partial", running: "Running" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {labels[status]}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i < 4 ? "border-b border-border/60" : ""}`}>
          <div className="h-5 w-16 animate-pulse rounded bg-surface-light" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-surface-light" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface-light" />
          </div>
          <div className="h-5 w-20 animate-pulse rounded bg-surface-light" />
        </div>
      ))}
    </div>
  );
}

export default function RunHistoryPage() {
  const params = useParams<{ id: string }>();
  const connectorId = params.id;

  const [connector, setConnector] = useState<Connector | null>(null);
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [c, r] = await Promise.all([
        connectorsApi.get(connectorId),
        connectorsApi.listRuns(connectorId, 0, 50),
      ]);
      setConnector(c);
      setRuns(r.runs);
      setTotal(r.total);
    } finally {
      setLoading(false);
    }
  }, [connectorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await connectorsApi.syncNow(connectorId);
      setTimeout(() => fetchData(), 1500);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb + Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/connectors" className="transition-colors hover:text-text-secondary">Connectors</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-text-secondary">{connector?.name ?? "…"}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>Sync History</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {connector?.name ?? "Sync History"}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {total} sync run{total !== 1 ? "s" : ""} · {connector?.sync_schedule}
            </p>
          </div>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {syncing ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            )}
            Sync Now
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        {loading ? <LoadingSkeleton /> : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/30 py-16 text-center">
            <p className="text-sm font-medium text-text-primary">No sync runs yet</p>
            <p className="mt-1 text-xs text-text-muted">Click "Sync Now" to trigger the first sync</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Started</th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted md:table-cell">Duration</th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted sm:table-cell">Fetched</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Ingested</th>
                    <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted lg:table-cell">Skipped</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run, i) => (
                    <tr
                      key={run.id}
                      className={`transition-colors hover:bg-surface-light ${i < runs.length - 1 ? "border-b border-border/60" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-text-secondary">
                        {formatDate(run.started_at)}
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs tabular-nums text-text-muted md:table-cell">
                        {duration(run)}
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs tabular-nums text-text-muted sm:table-cell">
                        {run.items_fetched}
                      </td>
                      <td className="px-5 py-3.5 text-xs tabular-nums font-medium text-text-secondary">
                        {run.items_ingested}
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs tabular-nums text-text-muted lg:table-cell">
                        {run.items_skipped}
                      </td>
                      <td className="px-5 py-3.5">
                        {run.error_message ? (
                          <button
                            onClick={() => setExpandedError(expandedError === run.id ? null : run.id)}
                            className="max-w-[180px] truncate text-left text-xs text-red-400 transition-colors hover:text-red-300"
                          >
                            {expandedError === run.id ? run.error_message : run.error_message.slice(0, 40) + (run.error_message.length > 40 ? "…" : "")}
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const ACCEPTED_TYPES = [
  { ext: ".pdf", mime: "application/pdf", label: "PDF" },
  { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX" },
  { ext: ".txt", mime: "text/plain", label: "TXT" },
  { ext: ".md", mime: "text/markdown", label: "Markdown" },
];

const ACCEPT_STRING = ACCEPTED_TYPES.map((t) => t.mime).join(",") + ",.md,.txt,.pdf,.docx";

type FileStatus = "pending" | "uploading" | "processing" | "done" | "error";

interface QueuedFile {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}

const recentIngestions = [
  {
    id: "doc-001",
    name: "Q3_Financial_Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    timestamp: "2 hours ago",
    events: 47,
    entities: 23,
    status: "completed" as const,
  },
  {
    id: "doc-002",
    name: "supply_chain_analysis.docx",
    type: "DOCX",
    size: "1.1 MB",
    timestamp: "5 hours ago",
    events: 31,
    entities: 18,
    status: "completed" as const,
  },
  {
    id: "doc-003",
    name: "trade_regulations_update.md",
    type: "Markdown",
    size: "48 KB",
    timestamp: "1 day ago",
    events: 12,
    entities: 9,
    status: "completed" as const,
  },
  {
    id: "doc-004",
    name: "meeting_notes_oct.txt",
    type: "TXT",
    size: "15 KB",
    timestamp: "1 day ago",
    events: 8,
    entities: 5,
    status: "completed" as const,
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fileTypeLabel(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "PDF";
    case "docx": return "DOCX";
    case "txt": return "TXT";
    case "md": return "Markdown";
    default: return ext?.toUpperCase() ?? "Unknown";
  }
}

function fileTypeGradient(type: string): string {
  switch (type) {
    case "PDF": return "from-red-500 to-red-600";
    case "DOCX": return "from-blue-500 to-blue-600";
    case "TXT": return "from-text-muted to-text-secondary";
    case "Markdown": return "from-accent-3 to-accent-1";
    default: return "from-accent-1 to-accent-2";
  }
}

function statusColor(status: FileStatus): string {
  switch (status) {
    case "pending": return "text-text-muted";
    case "uploading": return "text-accent-2";
    case "processing": return "text-accent-3";
    case "done": return "text-green-400";
    case "error": return "text-red-400";
  }
}

function statusLabel(status: FileStatus): string {
  switch (status) {
    case "pending": return "Pending";
    case "uploading": return "Uploading...";
    case "processing": return "Processing...";
    case "done": return "Complete";
    case "error": return "Failed";
  }
}

export default function IngestPage() {
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: QueuedFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending" as FileStatus,
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((f) => f.status !== "done"));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const simulateUpload = useCallback(() => {
    setQueue((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as FileStatus, progress: 0 } : f
      )
    );

    // Simulate progress for demo purposes
    const interval = setInterval(() => {
      setQueue((prev) => {
        let allDone = true;
        const updated = prev.map((f) => {
          if (f.status === "uploading") {
            const next = Math.min(f.progress + Math.random() * 25, 100);
            if (next >= 100) {
              return { ...f, status: "processing" as FileStatus, progress: 100 };
            }
            allDone = false;
            return { ...f, progress: next };
          }
          if (f.status === "processing") {
            // Simulate processing completing after a tick
            return { ...f, status: "done" as FileStatus, progress: 100 };
          }
          return f;
        });
        if (allDone && updated.every((f) => f.status === "done" || f.status === "error" || f.status === "pending")) {
          clearInterval(interval);
        }
        return updated;
      });
    }, 600);
  }, []);

  const pendingCount = queue.filter((f) => f.status === "pending").length;
  const hasCompleted = queue.some((f) => f.status === "done");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Ingest Documents
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Upload documents to extract events, entities, and causal relationships
        </p>
      </motion.div>

      {/* Upload zone */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
            dragOver
              ? "border-accent-2 bg-accent-2/5"
              : "border-border bg-surface/30 hover:border-border-light hover:bg-surface/50"
          }`}
        >
          <input
            type="file"
            multiple
            accept={ACCEPT_STRING}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Icon */}
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
            dragOver
              ? "bg-accent-2/10 text-accent-2"
              : "bg-surface-light text-text-muted group-hover:bg-surface group-hover:text-text-secondary"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="text-sm font-medium text-text-primary">
            {dragOver ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            or <span className="text-accent-2 underline underline-offset-2">browse files</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {ACCEPTED_TYPES.map((t) => (
              <span
                key={t.ext}
                className="rounded-md border border-border bg-surface-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted"
              >
                {t.label}
              </span>
            ))}
          </div>
        </label>
      </motion.div>

      {/* File queue */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">
                Upload Queue
                <span className="ml-2 text-sm font-normal text-text-muted">
                  ({queue.length} file{queue.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {hasCompleted && (
                  <button
                    onClick={clearCompleted}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
                  >
                    Clear completed
                  </button>
                )}
                {pendingCount > 0 && (
                  <button
                    onClick={simulateUpload}
                    className="rounded-lg bg-gradient-to-r from-accent-1 to-accent-2 px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                  >
                    Upload {pendingCount} file{pendingCount !== 1 ? "s" : ""}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {queue.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative overflow-hidden rounded-xl border border-border bg-surface/50 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      {/* File type badge */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${fileTypeGradient(fileTypeLabel(item.file))} text-white text-[10px] font-bold`}>
                        {fileTypeLabel(item.file)}
                      </div>

                      {/* File info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {item.file.name}
                          </p>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${statusColor(item.status)}`}>
                            {statusLabel(item.status)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>

                      {/* Remove button */}
                      {(item.status === "pending" || item.status === "done" || item.status === "error") && (
                        <button
                          onClick={() => removeFile(item.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    {(item.status === "uploading" || item.status === "processing") && (
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
                        <motion.div
                          className={`h-full rounded-full ${
                            item.status === "processing"
                              ? "bg-gradient-to-r from-accent-3 to-accent-1"
                              : "bg-gradient-to-r from-accent-1 to-accent-2"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}

                    {/* Done check overlay */}
                    {item.status === "done" && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/10">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-green-400">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing pipeline info */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          Processing Pipeline
        </h2>
        <div className="rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Text Extraction",
                description: "Parse document content, handle formatting and structure",
                gradient: "from-accent-1 to-accent-2",
              },
              {
                step: "2",
                title: "NLP Processing",
                description: "NER, coreference resolution, and event extraction",
                gradient: "from-accent-2 to-accent-3",
              },
              {
                step: "3",
                title: "Temporal Analysis",
                description: "Resolve timestamps and order events chronologically",
                gradient: "from-accent-3 to-[#ec4899]",
              },
              {
                step: "4",
                title: "Graph Construction",
                description: "Build causal links and embed into knowledge graph",
                gradient: "from-[#ec4899] to-[#f97316]",
              },
            ].map((stage) => (
              <div key={stage.step} className="relative">
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stage.gradient} text-xs font-bold text-white`}>
                  {stage.step}
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{stage.title}</h3>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent ingestions */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Recent Ingestions
          </h2>
          <span className="text-xs text-text-muted">{recentIngestions.length} documents</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Document
                </th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted sm:table-cell">
                  Type
                </th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted md:table-cell">
                  Size
                </th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted lg:table-cell">
                  Extracted
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentIngestions.map((doc, i) => (
                <tr
                  key={doc.id}
                  className={`transition-colors hover:bg-surface-light ${
                    i < recentIngestions.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${fileTypeGradient(doc.type)} text-white text-[8px] font-bold`}>
                        {doc.type}
                      </div>
                      <div>
                        <div className="truncate text-sm font-medium text-text-primary max-w-[200px] sm:max-w-xs">
                          {doc.name}
                        </div>
                        <div className="mt-0.5 text-[10px] text-text-muted">{doc.timestamp}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-text-secondary sm:table-cell">
                    {doc.type}
                  </td>
                  <td className="hidden px-5 py-3.5 text-text-muted md:table-cell">
                    {doc.size}
                  </td>
                  <td className="hidden px-5 py-3.5 lg:table-cell">
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>{doc.events} events</span>
                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                      <span>{doc.entities} entities</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-block rounded-md bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

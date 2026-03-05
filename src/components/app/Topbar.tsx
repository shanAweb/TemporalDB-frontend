"use client";

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export default function Topbar({ sidebarCollapsed }: TopbarProps) {
  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/70 backdrop-blur-xl px-6 transition-all duration-250"
      style={{ left: sidebarCollapsed ? 72 : 240 }}
    >
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search events, entities, documents..."
          className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-1/50 focus:bg-surface"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-light px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
          /
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <span className="text-xs font-medium text-text-secondary">API Connected</span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-surface hover:text-text-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 text-xs font-bold text-white">
          U
        </div>
      </div>
    </header>
  );
}

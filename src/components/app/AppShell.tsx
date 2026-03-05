"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Topbar sidebarCollapsed={collapsed} />
      <main
        className="pt-16 transition-all duration-250"
        style={{ marginLeft: collapsed ? 72 : 240 }}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

type NodeCategory = "organization" | "person" | "policy" | "sector" | "infrastructure" | "event";

interface GraphNode {
  id: string;
  label: string;
  category: NodeCategory;
  x: number;
  y: number;
  eventCount?: number;
  confidence?: number;
  description?: string;
  timestamp?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: "causal" | "temporal" | "similarity" | "membership";
  weight: number;
}

const initialNodes: GraphNode[] = [
  { id: "n-acme", label: "Acme Corp", category: "organization", x: 450, y: 200, eventCount: 24, confidence: 0.96 },
  { id: "n-globaltech", label: "GlobalTech", category: "organization", x: 700, y: 120, eventCount: 7, confidence: 0.85 },
  { id: "n-eurotech", label: "EuroTech Ind.", category: "organization", x: 250, y: 100, eventCount: 4, confidence: 0.88 },
  { id: "n-apac", label: "APAC Supply Chain", category: "infrastructure", x: 600, y: 350, eventCount: 18, confidence: 0.93 },
  { id: "n-production", label: "Production Ops", category: "infrastructure", x: 300, y: 350, eventCount: 9, confidence: 0.90 },
  { id: "n-logistics", label: "Logistics", category: "infrastructure", x: 150, y: 280, eventCount: 6, confidence: 0.92 },
  { id: "n-trade", label: "Trade Policy", category: "policy", x: 750, y: 300, eventCount: 11, confidence: 0.89 },
  { id: "n-mfg", label: "Manufacturing Sector", category: "sector", x: 450, y: 450, eventCount: 15, confidence: 0.91 },
  { id: "evt-disruption", label: "Supply Chain Disruption", category: "event", x: 550, y: 250, description: "Disruptions across Asia-Pacific", timestamp: "Oct 15, 2024", confidence: 0.95 },
  { id: "evt-revenue", label: "Q3 Revenue Decline", category: "event", x: 350, y: 500, description: "Revenue declined 15% YoY", timestamp: "Oct 1, 2024", confidence: 0.92 },
  { id: "evt-regulations", label: "New Trade Regulations", category: "event", x: 750, y: 430, description: "Semiconductor import regulations", timestamp: "Sep 20, 2024", confidence: 0.88 },
  { id: "evt-capacity", label: "Production Cut 20%", category: "event", x: 200, y: 450, description: "Capacity reduced at primary facilities", timestamp: "Sep 15, 2024", confidence: 0.91 },
  { id: "evt-partnership", label: "Strategic Partnership", category: "event", x: 600, y: 80, description: "Acme Corp & GlobalTech partnership", timestamp: "Sep 10, 2024", confidence: 0.87 },
];

const initialEdges: GraphEdge[] = [
  { id: "e-1", source: "n-trade", target: "evt-regulations", label: "enacted", type: "causal", weight: 0.92 },
  { id: "e-2", source: "evt-regulations", target: "evt-disruption", label: "caused", type: "causal", weight: 0.88 },
  { id: "e-3", source: "evt-disruption", target: "n-apac", label: "affected", type: "causal", weight: 0.95 },
  { id: "e-4", source: "evt-disruption", target: "evt-capacity", label: "led to", type: "causal", weight: 0.85 },
  { id: "e-5", source: "evt-capacity", target: "n-production", label: "impacted", type: "causal", weight: 0.91 },
  { id: "e-6", source: "evt-capacity", target: "evt-revenue", label: "caused", type: "causal", weight: 0.87 },
  { id: "e-7", source: "evt-revenue", target: "n-mfg", label: "sector impact", type: "causal", weight: 0.90 },
  { id: "e-8", source: "n-acme", target: "evt-partnership", label: "announced", type: "membership", weight: 0.87 },
  { id: "e-9", source: "n-globaltech", target: "evt-partnership", label: "partner", type: "membership", weight: 0.87 },
  { id: "e-10", source: "n-acme", target: "n-eurotech", label: "supplier contract", type: "membership", weight: 0.94 },
  { id: "e-11", source: "n-acme", target: "evt-revenue", label: "reported", type: "membership", weight: 0.92 },
  { id: "e-12", source: "n-logistics", target: "evt-disruption", label: "impacted by", type: "causal", weight: 0.89 },
  { id: "e-13", source: "n-logistics", target: "n-production", label: "feeds into", type: "temporal", weight: 0.80 },
  { id: "e-14", source: "evt-regulations", target: "n-mfg", label: "constrains", type: "causal", weight: 0.82 },
];

function categoryColor(cat: NodeCategory): string {
  switch (cat) {
    case "organization": return "#4f46e5";
    case "person": return "#06b6d4";
    case "policy": return "#f97316";
    case "sector": return "#8b5cf6";
    case "infrastructure": return "#ec4899";
    case "event": return "#22c55e";
  }
}

function categoryBg(cat: NodeCategory): string {
  switch (cat) {
    case "organization": return "bg-accent-1/10 text-accent-1 border-accent-1/20";
    case "person": return "bg-accent-2/10 text-accent-2 border-accent-2/20";
    case "policy": return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20";
    case "sector": return "bg-accent-3/10 text-accent-3 border-accent-3/20";
    case "infrastructure": return "bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20";
    case "event": return "bg-green-400/10 text-green-400 border-green-400/20";
  }
}

function edgeColor(type: GraphEdge["type"]): string {
  switch (type) {
    case "causal": return "#4f46e5";
    case "temporal": return "#06b6d4";
    case "similarity": return "#8b5cf6";
    case "membership": return "#64748b";
  }
}

function edgeDash(type: GraphEdge["type"]): string {
  switch (type) {
    case "causal": return "";
    case "temporal": return "8 4";
    case "similarity": return "4 4";
    case "membership": return "2 4";
  }
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [edgeFilter, setEdgeFilter] = useState<GraphEdge["type"] | "all">("all");
  const [showLabels, setShowLabels] = useState(true);

  const filteredEdges = useMemo(() => {
    if (edgeFilter === "all") return initialEdges;
    return initialEdges.filter((e) => e.type === edgeFilter);
  }, [edgeFilter]);

  // Nodes connected to selected
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedNode);
    filteredEdges.forEach((e) => {
      if (e.source === selectedNode) ids.add(e.target);
      if (e.target === selectedNode) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, filteredEdges]);

  const selectedNodeData = useMemo(() => {
    return nodes.find((n) => n.id === selectedNode) ?? null;
  }, [selectedNode, nodes]);

  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return filteredEdges.filter((e) => e.source === selectedNode || e.target === selectedNode);
  }, [selectedNode, filteredEdges]);

  // Drag node
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
  }, []);

  useEffect(() => {
    if (!draggingNode) return;

    const handleMove = (e: MouseEvent) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode
            ? { ...n, x: n.x + e.movementX / zoom, y: n.y + e.movementY / zoom }
            : n
        )
      );
    };

    const handleUp = () => setDraggingNode(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [draggingNode, zoom]);

  // Pan
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === "svg") {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      setSelectedNode(null);
    }
  }, [pan]);

  useEffect(() => {
    if (!isPanning) return;

    const handleMove = (e: MouseEvent) => {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
    };

    const handleUp = () => setIsPanning(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isPanning]);

  // Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2.5, Math.max(0.3, z - e.deltaY * 0.001)));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setSelectedNode(null);
  }, []);

  // Node radius based on category
  const nodeRadius = (n: GraphNode) => (n.category === "event" ? 20 : 26);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Knowledge Graph</h1>
        <p className="mt-1 text-sm text-text-muted">
          Visualize causal relationships between events and entities
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-wrap items-center gap-3">
          {/* Edge type filter */}
          <select
            value={edgeFilter}
            onChange={(e) => setEdgeFilter(e.target.value as GraphEdge["type"] | "all")}
            className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
          >
            <option value="all">All Relationships</option>
            <option value="causal">Causal</option>
            <option value="temporal">Temporal</option>
            <option value="similarity">Similarity</option>
            <option value="membership">Membership</option>
          </select>

          {/* Show labels toggle */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors ${
              showLabels
                ? "border-accent-1/30 bg-accent-1/10 text-accent-1"
                : "border-border text-text-muted hover:text-text-secondary"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Labels
          </button>

          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="px-2 text-xs font-medium text-text-muted tabular-nums">{(zoom * 100).toFixed(0)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
              className="flex h-9 w-9 items-center justify-center text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <button
            onClick={resetView}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </motion.div>

      {/* Graph + Detail panel */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex gap-4">
          {/* Graph canvas */}
          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-surface/30 backdrop-blur-sm"
            style={{ height: 560 }}
          >
            {/* Grid background */}
            <div className="absolute inset-0 grid-pattern opacity-50" />

            <svg
              ref={svgRef}
              className="h-full w-full"
              style={{ cursor: isPanning ? "grabbing" : draggingNode ? "grabbing" : "grab" }}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleWheel}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Edges */}
                {filteredEdges.map((edge) => {
                  const src = nodes.find((n) => n.id === edge.source);
                  const tgt = nodes.find((n) => n.id === edge.target);
                  if (!src || !tgt) return null;

                  const isHighlighted = !selectedNode || (connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target));
                  const opacity = selectedNode ? (isHighlighted ? 1 : 0.1) : 0.6;

                  // Curved path
                  const dx = tgt.x - src.x;
                  const dy = tgt.y - src.y;
                  const cx = (src.x + tgt.x) / 2 - dy * 0.1;
                  const cy = (src.y + tgt.y) / 2 + dx * 0.1;

                  return (
                    <g key={edge.id} opacity={opacity}>
                      <path
                        d={`M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`}
                        fill="none"
                        stroke={edgeColor(edge.type)}
                        strokeWidth={1.5 + edge.weight}
                        strokeDasharray={edgeDash(edge.type)}
                        strokeLinecap="round"
                      />
                      {/* Arrow */}
                      {edge.type === "causal" && (
                        <circle
                          cx={tgt.x - (tgt.x - cx) * 0.15}
                          cy={tgt.y - (tgt.y - cy) * 0.15}
                          r={3}
                          fill={edgeColor(edge.type)}
                        />
                      )}
                      {/* Edge label */}
                      {showLabels && (
                        <text
                          x={cx}
                          y={cy - 6}
                          textAnchor="middle"
                          className="text-[9px] fill-text-muted pointer-events-none select-none"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const isHovered = hoveredNode === node.id;
                  const opacity = selectedNode ? (isConnected ? 1 : 0.15) : 1;
                  const r = nodeRadius(node);
                  const color = categoryColor(node.category);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      opacity={opacity}
                      style={{ cursor: "pointer" }}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Glow ring on selected */}
                      {(isSelected || isHovered) && (
                        <circle r={r + 8} fill="none" stroke={color} strokeWidth={2} opacity={0.3} />
                      )}

                      {/* Outer ring */}
                      <circle r={r} fill="#0c1527" stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />

                      {/* Inner fill */}
                      <circle r={r - 4} fill={color} opacity={0.15} />

                      {/* Category initial */}
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[10px] font-bold pointer-events-none select-none"
                        fill={color}
                      >
                        {node.category === "event" ? "E" : node.label.charAt(0)}
                      </text>

                      {/* Label */}
                      {showLabels && (
                        <text
                          y={r + 14}
                          textAnchor="middle"
                          className="text-[10px] fill-text-secondary pointer-events-none select-none"
                        >
                          {node.label.length > 18 ? node.label.slice(0, 16) + "..." : node.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-xl border border-border bg-surface/80 p-3 backdrop-blur-sm">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Nodes</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {(["organization", "infrastructure", "policy", "sector", "event"] as NodeCategory[]).map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColor(cat) }} />
                    <span className="text-[10px] text-text-muted capitalize">{cat}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Edges</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {(["causal", "temporal", "similarity", "membership"] as const).map((type) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <svg width="20" height="6">
                      <line x1="0" y1="3" x2="20" y2="3" stroke={edgeColor(type)} strokeWidth="2" strokeDasharray={edgeDash(type)} />
                    </svg>
                    <span className="text-[10px] text-text-muted capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute top-4 right-4 rounded-lg border border-border bg-surface/80 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] text-text-muted">
                Drag nodes to reposition &middot; Scroll to zoom &middot; Click background to deselect
              </p>
            </div>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedNodeData && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="h-full rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm" style={{ width: 300 }}>
                  {/* Node header */}
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
                      style={{ backgroundColor: categoryColor(selectedNodeData.category) }}
                    >
                      {selectedNodeData.category === "event" ? "E" : selectedNodeData.label.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text-primary">{selectedNodeData.label}</h3>
                      <span className={`mt-1 inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${categoryBg(selectedNodeData.category)}`}>
                        {selectedNodeData.category}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Description */}
                  {selectedNodeData.description && (
                    <p className="mt-3 text-xs text-text-secondary leading-relaxed">{selectedNodeData.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 space-y-2">
                    {selectedNodeData.timestamp && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Date</span>
                        <span className="text-text-secondary">{selectedNodeData.timestamp}</span>
                      </div>
                    )}
                    {selectedNodeData.eventCount !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Events</span>
                        <span className="text-text-secondary">{selectedNodeData.eventCount}</span>
                      </div>
                    )}
                    {selectedNodeData.confidence !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Confidence</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          selectedNodeData.confidence >= 0.9
                            ? "bg-green-400/10 text-green-400"
                            : "bg-accent-2/10 text-accent-2"
                        }`}>
                          {(selectedNodeData.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Connections</span>
                      <span className="text-text-secondary">{selectedNodeEdges.length}</span>
                    </div>
                  </div>

                  {/* Connected edges */}
                  <div className="mt-5">
                    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                      Relationships ({selectedNodeEdges.length})
                    </h4>
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                      {selectedNodeEdges.map((edge) => {
                        const otherId = edge.source === selectedNode ? edge.target : edge.source;
                        const other = nodes.find((n) => n.id === otherId);
                        if (!other) return null;
                        const isOutgoing = edge.source === selectedNode;

                        return (
                          <button
                            key={edge.id}
                            onClick={() => setSelectedNode(otherId)}
                            className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-surface-light/30 p-2 text-left transition-colors hover:bg-surface-light"
                          >
                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-text-muted">
                              {isOutgoing ? (
                                <path d="M2 8h10M9 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              ) : (
                                <path d="M14 8H4M7 5L4 8l3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              )}
                            </svg>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-medium text-text-primary">{other.label}</div>
                              <div className="text-[9px] text-text-muted">{edge.label}</div>
                            </div>
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: edgeColor(edge.type) }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Graph stats */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Nodes", value: nodes.length, gradient: "from-accent-1 to-accent-2" },
            { label: "Edges", value: filteredEdges.length, gradient: "from-accent-2 to-accent-3" },
            { label: "Causal Chains", value: filteredEdges.filter((e) => e.type === "causal").length, gradient: "from-accent-3 to-[#ec4899]" },
            { label: "Avg Weight", value: (filteredEdges.reduce((s, e) => s + e.weight, 0) / (filteredEdges.length || 1)).toFixed(2), gradient: "from-[#ec4899] to-[#f97316]" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/50 p-4 backdrop-blur-sm">
              <div className={`text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

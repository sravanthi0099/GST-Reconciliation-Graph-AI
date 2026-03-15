import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, RotateCcw } from 'lucide-react';

const riskColor = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

const getRiskLevel = (node) => {
  const raw = node?.riskLevel || node?.risk_level || node?.level || 'LOW';
  return String(raw).toUpperCase();
};

export default function NetworkGraph({ graph }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  const width = 900;
  const height = 520;

  const laidOut = useMemo(() => {
    const nodes = graph?.nodes || [];
    const edges = graph?.edges || [];
    if (!nodes.length) return { nodes: [], edges: [] };

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.33;

    const positionedNodes = nodes.map((node, index) => {
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      const x = node.x ?? centerX + radius * Math.cos(angle);
      const y = node.y ?? centerY + radius * Math.sin(angle);
      return { ...node, x, y, riskLevel: getRiskLevel(node) };
    });

    return { nodes: positionedNodes, edges };
  }, [graph]);

  const zoom = (delta) => setScale((prev) => Math.min(2.2, Math.max(0.6, Number((prev + delta).toFixed(2)))));

  const onWheel = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 0.1 : -0.1);
  };

  const onMouseDown = (e) => {
    setDragging(true);
    setLastPoint({ x: e.clientX, y: e.clientY });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPoint.x;
    const dy = e.clientY - lastPoint.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPoint({ x: e.clientX, y: e.clientY });
  };

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vendor Transaction Network</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Zoom, pan, and hover nodes to inspect exposure pathways</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => zoom(-0.1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={() => zoom(0.1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={reset} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white">
            <span className="inline-flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Reset</span>
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.1),_transparent_32%),linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,1))] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_32%),linear-gradient(180deg,rgba(15,23,42,1),rgba(2,6,23,1))]"
        onWheel={onWheel}
        onMouseMove={onMouseMove}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
      >
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="h-[520px] w-full cursor-grab active:cursor-grabbing" onMouseDown={onMouseDown}>
          <g transform={`translate(${offset.x} ${offset.y}) scale(${scale})`}>
            {laidOut.edges.map((edge, index) => {
              const source = laidOut.nodes.find((node) => node.id === (edge.source || edge.from));
              const target = laidOut.nodes.find((node) => node.id === (edge.target || edge.to));
              if (!source || !target) return null;
              return (
                <line
                  key={`${source.id}-${target.id}-${index}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="rgba(148,163,184,0.45)"
                  strokeWidth="2"
                />
              );
            })}

            {laidOut.nodes.map((node) => (
              <motion.g
                key={node.id}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setHovered(node)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle cx={node.x} cy={node.y} r="28" fill={riskColor[node.riskLevel] || riskColor.LOW} opacity="0.95" />
                <circle cx={node.x} cy={node.y} r="34" fill="transparent" stroke={riskColor[node.riskLevel] || riskColor.LOW} strokeOpacity="0.25" strokeWidth="10" />
                <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-white text-[10px] font-semibold">
                  {node.label?.slice(0, 8) || node.id?.slice(0, 8)}
                </text>
              </motion.g>
            ))}
          </g>
        </svg>

        {hovered ? (
          <div className="absolute right-4 top-4 w-64 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
            <h4 className="font-semibold text-slate-900 dark:text-white">{hovered.label || hovered.id}</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">GSTIN: {hovered.gstin || hovered.id}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Risk Level: <span className="font-medium">{hovered.riskLevel}</span></p>
            {hovered.riskScore !== undefined ? <p className="text-sm text-slate-600 dark:text-slate-300">Risk Score: <span className="font-medium">{hovered.riskScore}%</span></p> : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
        {Object.entries(riskColor).map(([label, color]) => (
          <div key={label} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

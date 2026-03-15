import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NetworkGraph from '../components/NetworkGraph';
import { getNetworkExposure } from '../services/api';

const makeNode = (item, index) => ({
  id: item.id || item.gstin || item.vendor_gstin || `node-${index}`,
  label: item.label || item.name || item.gstin || item.vendor_gstin || `Vendor ${index + 1}`,
  gstin: item.gstin || item.vendor_gstin || item.id || `GSTIN-${index + 1}`,
  riskLevel: String(item.risk_level ?? item.riskLevel ?? item.level ?? 'LOW').toUpperCase(),
  riskScore: Number(item.risk_score ?? item.riskScore ?? item.score ?? 0),
  x: item.x,
  y: item.y,
});

const normalizeGraph = (payload, gstin) => {
  const raw = payload?.data || payload?.graph || payload || {};
  const nodes = Array.isArray(raw.nodes)
    ? raw.nodes.map(makeNode)
    : Array.isArray(raw.vendors)
      ? raw.vendors.map(makeNode)
      : [makeNode({ gstin, risk_level: 'MEDIUM', risk_score: 58 }, 0)];

  const edges = Array.isArray(raw.edges)
    ? raw.edges
    : Array.isArray(raw.relationships)
      ? raw.relationships.map((edge, index) => ({ id: edge.id || index, source: edge.source || edge.from, target: edge.target || edge.to }))
      : nodes.slice(1).map((node, index) => ({ id: index, source: nodes[0].id, target: node.id }));

  return { nodes, edges };
};

export default function Network() {
  const [searchParams] = useSearchParams();
  const gstin = searchParams.get('gstin') || '27AAEPM0111C1Z8';
  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    getNetworkExposure(gstin)
      .then((data) => setGraph(normalizeGraph(data, gstin)))
      .catch(() =>
        setGraph({
          nodes: [
            { id: gstin, label: gstin, gstin, riskLevel: 'HIGH', riskScore: 78 },
            { id: 'v-2', label: 'Supplier A', gstin: '29BBNPK2201J1Z2', riskLevel: 'MEDIUM', riskScore: 54 },
            { id: 'v-3', label: 'Supplier B', gstin: '24AXQPL8871D1ZN', riskLevel: 'LOW', riskScore: 18 },
            { id: 'v-4', label: 'Supplier C', gstin: '06AZTPM5544A1Z9', riskLevel: 'HIGH', riskScore: 82 },
          ],
          edges: [
            { source: gstin, target: 'v-2' },
            { source: gstin, target: 'v-3' },
            { source: gstin, target: 'v-4' },
            { source: 'v-2', target: 'v-4' },
          ],
        }),
      );
  }, [gstin]);

  const stat = useMemo(() => ({
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    highRisk: graph.nodes.filter((node) => node.riskLevel === 'HIGH').length,
  }), [graph]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Network Graph</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Exposure map for GSTIN {gstin}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Interactive graph of transaction relationships and risk propagation across connected vendors.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickStat label="Nodes" value={stat.nodes} />
          <QuickStat label="Edges" value={stat.edges} />
          <QuickStat label="High Risk Links" value={stat.highRisk} />
        </div>
      </div>

      <NetworkGraph graph={graph} />
    </div>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

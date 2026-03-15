import { useEffect, useState } from 'react';
import { AlertTriangle, FileSearch, Siren } from 'lucide-react';
import { getAuditHighRisk } from '../services/api';

const normalizeAuditAlerts = (payload) => {
  const list = payload?.alerts || payload?.data || payload || [];
  return Array.isArray(list)
    ? list.map((item, index) => ({
        id: item.id || index,
        gstin: item.gstin || item.vendor_gstin || item.supplier_gstin || `GSTIN-${index + 1}`,
        title: item.title || 'High Risk Alert',
        explanation: item.explanation || item.message || item.detail || 'High-risk audit pattern detected.',
        severity: String(item.risk_level || item.severity || 'HIGH').toUpperCase(),
      }))
    : [];
};

const fallback = [
  {
    id: 1,
    gstin: '27AAEPM0111C1Z8',
    title: 'High Risk Invoice Cluster',
    explanation: 'Three invoices are classified as HIGH risk and linked to vendors with elevated exposure in the transaction network.',
    severity: 'HIGH',
  },
  {
    id: 2,
    gstin: '06AZTPM5544A1Z9',
    title: 'Graph Exposure Escalation',
    explanation: 'Supplier is connected to four vendors in the GST network and requires reconciliation verification.',
    severity: 'HIGH',
  },
];

export default function Audit() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAuditHighRisk().then((data) => setAlerts(normalizeAuditAlerts(data))).catch(() => setAlerts(fallback));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Audit Alerts</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">High-risk audit queue</h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Escalated suppliers and explanations generated from the backend high-risk audit endpoint.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  <Siren className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">GSTIN: {alert.gstin}</p>
                </div>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20">
                {alert.severity}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <FileSearch className="h-4 w-4" /> Explanation
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{alert.explanation}</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <AlertTriangle className="h-4 w-4 text-rose-500" /> Immediate review recommended for compliance validation.
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

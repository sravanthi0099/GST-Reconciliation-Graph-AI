import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck, Siren, FileText } from "lucide-react";
import KPIcard from "../components/KPIcard";
import RiskChart from "../components/RiskChart";
import { getSummary, getVendorRiskScores } from "../services/api";

export default function Overview() {
  const [summary, setSummary] = useState(null);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, vendorData] = await Promise.all([
          getSummary().catch(() => null),
          getVendorRiskScores().catch(() => []),
        ]);
        setSummary(summaryData);
        setVendors(Array.isArray(vendorData) ? vendorData : []);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const totals = useMemo(() => {
    const totalInvoices = vendors.reduce((sum, v) => sum + (v.total_invoices || 0), 0);
    const highInvoices = vendors.reduce((sum, v) => sum + (v.high_count || 0), 0);
    const mediumInvoices = vendors.reduce((sum, v) => sum + (v.medium_count || 0), 0);
    const lowInvoices = Math.max(totalInvoices - highInvoices - mediumInvoices, 0);

    return {
      totalInvoices,
      highPct: totalInvoices ? ((highInvoices / totalInvoices) * 100).toFixed(1) : "0.0",
      mediumPct: totalInvoices ? ((mediumInvoices / totalInvoices) * 100).toFixed(1) : "0.0",
      lowPct: totalInvoices ? ((lowInvoices / totalInvoices) * 100).toFixed(1) : "0.0",
      pie: [
        { name: "High", value: highInvoices },
        { name: "Medium", value: mediumInvoices },
        { name: "Low", value: lowInvoices },
      ],
      alertCount: vendors.filter((v) => v.risk_level === "HIGH" || v.high_count > 0).length,
    };
  }, [vendors]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <BrainCircuit className="text-emerald-600 dark:text-emerald-300" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI Risk Engine</p>
              <p className="font-semibold text-emerald-600">ACTIVE</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <ShieldCheck className="text-indigo-600 dark:text-indigo-300" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Graph Intelligence</p>
              <p className="font-semibold text-indigo-600">CONNECTED</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-100 p-3 dark:bg-red-900/30">
              <Siren className="text-red-600 dark:text-red-300" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Audit Alerts</p>
              <p className="font-semibold text-red-600">{totals.alertCount} flagged vendors</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KPIcard title="Total Invoices" value={totals.totalInvoices} icon={FileText} />
        <KPIcard title="High Risk %" value={`${totals.highPct}%`} tone="high" />
        <KPIcard title="Medium Risk %" value={`${totals.mediumPct}%`} tone="medium" />
        <KPIcard title="Low Risk %" value={`${totals.lowPct}%`} tone="low" />
      </div>

      <RiskChart data={totals.pie} />
    </div>
  );
}

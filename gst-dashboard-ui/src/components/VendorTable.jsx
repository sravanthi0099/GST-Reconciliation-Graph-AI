import React from "react";
import { SearchCheck } from "lucide-react";
import { motion } from "framer-motion";

const badgeMap = {
  HIGH: "bg-red-100 text-red-700 border border-red-200",
  MEDIUM: "bg-orange-100 text-orange-700 border border-orange-200",
  LOW: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

export default function VendorTable({ vendors = [], onInvestigate }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800 overflow-hidden">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Vendor Risk Intelligence
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Auditor view of vendor risk scoring from GST reconciliation.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
              <th className="py-4 px-3 font-medium">GSTIN</th>
              <th className="py-4 px-3 font-medium">Risk Score</th>
              <th className="py-4 px-3 font-medium">Risk Level</th>
              <th className="py-4 px-3 font-medium">Total Invoices</th>
              <th className="py-4 px-3 font-medium">High</th>
              <th className="py-4 px-3 font-medium">Medium</th>
              <th className="py-4 px-3 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((vendor, index) => (
              <motion.tr
                key={vendor.vendor_gstin}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
              >
                <td className="py-4 px-3 font-medium text-slate-900 dark:text-white">
                  {vendor.vendor_gstin}
                </td>
                <td className="py-4 px-3 text-slate-700 dark:text-slate-200">
                  {Number(vendor.risk_score).toFixed(2)}%
                </td>
                <td className="py-4 px-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      badgeMap[vendor.risk_level] || badgeMap.LOW
                    }`}
                  >
                    {vendor.risk_level}
                  </span>
                </td>
                <td className="py-4 px-3 text-slate-700 dark:text-slate-200">
                  {vendor.total_invoices}
                </td>
                <td className="py-4 px-3 text-slate-700 dark:text-slate-200">
                  {vendor.high_count}
                </td>
                <td className="py-4 px-3 text-slate-700 dark:text-slate-200">
                  {vendor.medium_count}
                </td>
                <td className="py-4 px-3 text-right">
                  <button
                    onClick={() => onInvestigate(vendor)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition"
                  >
                    <SearchCheck size={16} />
                    Investigate
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

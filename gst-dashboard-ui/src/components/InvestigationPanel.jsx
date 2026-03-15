import React from "react";
import {
  ShieldAlert,
  Lightbulb,
  Network,
  BadgeAlert,
  CircleCheckBig,
} from "lucide-react";

const badgeMap = {
  HIGH: "bg-red-100 text-red-700 border border-red-200",
  MEDIUM: "bg-orange-100 text-orange-700 border border-orange-200",
  LOW: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

function InfoCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800">
          <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300 leading-6">
        {children}
      </div>
    </div>
  );
}

export default function InvestigationPanel({ vendor }) {
  if (!vendor) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500 shadow-sm dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-400">
        Select a vendor from Risk Analytics to view investigation details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/20 bg-white/75 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Supplier Investigation
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {vendor.vendor_gstin}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Risk Score</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {Number(vendor.risk_score).toFixed(2)}%
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                badgeMap[vendor.risk_level] || badgeMap.LOW
              }`}
            >
              {vendor.risk_level}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InfoCard title="AI Explanation" icon={Lightbulb}>
          {vendor.explanation || "No explanation returned by backend."}
        </InfoCard>

        <InfoCard title="Network Insight" icon={Network}>
          {vendor.graph_insight || "No graph insight available."}
        </InfoCard>

        <InfoCard title="Reasons" icon={BadgeAlert}>
          {vendor.reasons && vendor.reasons.length > 0 ? (
            <ul className="space-y-2">
              {vendor.reasons.map((reason, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No explicit reasons returned by backend.</p>
          )}
        </InfoCard>

        <InfoCard title="Recommendation" icon={CircleCheckBig}>
          {vendor.recommendation || "No recommendation available."}
        </InfoCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-red-50 p-5 shadow-sm dark:bg-red-950/30">
          <p className="text-sm text-red-600 dark:text-red-300">High Risk Invoices</p>
          <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-200">
            {vendor.high_count}
          </p>
        </div>

        <div className="rounded-3xl bg-orange-50 p-5 shadow-sm dark:bg-orange-950/30">
          <p className="text-sm text-orange-600 dark:text-orange-300">Medium Risk Invoices</p>
          <p className="mt-2 text-2xl font-bold text-orange-700 dark:text-orange-200">
            {vendor.medium_count}
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm dark:bg-emerald-950/30">
          <p className="text-sm text-emerald-600 dark:text-emerald-300">Total Invoices</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-200">
            {vendor.total_invoices}
          </p>
        </div>
      </div>
    </div>
  );
}

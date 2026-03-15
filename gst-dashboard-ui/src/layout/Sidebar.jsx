import { NavLink } from 'react-router-dom';
import { Activity, AlertTriangle, ChartNoAxesCombined, LayoutDashboard, Network, SearchCheck } from 'lucide-react';

const items = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/risk-analytics', label: 'Risk Analytics', icon: ChartNoAxesCombined },
  { to: '/investigation', label: 'Investigation', icon: SearchCheck },
  { to: '/network', label: 'Network Graph', icon: Network },
  { to: '/audit', label: 'Audit Alerts', icon: AlertTriangle },
];

export default function Sidebar({ mobile = false }) {
  return (
    <aside className={`inset-y-0 left-0 z-30 w-72 border-r border-white/10 bg-[linear-gradient(180deg,#081226_0%,#0b1730_55%,#0a1022_100%)] px-6 py-8 text-white ${mobile ? "fixed block" : "fixed hidden lg:block"}`}>
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
          <Activity className="h-6 w-6 text-cyan-300" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Enterprise Suite</p>
          <h1 className="text-2xl font-semibold tracking-tight">GST Intelligence</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/12 text-white shadow-[0_10px_25px_rgba(15,23,42,0.22)]'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">System Status</p>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span>AI Risk Engine</span>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Graph Intelligence</span>
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sky-300">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

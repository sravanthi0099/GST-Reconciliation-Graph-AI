import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Overview from './pages/Overview';
import RiskAnalytics from './pages/RiskAnalytics';
import Investigation from './pages/Investigation';
import Network from './pages/Network';
import Audit from './pages/Audit';

function AppShell() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('gst-theme') === 'dark');
  const [searchValue, setSearchValue] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('gst-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    const map = {
      '/': 'Overview',
      '/risk-analytics': 'Risk Analytics',
      '/investigation': 'Investigation',
      '/network': 'Network Graph',
      '/audit': 'Audit Alerts',
    };
    return map[location.pathname] || 'GST Intelligence';
  }, [location.pathname]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const value = searchValue.trim();
    if (!value) return;
    navigate(`/network?gstin=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_42%,#f8fafc_100%)] text-slate-900 transition-colors dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)] dark:text-white">
      <Sidebar />

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <div className="h-full w-72" onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile />
          </div>
        </div>
      ) : null}

      <main className="min-h-screen px-4 py-4 lg:ml-72 lg:px-8 lg:py-6">
        <Topbar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchSubmit={onSearchSubmit}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <div className="mb-6 flex items-center justify-between px-1">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise dashboard</p>
            <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/risk-analytics" element={<RiskAnalytics />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/network" element={<Network />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

import { Menu, MoonStar, Search, SunMedium } from 'lucide-react';

export default function Topbar({ searchValue, onSearchChange, onSearchSubmit, darkMode, onToggleTheme, onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-20 mb-6 rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="inline-flex rounded-2xl border border-slate-200 p-3 text-slate-600 dark:border-slate-700 dark:text-slate-300 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">GST Risk Intelligence</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Audit Command Center</h2>
          </div>
        </div>

        <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-3 sm:flex-row xl:max-w-2xl">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search GSTIN for network exposure"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:translate-y-[-1px]"
          >
            Enter
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 text-sm font-medium text-white shadow-lg transition hover:translate-y-[-1px] dark:from-slate-100 dark:to-white dark:text-slate-900"
          >
            {darkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            Theme
          </button>
        </form>
      </div>
    </header>
  );
}

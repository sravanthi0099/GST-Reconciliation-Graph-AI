import { motion } from 'framer-motion';

export default function KPIcard({ title, value, subtitle, icon: Icon, accent = 'from-indigo-500/20 to-cyan-500/20' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.28 }}
      className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/55 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-80`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          {subtitle ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-white/30 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-slate-800/60">
            <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

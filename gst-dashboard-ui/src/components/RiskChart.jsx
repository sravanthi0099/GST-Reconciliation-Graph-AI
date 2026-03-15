import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

export default function RiskChart({ data = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Distribution</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live overview of invoice risk segmentation</p>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={75}
              outerRadius={115}
              paddingAngle={3}
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: '1px solid rgba(148,163,184,0.2)',
                boxShadow: '0 10px 25px rgba(15,23,42,0.08)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {data.map((item, index) => (
          <div key={item.name} className="rounded-2xl border border-slate-200/70 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
              {item.name}
            </div>
            <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{item.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

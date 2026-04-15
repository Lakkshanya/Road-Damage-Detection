import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

const API = 'http://localhost:5005';
const COLORS = ['#1E3A8A', '#06B6D4', '#F97316', '#94A3B8'];

export function AnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0, breakdown: [], trend: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch(`${API}/api/reports/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgRepairDays = stats.resolved > 0 ? '~3 days' : 'N/A';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-500 font-medium mt-1">Detailed breakdown of road conditions and repair metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reports', value: loading ? '—' : stats.total, trend: '', pos: true, icon: Activity },
          { label: 'Resolved', value: loading ? '—' : stats.resolved, trend: '', pos: true, icon: TrendingUp },
          { label: 'Avg Repair Time', value: loading ? '—' : avgRepairDays, trend: '', pos: true, icon: Clock },
          { label: 'High Priority', value: loading ? '—' : stats.high, trend: '', pos: false, icon: TrendingDown },
        ].map((stat, i) => (
          <Card key={i} className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="absolute right-0 top-0 p-4 opacity-5 text-slate-900 group-hover:scale-110 transition-transform duration-500">
               <stat.icon size={64} />
             </div>
             <p className="text-sm font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
             <div className="flex items-end gap-3 mt-3">
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Report Trends (Last 7 Months)</h3>
            <div className="h-80 w-full">
               {loading ? (
                 <div className="flex items-center justify-center h-full text-slate-400 font-medium">Loading chart...</div>
               ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 500}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 500}} allowDecimals={false} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#06B6D4', strokeWidth: 2, strokeDasharray: '5 5' }} />
                     <Area type="monotone" dataKey="reports" stroke="#1E3A8A" strokeWidth={4} fillOpacity={1} fill="url(#colorReports)" />
                  </AreaChart>
               </ResponsiveContainer>
               )}
            </div>
         </Card>

         <Card className="p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Damage Distribution</h3>
            <div className="flex-1 w-full flex flex-col items-center justify-center">
               {loading ? (
                 <div className="text-slate-400 font-medium text-sm">Loading chart...</div>
               ) : stats.breakdown.length === 0 ? (
                 <div className="text-center py-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl w-full">
                   No data yet — upload an image first!
                 </div>
               ) : (
               <>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={stats.breakdown} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                         {stats.breakdown.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="w-full mt-4 space-y-2">
                 {stats.breakdown.map((item, index) => (
                   <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                       <span className="text-sm font-medium text-slate-600">{item.name}</span>
                     </div>
                     <span className="text-sm font-bold text-slate-800">{item.value}</span>
                   </div>
                 ))}
               </div>
               </>
               )}
            </div>
         </Card>
      </div>
    </div>
  );
}

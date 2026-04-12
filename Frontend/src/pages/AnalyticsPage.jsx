import { Card } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

export function AnalyticsPage() {
  const lineData = [
    { name: 'Jan', reports: 0 },
    { name: 'Feb', reports: 0 },
    { name: 'Mar', reports: 0 },
    { name: 'Apr', reports: 0 },
    { name: 'May', reports: 0 },
    { name: 'Jun', reports: 0 },
    { name: 'Jul', reports: 0 },
  ];

  const pieData = [];
  
  const COLORS = ['#1E3A8A', '#06B6D4', '#F97316', '#94A3B8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-500 font-medium mt-1">Detailed breakdown of road conditions and repair metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Cards */}
        {[
          { label: 'Total Reports', value: '0', trend: '0%', pos: true, icon: Activity },
          { label: 'Repaired', value: '0', trend: '0%', pos: true, icon: TrendingUp },
          { label: 'Avg Repair Time', value: '0 days', trend: '0.0', pos: true, icon: Clock },
          { label: 'High Priority', value: '0', trend: '0%', pos: false, icon: TrendingDown },
        ].map((stat, i) => (
          <Card key={i} className="p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="absolute right-0 top-0 p-4 opacity-5 text-slate-900 group-hover:scale-110 transition-transform duration-500">
               <stat.icon size={64} />
             </div>
             <p className="text-sm font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
             <div className="flex items-end gap-3 mt-3">
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                <span className={`flex items-center text-sm font-bold pb-1 bg-slate-50 px-2 py-0.5 rounded-full ${stat.pos ? 'text-green-600' : 'text-red-500'}`}>
                   {stat.trend}
                </span>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Report Trends (Last 7 Months)</h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 500}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 500}} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        cursor={{ stroke: '#06B6D4', strokeWidth: 2, strokeDasharray: '5 5' }}
                     />
                     <Area type="monotone" dataKey="reports" stroke="#1E3A8A" strokeWidth={4} fillOpacity={1} fill="url(#colorReports)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Damage Distribution</h3>
            <div className="flex-1 w-full flex flex-col items-center justify-center">
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={65}
                         outerRadius={85}
                         paddingAngle={5}
                         dataKey="value"
                         stroke="none"
                       >
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="w-full mt-4 space-y-2">
                 {pieData.map((item, index) => (
                   <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                       <span className="text-sm font-medium text-slate-600">{item.name}</span>
                     </div>
                     <span className="text-sm font-bold text-slate-800">{item.value}</span>
                   </div>
                 ))}
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}

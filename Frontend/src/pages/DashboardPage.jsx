import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FileWarning, AlertTriangle, CheckCircle, MapPin, Clock } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { title: 'Total Reports', value: '0', icon: FileWarning, color: 'text-primary' },
    { title: 'High Severity', value: '0', icon: AlertTriangle, color: 'text-accent' },
    { title: 'Resolved', value: '0', icon: CheckCircle, color: 'text-secondary' },
  ];

  const recentActivity = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time road condition metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 flex items-start justify-between group hover:border-primary/20 transition-colors cursor-pointer">
            <div>
              <p className="text-slate-500 font-semibold mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors ${stat.color}`}>
              <stat.icon size={28} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <button className="text-sm font-semibold text-primary hover:text-secondary transition-colors">View All</button>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${activity.severity === 'High' ? 'bg-red-50 text-red-600' : activity.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileWarning size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{activity.type}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                      <span className="flex items-center gap-1"><MapPin size={14} />{activity.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{activity.time}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={activity.severity === 'High' ? 'danger' : activity.severity === 'Medium' ? 'warning' : 'info'}>
                  {activity.severity}
                </Badge>
              </div>
            )) : (
               <div className="flex items-center justify-center h-full min-h-[150px] p-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl">
                  No recent activity found
               </div>
            )}
          </div>
        </Card>

        {/* Mini map placeholder */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Live Map</h2>
            <button className="text-sm font-semibold text-primary hover:text-secondary transition-colors">Expand</button>
          </div>
          <div className="flex-1 w-full min-h-[250px] bg-slate-100 rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiNmM2Y0ZjYiLz4KPHBhdGggZD0iTTAgMTBoNDB2MjBIMHoiIGZpbGw9IiBlNTVjNjgiIG9wYWNpdHk9IjAuMSIvPgoJCTxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjQiIGZpbGw9IiMxRTM4OEEiIG9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4=')] opacity-50 bg-repeat"></div>
             
             {/* Map UI overlays */}
             <div className="absolute inset-0 bg-slate-200/50 flex flex-col items-center justify-center">
                 <div className="p-3 bg-white rounded-full shadow-lg text-primary mb-2 group-hover:scale-110 transition-transform">
                     <MapPin size={28} />
                 </div>
                 <p className="text-sm font-semibold text-slate-700 bg-white/90 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">3 Active Zones</p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

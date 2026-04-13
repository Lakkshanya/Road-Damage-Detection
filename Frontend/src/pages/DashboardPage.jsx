import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FileWarning, AlertTriangle, CheckCircle, MapPin, Clock } from 'lucide-react';

const API = 'http://localhost:5005';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('auth_user_name') || 'User';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/reports/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/api/reports`, { headers }).then(r => r.json()),
    ]).then(([statsData, reportsData]) => {
      setStats({ total: statsData.total || 0, high: statsData.high || 0, resolved: statsData.resolved || 0 });
      setReports(Array.isArray(reportsData) ? reportsData.slice(0, 5) : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: 'Total Reports', value: stats.total, icon: FileWarning, color: 'text-primary' },
    { title: 'High Severity', value: stats.high, icon: AlertTriangle, color: 'text-accent' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {username}!
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time road condition metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 flex items-start justify-between group hover:border-primary/20 transition-colors cursor-pointer">
            <div>
              <p className="text-slate-500 font-semibold mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                {loading ? '—' : stat.value}
              </p>
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
            <button onClick={() => navigate('/upload')} className="text-sm font-semibold text-primary hover:text-secondary transition-colors">+ New Report</button>
          </div>
          
          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[150px] text-slate-400 text-sm font-medium">Loading...</div>
            ) : reports.length > 0 ? reports.map((report) => (
              <div key={report._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${report.severity === 'High' ? 'bg-red-50 text-red-600' : report.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileWarning size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{report.damage_type}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                      <span className="flex items-center gap-1"><MapPin size={14} />{report.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={report.severity === 'High' ? 'danger' : report.severity === 'Medium' ? 'warning' : 'info'}>
                  {report.severity}
                </Badge>
              </div>
            )) : (
               <div className="flex items-center justify-center h-full min-h-[150px] p-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl">
                  No activity yet — upload your first image to get started!
               </div>
            )}
          </div>
        </Card>

        {/* Mini map placeholder */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Live Map</h2>
            <button onClick={() => navigate('/map')} className="text-sm font-semibold text-primary hover:text-secondary transition-colors">Expand</button>
          </div>
          <div className="flex-1 w-full min-h-[250px] bg-slate-100 rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200" onClick={() => navigate('/map')}>
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiNmM2Y0ZjYiLz4KPHBhdGggZD0iTTAgMTBoNDB2MjBIMHoiIGZpbGw9IiBlNTVjNjgiIG9wYWNpdHk9IjAuMSIvPgoJCTxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjQiIGZpbGw9IiMxRTM4OEEiIG9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4=')] opacity-50 bg-repeat"></div>
             <div className="absolute inset-0 bg-slate-200/50 flex flex-col items-center justify-center">
                 <div className="p-3 bg-white rounded-full shadow-lg text-primary mb-2 group-hover:scale-110 transition-transform">
                     <MapPin size={28} />
                 </div>
                 <p className="text-sm font-semibold text-slate-700 bg-white/90 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
                   {loading ? '...' : `${stats.total} Report${stats.total !== 1 ? 's' : ''} logged`}
                 </p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

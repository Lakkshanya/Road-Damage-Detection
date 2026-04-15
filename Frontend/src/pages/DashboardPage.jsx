import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FileWarning, AlertTriangle, CheckCircle, MapPin, Clock, Upload, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

const SEVERITY_COLORS = { High: '#EF4444', Medium: '#F59E0B', Low: '#3B82F6', None: '#10B981' };

// Helper component to update map view when center changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const API = 'http://localhost:5005';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('auth_user_name') || 'User';
  const userRole = localStorage.getItem('auth_user_role') || 'public';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/reports/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/api/reports`, { headers }).then(r => r.json()),
    ]).then(([statsData, reportsData]) => {
      setStats({ total: statsData.total || 0, high: statsData.high || 0, resolved: statsData.resolved || 0 });
      setReports(Array.isArray(reportsData) ? reportsData : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: 'Total Reports', value: stats.total, icon: FileWarning, color: 'text-primary' },
    { title: 'High Severity', value: stats.high, icon: AlertTriangle, color: 'text-accent' },
    { title: 'Resolved Cases', value: stats.resolved, icon: CheckCircle, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Welcome, {username}!
          </h1>
          <p className="text-slate-500 font-bold mt-1">Real-time road condition intelligence system</p>
        </div>
        {userRole !== 'corporation' && (
          <button 
            onClick={() => navigate('/upload')} 
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Upload size={20} /> New AI Analysis
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 flex items-start justify-between group hover:border-primary/20 transition-all cursor-pointer">
            <div>
              <p className="text-slate-500 font-bold uppercase text-xs mb-1 mb-2">{stat.title}</p>
              <p className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                {loading ? '...' : stat.value}
              </p>
            </div>
            <div className={`p-4 rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors ${stat.color}`}>
              <stat.icon size={28} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity: Back to original design */}
        <Card className="lg:col-span-2 p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
               <Clock className="text-primary" /> Recent AI Activity
            </h2>
            <button onClick={() => navigate('/analytics')} className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
               View Analytics <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold">Fetching latest data...</div>
            ) : reports.length > 0 ? reports.slice(0, 7).map((report) => (
              <div key={report._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 group transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${report.severity === 'High' ? 'bg-red-50 text-red-600' : report.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileWarning size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{report.damage_type}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-bold">
                      <span className="flex items-center gap-1"><MapPin size={14} />{report.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Confidence hidden for frontend */}
                   <Badge variant={report.severity === 'High' ? 'danger' : (report.severity === 'Medium' || report.severity === 'Caution') ? 'warning' : 'info'}>
                     {report.severity === 'None' ? 'Safe' : report.severity}
                   </Badge>
                </div>
              </div>
            )) : (
               <div className="flex flex-col items-center justify-center h-full p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <FileWarning size={48} className="text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400">The road network is currently clear.</p>
               </div>
            )}
          </div>
        </Card>

        {/* Mini Map Snapshot */}
        <Card className="p-2 flex flex-col h-full bg-slate-50 border-slate-200 shadow-inner">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Geospatial Overview</h2>
            <button onClick={() => navigate('/map')} className="text-xs font-black text-primary uppercase">Fullscreen</button>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden m-2 border-2 border-white shadow-xl">
            <MapContainer
              center={reports.find(r => r.latitude) ? [reports.find(r => r.latitude).latitude, reports.find(r => r.latitude).longitude] : [13.0827, 80.2707]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
              zoomControl={false}
            >
              <RecenterMap center={reports.find(r => r.latitude) ? [reports.find(r => r.latitude).latitude, reports.find(r => r.latitude).longitude] : [13.0827, 80.2707]} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {reports.filter(r => r.latitude).map((r) => (
                <CircleMarker
                  key={r._id}
                  center={[r.latitude, r.longitude]}
                  radius={r.severity === 'High' ? 8 : 6}
                  pathOptions={{ color: SEVERITY_COLORS[r.severity] || '#94A3B8', fillOpacity: 0.8, weight: 3 }}
                />
              ))}
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, Camera, MapPin, Clock } from 'lucide-react';

const API = 'http://localhost:5005';

export function ProfilePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('auth_user_name') || '';
  const email = localStorage.getItem('auth_user_email') || '';
  const [name, setName] = useState(username);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch(`${API}/api/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('auth_user_name', name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const highCount = reports.filter(r => r.severity === 'High').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Profile Card */}
         <Card className="p-6 flex flex-col items-center text-center">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 relative mb-4">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-primary overflow-hidden">
                    <User size={40} className="opacity-50" />
                 </div>
                 <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full border-2 border-white hover:bg-[#152e70] transition-colors cursor-pointer text-sm">
                     <Camera size={14} />
                 </button>
             </div>
             <h2 className="text-xl font-bold text-slate-800">{username || 'User'}</h2>
             <p className="text-slate-500 text-sm font-medium mb-3">{email}</p>
             <Badge variant="info" className="mb-6">Verified Account</Badge>
             
             <div className="w-full border-t border-slate-100 pt-6 mt-auto">
                 <div className="flex justify-between text-sm mb-3">
                     <span className="text-slate-500 font-medium tracking-wide">Reports Submitted</span>
                     <span className="font-bold text-slate-800">{loading ? '—' : reports.length}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                     <span className="text-slate-500 font-medium tracking-wide">High Severity</span>
                     <span className="font-bold text-red-600">{loading ? '—' : highCount}</span>
                 </div>
             </div>
         </Card>

         {/* General Settings */}
         <Card className="lg:col-span-2 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Shield size={20} className="text-primary" /> General Settings
            </h3>
            
            <form className="space-y-6" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 tracking-wide">Full Name</label>
                      <Input icon={User} placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 tracking-wide">Email Address</label>
                      <Input icon={Mail} placeholder="Email address" value={email} disabled className="opacity-60 cursor-not-allowed" />
                   </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Report History</h4>
                    {loading ? (
                      <div className="py-4 text-center text-sm font-medium text-slate-400">Loading...</div>
                    ) : reports.length === 0 ? (
                      <div className="py-4 text-center text-sm font-medium text-slate-400">No reports submitted yet</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {reports.slice(0, 8).map(report => (
                          <div key={report._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${report.severity === 'High' ? 'bg-red-500' : report.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{report.damage_type}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{report.location}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-600">{report.confidence}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 justify-end"><Clock size={10} />{new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                   {saved && <span className="text-sm font-medium text-green-600 self-center">✓ Saved!</span>}
                   <Button type="submit">Save Changes</Button>
                </div>
            </form>
         </Card>
      </div>
    </div>
  );
}

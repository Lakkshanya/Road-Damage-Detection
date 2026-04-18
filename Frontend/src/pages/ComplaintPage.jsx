import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Clock, CheckCircle, X, ShieldCheck, Eye, MessageSquare, Send, Plus, Upload, UploadCloud } from 'lucide-react';

const API = 'http://localhost:5005';

export function ComplaintPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('auth_user_role') || 'public';

  // Modal states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionData, setResolutionData] = useState({ explanation: '', imageUrl: '' });
  const [isResolving, setIsResolving] = useState(false);
  const [viewResolution, setViewResolution] = useState(null);

  // New Complaint Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newData, setNewData] = useState({
    streetName: '',
    complainantName: localStorage.getItem('auth_user_name') || '',
    details: '',
    image: null,
    imagePreview: null
  });

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      let url = `${API}/api/complaints/my`;
      if (userRole === 'admin' || userRole === 'corporation') {
        url = `${API}/api/complaints/all`;
      }
      
      const res = await fetch(url, { headers });
      
      if (res.status === 401) {
        localStorage.clear();
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!newData.image) return alert('Please upload a damage evidence photo');
    
    setCreateLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const base64Image = await toBase64(newData.image);
      
      const res = await fetch(`${API}/api/complaints`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          streetName: newData.streetName,
          complainantName: newData.complainantName,
          details: newData.details,
          imageUrl: base64Image
        })
      });

      if (res.status === 401) {
        localStorage.clear();
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to submit complaint');

      alert('Complaint submitted successfully!');
      setShowCreateModal(false);
      setNewData({ ...newData, streetName: '', details: '', image: null, imagePreview: null });
      fetchData();
    } catch (err) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setIsResolving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/complaints/${selectedComplaint._id}/resolve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          corpExplanation: resolutionData.explanation,
          corpImageUrl: resolutionData.imageUrl
        })
      });
      if (!res.ok) throw new Error('Resolution failed');
      alert('Complaint closed successfully!');
      setSelectedComplaint(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Complaints & Resolutions</h1>
          <p className="text-slate-500 font-bold mt-1">
            {userRole === 'corporation' ? 'Manage city repair works' : userRole === 'admin' ? 'Supervise all municipal complaints' : 'Track the status of your reported issues'}
          </p>
        </div>
        {userRole === 'public' && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-primary shadow-lg shadow-primary/20">
            <Plus size={18} /> New Complaint
          </Button>
        )}
      </div>

      {userRole === 'corporation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-slate-800 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Complaints Received</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{complaints.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                <MessageSquare size={24} />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-l-4 border-emerald-500 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cases Resolved</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{complaints.filter(c => c.status === 'Closed').length}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                <CheckCircle size={24} />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-l-4 border-red-500 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Not Resolved</p>
                <p className="text-3xl font-black text-red-600 mt-1">{complaints.filter(c => c.status !== 'Closed').length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-500">
                <Clock size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center font-bold text-slate-400">Loading complaints...</div>
        ) : complaints.length > 0 ? (
          complaints.map((c) => (
            <Card key={c._id} className="p-5 border-slate-200 hover:border-primary/30 transition-all overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 shadow-sm flex items-center justify-center">
                   {c.imageUrl ? (
                     <img src={c.imageUrl} alt="Damage" className="w-full h-full object-cover" />
                   ) : (
                     <div className="flex flex-col items-center text-slate-400">
                        <UploadCloud size={24} />
                        <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                     </div>
                   )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-slate-800">{c.streetName}</h3>
                       <Badge className={`font-black px-3 py-1 ${c.status === 'Closed' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                         {c.status === 'Closed' ? 'CLOSED' : 'NOT CLOSED'}
                       </Badge>
                    </div>
                    <p className="text-slate-500 text-sm font-bold flex items-center gap-2 mt-1">
                       <ShieldCheck size={14} className="text-primary" />
                       Complainant: <span className="text-slate-800 uppercase">{c.complainantName}</span>
                    </p>
                    <p className="mt-3 text-slate-600 font-medium text-sm line-clamp-2">{c.details}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t border-slate-50 gap-4">
                    <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Clock size={12} /> Filed {new Date(c.createdAt).toLocaleDateString()}</span>
                       {c.resolvedAt && <span className="text-emerald-500 flex items-center gap-1.5"><CheckCircle size={12} /> Closed {new Date(c.resolvedAt).toLocaleDateString()}</span>}
                    </div>

                    <div className="flex gap-2">
                       {userRole === 'corporation' && c.status !== 'Closed' && (
                         <Button size="sm" className="gap-2 bg-slate-900" onClick={() => setSelectedComplaint(c)}>
                           Resolve Issue <Eye size={14} />
                         </Button>
                       )}
                       
                       {(userRole === 'admin' || (userRole === 'corporation' && c.status === 'Closed')) && (
                         <Button size="sm" variant="outline" className="gap-2 font-black" onClick={() => setSelectedComplaint(c)}>
                           View Details <Eye size={14} />
                         </Button>
                       )}

                       {userRole === 'public' && c.status === 'Closed' && (
                         <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setViewResolution(c)}>
                           Check Reply <MessageSquare size={14} />
                         </Button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-20 text-center border-dashed bg-slate-50">
             <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">No complaints found in this sector</p>
          </Card>
        )}
      </div>

      {/* NEW COMPLAINT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">New Municipal Complaint</h2>
              <button onClick={() => setShowCreateModal(false)}><X /></button>
            </div>
            
            <form onSubmit={handleCreateComplaint} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Your Name</label>
                  <input required className="w-full p-3 bg-slate-100 rounded-xl outline-none" value={newData.complainantName} onChange={e => setNewData({...newData, complainantName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Street / Location</label>
                  <input required className="w-full p-3 bg-slate-100 rounded-xl outline-none" value={newData.streetName} onChange={e => setNewData({...newData, streetName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Damage Evidence (Photo)</label>
                <div 
                  className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden relative group"
                  onClick={() => document.getElementById('complaint-photo').click()}
                >
                  {newData.imagePreview ? (
                    <img src={newData.imagePreview} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-slate-300 mb-2 group-hover:text-primary" />
                      <p className="text-xs font-bold text-slate-400 uppercase">Click to upload photo</p>
                    </>
                  )}
                  <input id="complaint-photo" type="file" className="hidden" accept="image/*" onChange={e => {
                    const f = e.target.files[0];
                    if(f) {
                      setNewData({...newData, image: f, imagePreview: URL.createObjectURL(f)});
                    }
                  }} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Issue Details</label>
                <textarea required className="w-full p-3 bg-slate-100 rounded-xl outline-none min-h-[80px]" value={newData.details} onChange={e => setNewData({...newData, details: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary font-bold shadow-lg" disabled={createLoading}>
                  {createLoading ? 'Submitting...' : 'Send Complaint'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* RESOLVE MODAL (CORPORATION) */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl p-0 overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
              <div className="w-full md:w-1/2 bg-slate-800 flex items-center justify-center min-h-[300px]">
                 {selectedComplaint.imageUrl ? (
                   <img src={selectedComplaint.imageUrl} className="w-full h-full object-contain" alt="Damage" />
                 ) : (
                   <div className="text-white flex flex-col items-center opacity-30">
                      <UploadCloud size={48} />
                      <p className="font-black uppercase tracking-widest mt-2">No Image Evidence</p>
                   </div>
                 )}
              </div>
              <div className="flex-1 p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">{selectedComplaint.streetName}</h2>
                    <p className="text-slate-500 font-bold">Filed by {selectedComplaint.complainantName}</p>
                  </div>
                  <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Issue Description</p>
                   <p className="text-slate-700 font-medium">{selectedComplaint.details}</p>
                </div>

                {userRole === 'corporation' && selectedComplaint.status !== 'Closed' ? (
                  <form onSubmit={handleResolve} className="space-y-4">
                    <textarea 
                      required
                      className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-primary/20 min-h-[120px]"
                      placeholder="Explain what the corporation did..."
                      value={resolutionData.explanation}
                      onChange={(e) => setResolutionData({...resolutionData, explanation: e.target.value})}
                    />
                    <input 
                      className="w-full p-3 bg-slate-100 rounded-xl outline-none"
                      placeholder="Upload proof image URL (Optional)"
                      value={resolutionData.imageUrl}
                      onChange={(e) => setResolutionData({...resolutionData, imageUrl: e.target.value})}
                    />
                    <div className="flex gap-3 pt-4">
                       <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedComplaint(null)}>Cancel</Button>
                       <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold" disabled={isResolving}>
                         {isResolving ? 'Updating...' : 'Close & Tick'}
                       </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6 pt-6 border-t font-bold">
                    {selectedComplaint.status === 'Closed' ? (
                      <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                         <p className="text-xs text-emerald-600 uppercase mb-2">Corporation Final Report</p>
                         <p className="text-slate-800 text-lg mb-4">{selectedComplaint.corpExplanation}</p>
                         {selectedComplaint.corpImageUrl && (
                           <img src={selectedComplaint.corpImageUrl} className="w-full h-32 object-cover rounded-xl shadow-sm border border-emerald-200" alt="Repair proof" />
                         )}
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-10 uppercase tracking-widest text-xs">Awaiting Municipal Review</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reply Modal */}
      {viewResolution && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Resolution Reply</h2>
                <button onClick={() => setViewResolution(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
             </div>
             
             <div className="space-y-6">
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                   <p className="text-xs font-black text-emerald-600 uppercase mb-2">Message from Corporation</p>
                   <p className="text-slate-800 font-bold text-lg">{viewResolution.corpExplanation}</p>
                </div>
                {viewResolution.corpImageUrl && (
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video shadow-md">
                     <img src={viewResolution.corpImageUrl} className="w-full h-full object-cover" />
                  </div>
                )}
                <Button className="w-full h-12 bg-slate-800 shadow-xl" onClick={() => setViewResolution(null)}>Understood</Button>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
}

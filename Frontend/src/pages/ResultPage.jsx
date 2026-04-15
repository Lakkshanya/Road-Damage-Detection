import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, ArrowLeft, Download, CheckCircle, Crosshair, MapPin, Send, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const SEVERITY_COLORS = { High: '#EF4444', Medium: '#F59E0B', Low: '#3B82F6', Caution: '#EAB308', None: '#10B981' };

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef(null);
  
  const [downloading, setDownloading] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  
  const [complaintData, setComplaintData] = useState({
    streetName: '',
    complainantName: '',
    details: ''
  });

  // Persistence logic: Load from session storage if state is lost on refresh
  const [resultState] = useState(() => {
    if (location.state && location.state.mlResult) {
      const data = { 
        mlResult: location.state.mlResult, 
        filePreview: location.state.filePreview 
      };
      sessionStorage.setItem('last_ml_result', JSON.stringify(data));
      return data;
    }
    const saved = sessionStorage.getItem('last_ml_result');
    return saved ? JSON.parse(saved) : { mlResult: null, filePreview: '' };
  });

  const mlResult = resultState.mlResult || { damage: 'Unknown', confidence: '0.00%', severity: 'N/A' };
  const filePreview = resultState.filePreview || '';

  const isSevere = mlResult.severity === 'High';
  const isNoDamage = mlResult.damage === 'No Damage';

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       0.5,
        filename:     `RoadDamage_Report_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const urlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Base64 conversion failed:', e);
      return url; // Fallback to original
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setComplaintSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Ensure image is Base64 for persistence
      let finalImageUrl = filePreview;
      if (filePreview && filePreview.startsWith('blob:')) {
        finalImageUrl = await urlToBase64(filePreview);
      }

      const response = await fetch('http://localhost:5005/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...complaintData,
          imageUrl: finalImageUrl // Passing the persistent image evidence
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to submit complaint');
      
      alert('Complaint submitted successfully to Corporation!');
      setShowComplaintForm(false);
    } catch (err) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setComplaintSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analysis Result</h1>
            <p className="text-slate-500 font-medium mt-1">AI-Assisted Diagnostic</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <Button variant="outline" className="gap-2" onClick={() => navigate('/dashboard')}>
             <ArrowLeft size={16} /> Dashboard
           </Button>
           <Button className="gap-2 bg-secondary hover:bg-secondary/90" onClick={() => setShowComplaintForm(true)}>
             <MessageSquare size={16} /> Create Complaint
           </Button>
        </div>
      </div>

      <div ref={reportRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-2 overflow-hidden flex flex-col bg-slate-50 border-slate-200">
              <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                 {filePreview ? (
                   <img src={filePreview} alt="Damage evidence" className="w-full h-full object-cover" />
                 ) : (
                   <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
                      <p>Evidence lost on refresh</p>
                   </div>
                 )}
              </div>
              
              {/* Relocated and Enlarged Download Button */}
              <div className="p-4 pt-4">
                 <Button 
                   variant="outline" 
                   className="w-full text-md h-12 gap-3 border-2 border-slate-200 hover:bg-slate-100 hover:text-primary transition-all font-bold"
                   onClick={handleDownloadPDF} 
                   disabled={downloading}
                 >
                   <Download size={20} className={downloading ? 'animate-bounce' : ''} /> 
                   {downloading ? 'Processing PDF...' : 'Download Full Analysis Report'}
                 </Button>
                 <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">Capture evidence for legal and maintenance documentation</p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={`p-6 border-l-4 ${isNoDamage ? 'border-l-primary' : isSevere ? 'border-l-red-500' : 'border-l-amber-500 shadow-sm'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${isNoDamage ? 'bg-emerald-50 text-primary' : isSevere ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                   {isNoDamage ? <CheckCircle size={28} /> : isSevere ? <AlertCircle size={28} /> : <AlertTriangle size={28} />}
                </div>
                <div className="flex-1">
                   <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                     {isNoDamage ? 'No Damage' : `${mlResult.damage} Detected`}
                   </h2>
                   <p className="text-slate-600 mt-1 text-sm leading-relaxed">
                     {isNoDamage ? 'This section of the road is in good condition.' : 'Significant road damage detected and verified by AI pipeline.'}
                   </p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* Confidence hidden for frontend per requirement */}
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full shadow-sm ${isNoDamage ? 'bg-primary' : isSevere ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-amber-500'}`} />
                        <span className={`text-lg font-bold ${isNoDamage ? 'text-primary' : isSevere ? 'text-red-600' : 'text-amber-600'}`}>
                          {isNoDamage ? 'Safe' : mlResult.severity}
                        </span>
                    </div>
                 </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-primary" /> Recommended Actions
              </h3>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3 text-slate-600 text-sm font-medium border-b border-slate-50 pb-3">
                    <div className="w-1 h-5 bg-secondary rounded-full shrink-0" />
                    {isSevere ? 'Dispatch maintenance team immediately.' : 'Schedule for review during next maintenance cycle.'}
                 </li>
                 <li className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                    <div className="w-1 h-5 bg-secondary rounded-full shrink-0" />
                    Update local traffic warning systems and notify corporation.
                 </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Complaint</h2>
            <p className="text-slate-500 text-sm mb-6">Submit this damage to the Municipal Corporation for resolution.</p>
            
            <form onSubmit={handleCreateComplaint} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Complainant Name</label>
                <input 
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Your full name"
                  value={complaintData.complainantName}
                  onChange={(e) => setComplaintData({...complaintData, complainantName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Street Name / Area</label>
                <input 
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. North High Court Colony, Villivakkam"
                  value={complaintData.streetName}
                  onChange={(e) => setComplaintData({...complaintData, streetName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Additional Details</label>
                <textarea 
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                  placeholder="Describe the severity or surrounding issues..."
                  value={complaintData.details}
                  onChange={(e) => setComplaintData({...complaintData, details: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowComplaintForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={complaintSubmitting}>
                  <Send size={16} /> {complaintSubmitting ? 'Submitting...' : 'Send Complaint'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

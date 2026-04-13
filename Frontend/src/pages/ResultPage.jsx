import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, ArrowLeft, Download, CheckCircle, Crosshair } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const state = location.state || {};
  const mlResult = state.mlResult || { damage: 'Unknown', confidence: '0.00%', severity: 'N/A' };
  const filePreview = state.filePreview || '';

  const isSevere = mlResult.severity === 'High';

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
      // Fallback: use browser print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/upload')}
          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analysis Result</h1>
          <p className="text-slate-500 font-medium mt-1">AI-Assisted Diagnostic</p>
        </div>
      </div>

      {/* This entire section is captured to PDF */}
      <div ref={reportRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Uploaded Image */}
          <Card className="p-2 overflow-hidden flex flex-col">
            <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
               
               {filePreview ? (
                 <img src={filePreview} alt="Damage evidence" className="w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiNmM2Y0ZjYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjZDZkM2QxIi8+PC9zdmc+')] opacity-80" />
               )}
               
               {/* Bounding box overlay */}
               <div className="absolute top-[30%] left-[40%] w-32 h-24 border-2 border-accent bg-accent/20 rounded z-10 flex items-start justify-end p-1">
                   <Badge className="bg-accent text-white border-none shadow-sm text-[10px]">{mlResult.damage}</Badge>
               </div>
               
            </div>
            <div className="p-4 pt-6 flex items-center justify-between">
               <div className="text-sm font-medium text-slate-500">
                 Uploaded: {new Date().toLocaleString()}
               </div>
               <Button variant="outline" className="text-sm h-9 px-3 gap-2" onClick={handleDownloadPDF} disabled={downloading}>
                 <Download size={16} /> 
                 {downloading ? 'Generating PDF...' : 'Download'}
               </Button>
            </div>
          </Card>

          {/* Results Details */}
          <div className="space-y-6">
            <Card className={`p-6 border-l-4 ${isSevere ? 'border-l-red-500' : 'border-l-amber-500'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${isSevere ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                   {isSevere ? <AlertCircle size={28} /> : <AlertTriangle size={28} />}
                </div>
                <div className="flex-1">
                   <h2 className="text-xl font-bold text-slate-800">{mlResult.damage} Detected</h2>
                   <p className="text-slate-600 mt-1">This geometry was analyzed by the AI pipeline.</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                       {mlResult.confidence} <Crosshair size={18} className="text-primary" />
                    </p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Severity</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] ${isSevere ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className={`text-lg font-bold ${isSevere ? 'text-red-600' : 'text-amber-600'}`}>{mlResult.severity}</span>
                    </div>
                 </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-4">Recommended Actions</h3>
              <ul className="space-y-3">
                 <li className="flex items-start gap-3 text-slate-600 font-medium">
                    <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                    {isSevere ? 'Dispatch maintenance team immediately.' : 'Schedule for review during next maintenance cycle.'}
                 </li>
                 <li className="flex items-start gap-3 text-slate-600 font-medium">
                    <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                    Update local traffic warning systems.
                 </li>
              </ul>
              <div className="mt-6">
                 <Button className="w-full">
                    Create Work Order
                 </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle, AlertCircle, ArrowLeft, Download, CheckCircle, Crosshair } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function ResultPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analysis Result</h1>
          <p className="text-slate-500 font-medium mt-1">Report #RD-2024-089</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uploaded Image */}
        <Card className="p-2 overflow-hidden flex flex-col">
          <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
             {/* Mock bounding box for detected damage */}
             <div className="absolute top-[30%] left-[40%] w-32 h-24 border-2 border-accent bg-accent/20 rounded z-10 flex items-start justify-end p-1">
                 <Badge className="bg-accent text-white border-none shadow-sm text-[10px]">Pothole 94%</Badge>
             </div>
             
             {/* Placeholder background representing dirty road */}
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiNmM2Y0ZjYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjZDZkM2QxIi8+PC9zdmc+')] opacity-80" />
          </div>
          <div className="p-4 pt-6 flex items-center justify-between">
             <div className="text-sm font-medium text-slate-500">
               Uploaded: Today, 14:32 PM
             </div>
             <Button variant="outline" className="text-sm h-9 px-3 gap-2">
               <Download size={16} /> 
               Export Image
             </Button>
          </div>
        </Card>

        {/* Results Details */}
        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full">
                 <AlertCircle size={28} />
              </div>
              <div className="flex-1">
                 <h2 className="text-xl font-bold text-slate-800">Severe Pothole Detected</h2>
                 <p className="text-slate-600 mt-1">This geometry poses an immediate risk to vehicles.</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                     94.6% <Crosshair size={18} className="text-primary" />
                  </p>
               </div>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Severity</p>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                      <span className="text-lg font-bold text-red-600">High</span>
                  </div>
               </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Recommended Actions</h3>
            <ul className="space-y-3">
               <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                  Dispatch maintenance team immediately.
               </li>
               <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                  Update local traffic warning systems.
               </li>
               <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <CheckCircle size={20} className="text-secondary shrink-0 mt-0.5" />
                  Log report to district priority queue.
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
  );
}

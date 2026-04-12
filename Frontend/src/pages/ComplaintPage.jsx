import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileText, MoreHorizontal, Loader2 } from 'lucide-react';

export function ComplaintPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const complaints = [];

  const getVisiblePages = () => {
    if (currentPage === 1) return [1, 2, 3];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report successfully generated and placed in your downloads folder!');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Complaints & Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Manage user submitted road issues</p>
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="min-w-[160px]"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Generating...</span>
          ) : (
            'Generate Report'
          )}
        </Button>
      </div>

      <Card className="overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint ID</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {complaints.length > 0 ? complaints.map((complaint) => (
                     <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-2 font-medium text-slate-800">
                              <FileText size={16} className="text-slate-400" />
                              {complaint.id}
                           </div>
                        </td>
                        <td className="px-6 py-4 truncate max-w-[300px] font-medium text-slate-600">
                           {complaint.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm font-medium">
                           {complaint.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <Badge variant={
                              complaint.status === 'Pending' ? 'warning' :
                              complaint.status === 'In Progress' ? 'info' : 'success'
                           }>
                              {complaint.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                           <button className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100">
                              <MoreHorizontal size={20} />
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                           No complaints found
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
         
         <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 font-medium">
            <span>Showing {complaints.length === 0 ? '0' : '1'} to {complaints.length} of {complaints.length} entries</span>
            <div className="flex gap-1">
               <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors" 
                  disabled={currentPage === 1}
               >Prev</button>
               
               {getVisiblePages().map(page => (
                  <button 
                     key={page}
                     onClick={() => setCurrentPage(page)}
                     className={`px-3 py-1 rounded-md transition-colors ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                     {page}
                  </button>
               ))}

               <button 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1 rounded-md hover:bg-slate-100 transition-colors" 
               >Next</button>
            </div>
         </div>
      </Card>
    </div>
  );
}

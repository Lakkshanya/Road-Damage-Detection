import { useState } from 'react';
import { UploadCloud, MapPin, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

export function UploadPage() {
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      // Simulate submission & redirect to result page
      navigate('/result');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Upload Report</h1>
        <p className="text-slate-500 font-medium mt-1">Submit a new image for damage analysis</p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Image Evidence</h3>
            
            {!file ? (
              <div 
                className="w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <div className="p-4 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-primary transition-colors mb-4">
                  <UploadCloud size={32} />
                </div>
                <p className="text-slate-600 font-medium">Click or drag & drop image here</p>
                <p className="text-slate-400 text-sm mt-1">JPEG, PNG, JPG (max 5MB)</p>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative w-full h-64 border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="p-2 bg-white/80 hover:bg-white text-slate-600 hover:text-red-500 rounded-full shadow backdrop-blur transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                {/* Simulated preview image placeholder */}
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon size={48} className="mb-2 opacity-50" />
                  <span className="font-medium">{file.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Location Details</h3>
             <Input 
                icon={MapPin} 
                placeholder="Enter street name, cross street, or coordinates" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
             />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => setFile(null)}>Cancel</Button>
            <Button type="submit" disabled={!file} className="min-w-[150px]">
              Analyze Image
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

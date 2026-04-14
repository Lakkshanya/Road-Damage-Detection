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

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      // Convert image to Base64 for persistence and complaint submission
      const base64Image = await toBase64(file);

      // Save this report to the backend database
      let latitude = null;
      let longitude = null;
      if (location) {
        try {
          let geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
          let geoData = await geoRes.json();
          
          if (!geoData || geoData.length === 0) {
            const fallbackLocation = location.includes('Chennai') ? location : `${location}, Chennai`;
            geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackLocation)}&limit=1`);
            geoData = await geoRes.json();
          }

          if (geoData && geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
          }
        } catch (geoErr) {
          console.warn('Geocoding failed, saving without coordinates:', geoErr);
        }
      }

      const token = localStorage.getItem('auth_token');
      await fetch('http://localhost:5005/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          damage_type: data.damage,
          confidence: data.confidence,
          severity: data.severity,
          location: location || 'Unknown Location',
          latitude,
          longitude,
        })
      });

      // Navigate to ResultPage with real ML results and coordinates for the map
      navigate('/result', { 
        state: { 
          mlResult: { ...data, latitude, longitude }, 
          filePreview: base64Image // Persistent Base64 instead of transient blob
        } 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
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
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => setFile(null)}>Cancel</Button>
            <Button type="submit" disabled={!file || analyzing} className="min-w-[150px]">
              {analyzing ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, MapPin } from 'lucide-react';

export function MapViewPage() {
  const [activeType, setActiveType] = useState('Potholes');
  const damageTypes = ['Potholes', 'Cracks', 'Surface'];
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col pt-0 px-0 sm:-m-6 lg:-m-8">
       {/* Full map layout taking all available space */}
       <div className="relative flex-1 w-full bg-slate-200 overflow-hidden rounded-xl lg:rounded-none">
          
          {/* Map Image Placeholder */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxwYXRoIGQ9Ik0wIDBoODB2ODBIMHoiIGZpbGw9IiNmM2Y0ZjYiLz48cGF0aCBkPSJNMCAyMGg4MHY0MEgweiIgZmlsbD0iI2U1NWM2OCIgb3BhY2l0eT0iMC4wNSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjIiIGZpbGw9IiNkNmQzZDEiLz4KPC9zdmc+')] opacity-70 bg-repeat bg-center" />
          
          {/* Mock Map Pins */}
          <div className="absolute top-1/4 left-1/3 p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 cursor-pointer transition-transform animate-pulse">
             <MapPin size={24} />
          </div>
          <div className="absolute top-1/2 left-1/2 p-2 bg-yellow-500 text-white rounded-full shadow-lg hover:scale-110 cursor-pointer transition-transform">
             <MapPin size={20} />
          </div>
          <div className="absolute bottom-1/3 right-1/4 p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 cursor-pointer transition-transform">
             <MapPin size={24} />
          </div>

          {/* Floating Filter Panel */}
          <Card className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 w-80 p-5 shadow-2xl border-none bg-white/95 backdrop-blur-md">
             <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-lg">
                <Filter size={20} className="text-primary" /> Map Filters
             </h3>
             
             <div className="space-y-6">
                <div className="relative group">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                   <input type="text" placeholder="Search location..." className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border border-transparent focus:border-primary/20" />
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Severity</p>
                  <div className="flex gap-2">
                      <Badge variant="danger" className="cursor-pointer hover:scale-105 transition-transform px-3 py-1 text-sm bg-red-100 text-red-700">High</Badge>
                      <Badge variant="warning" className="cursor-pointer hover:scale-105 transition-transform px-3 py-1 text-sm bg-yellow-100 text-yellow-700">Medium</Badge>
                      <Badge variant="info" className="cursor-pointer hover:scale-105 transition-transform px-3 py-1 text-sm bg-blue-100 text-blue-700">Low</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Damage Type</p>
                  <div className="flex flex-wrap gap-2">
                      {damageTypes.map((type) => (
                         <span 
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                               activeType === type 
                               ? 'bg-primary text-white shadow-md scale-105' 
                               : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                         >
                            {type}
                         </span>
                      ))}
                  </div>
                </div>
             </div>
          </Card>
       </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const API = 'http://localhost:5005';

const SEVERITY_COLORS = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#3B82F6',
  None: '#10B981',    // Green for No Damage
};

// Helper component to update map view when center changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function MapViewPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch(`${API}/api/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        // Only keep reports with valid coordinates
        const withCoords = (Array.isArray(data) ? data : []).filter(r => r.latitude && r.longitude);
        setReports(withCoords);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Center map on India by default; if reports exist, center on the first one
  const defaultCenter = reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [13.0827, 80.2707]; // Chennai as default

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Live Damage Map</h1>
        <p className="text-slate-500 font-medium mt-1">Pin-pointed locations of all reported road damages</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        {Object.entries(SEVERITY_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}></span>
            <span className="text-sm font-medium text-slate-600">
              {label === 'None' ? 'No Damage' : `${label} Severity`}
            </span>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl" style={{ height: '70vh' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 font-medium">Loading map...</div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={reports.length > 0 ? 13 : 5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <RecenterMap center={defaultCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {reports.map((report) => (
              <CircleMarker
                key={report._id}
                center={[report.latitude, report.longitude]}
                radius={report.severity === 'High' ? 12 : report.severity === 'Medium' ? 9 : 7}
                pathOptions={{
                  color: SEVERITY_COLORS[report.severity] || '#94A3B8',
                  fillColor: SEVERITY_COLORS[report.severity] || '#94A3B8',
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-bold text-slate-800 text-base mb-1">{report.damage_type}</p>
                    <p className="text-slate-500 mb-1">📍 {report.location}</p>
                    <p className="text-slate-500 mb-1">🎯 Confidence: <strong>{report.confidence}</strong></p>
                    <p className="text-slate-500 mb-1">⚠️ Severity: <strong style={{ color: SEVERITY_COLORS[report.severity] }}>{report.severity}</strong></p>
                    <p className="text-slate-400 text-xs mt-2">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </Card>

      {reports.length === 0 && !loading && (
        <div className="text-center py-4 text-slate-400 text-sm font-medium">
          No geo-located reports yet. Upload an image with a location to see pins on the map!
        </div>
      )}
    </div>
  );
}

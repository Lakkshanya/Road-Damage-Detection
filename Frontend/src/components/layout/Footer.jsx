import { ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Branding */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Road<span className="text-primary">AI</span></span>
          </div>
          <p className="text-sm leading-relaxed">
            Revolutionizing road infrastructure maintenance through advanced AI-driven damage detection and geospatial intelligence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-6">Solution</h3>
          <ul className="space-y-4 text-sm">
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Real-time Dashboard</Link></li>
            <li><Link to="/map" className="hover:text-white transition-colors">Geospatial Mapping</Link></li>
            <li><Link to="/analytics" className="hover:text-white transition-colors">AI Analytics</Link></li>
            <li><Link to="/upload" className="hover:text-white transition-colors">Damage Analysis</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-bold mb-6">Resources</h3>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold mb-6">Contact Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-primary shrink-0" />
              <span>123 Smart City Tech Hub, <br />Innovation District, NY 10001</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-primary shrink-0" />
              <span>support@roadai.geo</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-primary shrink-0" />
              <span>+1 (555) 012-3456</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
        <p>© {new Date().getFullYear()} Road Damage AI. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <span className="text-red-500 text-lg">♥</span> for safer roads.
        </p>
      </div>
    </footer>
  );
}

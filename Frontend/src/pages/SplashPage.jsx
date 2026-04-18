import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, Target, BarChart3, Upload } from 'lucide-react';
import heroImage from '../assets/hero_road.png';
import potholeImage from '../assets/pothole_detail.png';
import cityMapImage from '../assets/city_map.png';

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation / Header Area */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck size={24} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              Road<span className="text-primary">AI</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
                <Zap size={16} /> Empowering Smart Infrastructure
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                AI Powered <br />
                <span className="text-primary">Road Damage</span> <br />
                Detection.
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A state-of-the-art geospatial intelligence platform that identifies, classifies, and tracks road deterioration in real-time using advanced neural networks.
              </p>
              <div className="flex justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  Access Platform <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-[32px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative rounded-[32px] overflow-hidden border-8 border-white shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="AI Road Detection Hero" 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Deep Learning for Better Mobility</h2>
            <p className="text-slate-500 font-medium text-lg">Our system processes thousands of images per hour to provide actionable insights for municipal maintenance teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all space-y-6">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Precision Detection</h3>
              <p className="text-slate-600 leading-relaxed font-medium">98% accuracy in identifying potholes, longitudinal cracks, and alligator cracking across various weather conditions.</p>
              <img src={potholeImage} alt="Detection detail" className="rounded-2xl border-4 border-white shadow-md mt-4" />
            </div>

            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all space-y-6">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Spatial Analytics</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Visualizing damage density across the entire road network to prioritize high-risk areas for immediate intervention.</p>
              <img src={cityMapImage} alt="City mapping" className="rounded-2xl border-4 border-white shadow-md mt-4" />
            </div>

            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all space-y-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
                <Upload size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Immediate Reporting</h3>
              <p className="text-slate-600 leading-relaxed font-medium">Any citizen or municipality worker can upload damage images for instant AI analysis and automated reporting.</p>
              <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-black italic text-2xl">
                Ready to Deploy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Temporary Footer Placeholders */}
      <footer className="bg-slate-900 py-12 text-center text-slate-500">
           <p>© 2026 Road Damage AI</p>
      </footer>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-[#1e40a6] to-secondary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-white/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full border-[20px] border-white/10 blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center transition-all duration-1000 ease-in-out transform translate-y-0 opacity-100">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6 text-primary">
           <ShieldCheck size={48} />
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          Road<span className="text-accent">AI</span>
        </h1>
        <p className="text-blue-100 text-lg font-medium tracking-wide">
          Smart Damage Detection System
        </p>

        {/* Loading dots */}
        <div className="mt-12 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

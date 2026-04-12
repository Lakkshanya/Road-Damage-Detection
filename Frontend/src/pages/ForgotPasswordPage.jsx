import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-primary/90 to-primary/0" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 text-primary">
               <KeyRound size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Reset Password</h1>
           <p className="text-slate-500 mt-2 font-medium">We'll send you reset instructions</p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/90">
          <form onSubmit={handleReset} className="space-y-6">
            <Input 
              type="email" 
              placeholder="Email Address" 
              icon={Mail} 
              required
            />

            <Button type="submit" className="w-full h-12 text-lg">
              Send Instructions
            </Button>
          </form>

          <div className="mt-8 text-center text-sm items-center font-medium text-slate-500">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:text-secondary transition-colors font-semibold">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

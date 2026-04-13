import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Login successful, save real API token and User Profile
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user_name', data.user_profile.username);
      localStorage.setItem('auth_user_email', data.user_profile.email);
      
      navigate('/dashboard');

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-primary/90 to-primary/0" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 text-primary">
               <CheckCircle2 size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
           <p className="text-slate-500 mt-2 font-medium">Sign in to your account</p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/90">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {errorMsg && (
               <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg text-center">
                  {errorMsg}
               </div>
            )}

            <Input 
              type="email" 
              placeholder="Email Address" 
              icon={Mail} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password" 
                icon={Lock} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:text-secondary font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm items-center font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-secondary transition-colors font-semibold">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

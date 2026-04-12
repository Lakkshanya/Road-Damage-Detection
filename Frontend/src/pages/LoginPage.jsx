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

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg(''); // clear previous errors

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    const savedEmail = localStorage.getItem('auth_email');
    const savedPassword = localStorage.getItem('auth_password');

    if (!savedEmail) {
      setErrorMsg('Please sign up first.');
      return;
    }

    if (email !== savedEmail) {
      setErrorMsg('User not found. Please sign up first.');
      return;
    }

    if (password !== savedPassword) {
      setErrorMsg('Incorrect password. Please try again.');
      return;
    }

    // Login successful
    localStorage.setItem('auth_token', 'mock_token_12345');
    navigate('/dashboard');
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

            <Button type="submit" className="w-full h-12 text-lg">
              Login In
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

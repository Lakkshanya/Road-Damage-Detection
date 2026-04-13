import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5005/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      
      // Store user data in localStorage globally for the app
      localStorage.setItem('auth_email', email);
      
      // Navigate to VerificationPage instead of ProfileSetup so they can enter OTP
      navigate('/verify');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-primary/90 to-primary/0" />
      
      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 text-primary">
               <UserPlus size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h1>
           <p className="text-slate-500 mt-2 font-medium">Join the RoadAI community</p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/90">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            
            <Input 
              type="text" 
              placeholder="Full Name" 
              icon={User} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <Input 
              type="email" 
              placeholder="Email ID" 
              icon={Mail} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              type="password" 
              placeholder="Password" 
              icon={Lock} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={loading}>
              {loading ? 'Sending Verification...' : 'Next Step'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm items-center font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary transition-colors font-semibold">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

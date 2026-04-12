import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function ProfileSetupPage() {
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/verify'); // Move to verification code
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-primary/90 to-primary/0" />
      
      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 text-primary">
               <CheckCircle2 size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Profile Details</h1>
           <p className="text-slate-500 mt-2 font-medium">Verify your profile information to continue</p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/90">
          <form onSubmit={handleNext} className="space-y-6">
            <Input 
              type="text" 
              placeholder="Name" 
              icon={User} 
              required
            />
            
            <Input 
              type="email" 
              placeholder="Email ID" 
              icon={Mail} 
              required
            />
            
            <Input 
              type="tel" 
              placeholder="Phone Number" 
              icon={Phone} 
              required
            />

            <Button type="submit" className="w-full h-12 text-lg mt-2">
              Send Verification Code
            </Button>
          </form>

          <div className="mt-8 text-center text-sm items-center font-medium text-slate-500">
            Need to change your password?{' '}
            <Link to="/signup" className="text-primary hover:text-secondary transition-colors font-semibold">
              Go back
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

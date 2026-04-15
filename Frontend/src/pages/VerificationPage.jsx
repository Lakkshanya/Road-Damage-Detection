import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function VerificationPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Focus the first input box when the page loads
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (isNaN(value)) return;
    
    // Take just the last character if they pasted something
    const char = value.slice(-1);
    
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // If typing a digit, immediately move and focus on the next box
    if (char !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // If pressing Backspace on an empty box, move to the previous box
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;
    
    setLoading(true);
    setError(null);
    
    // Retrieve email we saved during signup
    const email = localStorage.getItem('auth_email');
    
    if (!email) {
      setError("Email not found. Please sign up again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5005/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: fullCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid Verification Code');
      }
      
      // Success! Proceed to Login Page
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
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
               <ShieldCheck size={32} />
           </div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Verify Email</h1>
           <p className="text-slate-500 mt-2 font-medium">We sent a 6-digit code to your email</p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/90">
          <form onSubmit={handleVerify} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <div className="flex justify-between gap-2 sm:gap-3">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={2} // Using 2 to catch pasting, filtered by slice(-1)
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                />
              ))}
            </div>

            <Button 
               type="submit" 
               className="w-full h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed" 
               disabled={code.join('').length !== 6 || loading}
            >
              {loading ? 'Verifying...' : <>Verify Account <ArrowRight size={20} className="ml-2" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm items-center font-medium text-slate-500">
            Didn't receive the code?{' '}
            <button type="button" className="text-primary hover:text-secondary transition-colors font-semibold ml-1 cursor-pointer">
              Resend
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

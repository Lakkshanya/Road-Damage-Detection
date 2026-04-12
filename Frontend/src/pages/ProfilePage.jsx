import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, Camera, Clock } from 'lucide-react';

export function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Profile Card */}
         <Card className="p-6 flex flex-col items-center text-center">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 relative mb-4">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-primary overflow-hidden">
                    <User size={40} className="opacity-50" />
                 </div>
                 <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full border-2 border-white hover:bg-[#152e70] transition-colors cursor-pointer text-sm">
                     <Camera size={14} />
                 </button>
             </div>
             <h2 className="text-xl font-bold text-slate-800">Admin User</h2>
             <p className="text-slate-500 text-sm font-medium mb-3">City Official</p>
             <Badge variant="info" className="mb-6">Verified Account</Badge>
             
             <div className="w-full border-t border-slate-100 pt-6 mt-auto">
                 <div className="flex justify-between text-sm mb-3">
                     <span className="text-slate-500 font-medium tracking-wide">Reports Submitted</span>
                     <span className="font-bold text-slate-800">0</span>
                 </div>
                 <div className="flex justify-between text-sm">
                     <span className="text-slate-500 font-medium tracking-wide">Accuracy Rate</span>
                     <span className="font-bold text-green-600">0%</span>
                 </div>
             </div>
         </Card>

         {/* General Settings */}
         <Card className="lg:col-span-2 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Shield size={20} className="text-primary" /> General Settings
            </h3>
            
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 tracking-wide">Full Name</label>
                      <Input icon={User} placeholder="Enter full name" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 tracking-wide">Email Address</label>
                      <Input icon={Mail} placeholder="Enter email address" />
                   </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Activity History</h4>
                    <div className="py-4 text-center text-sm font-medium text-slate-400">
                       No recent activity
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                   <Button type="button">Save Changes</Button>
                </div>
            </form>
         </Card>
      </div>
    </div>
  );
}

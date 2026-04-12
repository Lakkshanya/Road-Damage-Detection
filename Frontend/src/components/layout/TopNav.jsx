import { useState } from 'react';
import { Bell, Menu, Search, User, BellOff } from 'lucide-react';

export function TopNav({ onMenuToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Optional Search */}
        <div className="hidden md:flex items-center relative">
          <Search size={18} className="absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative">
          <button 
             onClick={() => setShowNotifications(!showNotifications)}
             className={`p-2 relative text-slate-600 rounded-full transition-colors ${showNotifications ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
          >
            <Bell size={20} />
          </button>

          {showNotifications && (
             <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <h3 className="font-bold text-slate-800">Notifications</h3>
                   <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full shadow-sm">0</span>
                </div>
                <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 ring-1 ring-slate-100">
                       <BellOff size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1 tracking-tight">You're all caught up!</p>
                    <p className="text-xs font-medium text-slate-500">No new notifications to show right now.</p>
                </div>
             </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-slate-700 leading-none mb-1">Admin User</p>
            <p className="text-slate-400 text-xs leading-none border-t border-transparent pt-[1px]">City Official</p>
          </div>
        </div>
      </div>
    </header>
  );
}

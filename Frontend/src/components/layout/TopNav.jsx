import { useState } from 'react';
import { Bell, Menu, Search, User, BellOff } from 'lucide-react';

export function TopNav({ onMenuToggle }) {
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
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={16} />
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-slate-700 leading-none mb-1">
              {localStorage.getItem('auth_user_name') || 'Guest User'}
            </p>
            <p className="text-slate-400 text-xs leading-none border-t border-transparent pt-[1px]">Active Session</p>
          </div>
        </div>
      </div>
    </header>
  );
}

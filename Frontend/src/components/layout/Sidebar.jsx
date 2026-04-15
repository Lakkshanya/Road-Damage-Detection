import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  MessageSquareWarning, 
  User,
  LogOut,
  UploadCloud
} from 'lucide-react';

export function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const userRole = localStorage.getItem('auth_user_role') || 'public';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: UploadCloud, hideFor: ['corporation'] },
    { name: 'Map View', path: '/map', icon: Map },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Complaints', path: '/complaints', icon: MessageSquareWarning },
    { name: 'Profile', path: '/profile', icon: User },
  ].filter(item => !item.hideFor || !item.hideFor.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar sidebar */}
      <aside className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-slate-100 shadow-soft transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">Road<span className="text-primary">AI</span></span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

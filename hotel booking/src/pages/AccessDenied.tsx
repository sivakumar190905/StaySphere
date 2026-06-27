import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/common/Toast';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (e: any) {
      toast.error('Logout failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1437] text-white p-6 font-jakarta">
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-8">
        
        {/* Shield Icon with alert indicator */}
        <div className="relative flex justify-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center animate-pulse">
            <ShieldAlert size={40} className="text-rose-500" />
          </div>
          <span className="absolute top-1 right-[calc(50%-32px)] w-4 h-4 rounded-full bg-rose-500 border-2 border-[#0B1437] flex items-center justify-center text-[9px] font-black text-white">
            !
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white m-0">403</h1>
          <h2 className="text-lg font-bold text-slate-350 m-0">Access Denied</h2>
          <p className="text-xs text-slate-450 font-semibold leading-relaxed pt-2">
            You do not have the required permissions to access this dashboard. Only administrators or designated staff can access these controls.
          </p>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 gap-3 text-xs font-extrabold pt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#2563EB] hover:bg-blue-600 text-white py-3.5 rounded-xl shadow-md shadow-blue-500/10 border-none cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <Home size={15} />
            <span>Return to Homepage</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 py-3 rounded-xl bg-transparent text-slate-300 transition-all cursor-pointer font-bold"
            >
              <ArrowLeft size={14} />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 border border-rose-900/30 hover:border-rose-700 hover:bg-rose-950/20 py-3 rounded-xl bg-transparent text-rose-400 transition-all cursor-pointer font-bold"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Fine footer */}
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2 border-t border-slate-800/40">
          StaySphere Security Portal
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;

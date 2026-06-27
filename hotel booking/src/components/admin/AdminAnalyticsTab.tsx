import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, DollarSign } from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Platform Analytics</h2>
        <p className="text-slate-500 text-xs mt-2">Comprehensive overview of platform growth and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Users size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">12,450</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">+450 this week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Volume</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">$2.4M</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookings</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">8,920</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">Record high season</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <BarChart2 size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">14.2%</p>
          <p className="text-[10px] font-bold text-amber-500 mt-1">Stable</p>
        </div>
      </div>

      <div className="h-64 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center flex-col mt-8">
        <TrendingUp size={32} className="text-slate-300 mb-2" />
        <p className="text-slate-400 font-bold text-sm">Interactive Growth Chart</p>
        <p className="text-slate-400 font-semibold text-xs">Awaiting charting library integration</p>
      </div>
    </motion.div>
  );
};

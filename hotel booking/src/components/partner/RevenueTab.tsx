import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Star } from 'lucide-react';

export const RevenueTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Revenue Reports</h2>
        <p className="text-slate-500 text-xs mt-2">Track your financial performance and occupancy rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Revenue</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">$1,450.00</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">+12% from yesterday</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">$42,300.00</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">+8% from last month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <PieChart size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">85%</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">High season average</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Room</h3>
          </div>
          <p className="text-lg font-black text-slate-900 truncate">Ocean View Suite</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">12 bookings this week</p>
        </div>
      </div>

      <div className="h-64 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center flex-col">
        <TrendingUp size={32} className="text-slate-300 mb-2" />
        <p className="text-slate-400 font-bold text-sm">Interactive Revenue Chart</p>
        <p className="text-slate-400 font-semibold text-xs">Awaiting charting library integration</p>
      </div>
    </motion.div>
  );
};

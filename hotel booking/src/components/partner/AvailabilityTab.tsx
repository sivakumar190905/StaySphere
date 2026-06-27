import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check } from 'lucide-react';

export const AvailabilityTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Availability Calendar</h2>
          <p className="text-slate-500 text-xs mt-2">Manage your room availability on a daily basis.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 border-none cursor-pointer">
          <Check size={16} />
          Save Changes
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 flex items-center justify-center rounded-2xl mb-4">
          <Calendar size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Calendar Integration</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">
          Interactive full-screen calendar component for blocking dates and managing allocations.
        </p>
      </div>
    </motion.div>
  );
};

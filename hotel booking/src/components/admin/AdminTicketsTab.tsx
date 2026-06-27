import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../store/AppContext';
import { MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export const AdminTicketsTab: React.FC = () => {
  const { supportTickets, updateSupportTicketStatus } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Support Tickets</h2>
        <p className="text-slate-500 text-xs mt-2">Manage customer and partner support requests.</p>
      </div>

      <div className="grid gap-4">
        {supportTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ticket.subject}</h4>
                  <p className="text-[10px] font-semibold text-slate-400">By {ticket.userEmail}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                  ticket.status === 'OPEN'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{ticket.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end gap-2">
              {ticket.status === 'OPEN' && (
                <button
                  onClick={() => updateSupportTicketStatus(ticket.id, 'RESOLVED')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs px-4 py-2 rounded-xl transition-colors border-none cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
        {supportTickets.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Support Tickets</h3>
            <p className="text-slate-500 text-sm mt-1">There are no open support tickets at the moment.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

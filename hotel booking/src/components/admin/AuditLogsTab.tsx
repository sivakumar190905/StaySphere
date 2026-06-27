import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, FileText, CheckCircle, XCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  date: string;
  details: string;
}

const mockLogs: AuditLog[] = [
  { id: 'LOG-001', action: 'Partner Approved', user: 'Admin User', date: '2026-06-24 14:32:00', details: 'Approved partner application for John Doe' },
  { id: 'LOG-002', action: 'Hotel Approved', user: 'Admin User', date: '2026-06-24 15:45:22', details: 'Approved hotel "Grand Plaza"' },
  { id: 'LOG-003', action: 'Refund Issued', user: 'Admin User', date: '2026-06-23 09:12:05', details: 'Issued refund for TXN-002' },
  { id: 'LOG-004', action: 'User Suspended', user: 'Admin User', date: '2026-06-22 11:20:10', details: 'Suspended user ID 45 due to policy violation' },
  { id: 'LOG-005', action: 'Review Deleted', user: 'Admin User', date: '2026-06-21 16:05:44', details: 'Deleted spam review on hotel "Seaside Resort"' },
];

export const AuditLogsTab: React.FC = () => {
  const [logs] = useState(mockLogs);

  const getIconForAction = (action: string) => {
    if (action.includes('Approved')) return <CheckCircle size={14} className="text-emerald-500" />;
    if (action.includes('Deleted') || action.includes('Suspended')) return <XCircle size={14} className="text-red-500" />;
    if (action.includes('Refund')) return <FileText size={14} className="text-amber-500" />;
    return <Shield size={14} className="text-blue-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Audit Logs</h2>
        <p className="text-slate-500 text-xs mt-2">Track administrative actions across the platform.</p>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
              <th className="py-3 px-4">Log ID</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Admin User</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-slate-650">
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Database size={14} className="text-slate-400" />
                  {log.id}
                </td>
                <td className="py-3 px-4">{log.date}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {getIconForAction(log.action)}
                    <span className="font-bold">{log.action}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{log.user}</td>
                <td className="py-3 px-4 text-slate-500">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

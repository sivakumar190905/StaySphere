import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: 'COMPLETED' | 'REFUND_PENDING' | 'REFUNDED' | 'FAILED';
  date: string;
}

const mockPayments: Payment[] = [
  { id: 'TXN-001', amount: 450.0, method: 'Credit Card', status: 'COMPLETED', date: '2026-06-24' },
  { id: 'TXN-002', amount: 1200.0, method: 'PayPal', status: 'REFUND_PENDING', date: '2026-06-23' },
  { id: 'TXN-003', amount: 350.0, method: 'Debit Card', status: 'COMPLETED', date: '2026-06-23' },
  { id: 'TXN-004', amount: 800.0, method: 'Credit Card', status: 'REFUNDED', date: '2026-06-22' },
];

export const PaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState(mockPayments);

  const handleRefund = (id: string, action: 'approve' | 'reject') => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, status: action === 'approve' ? 'REFUNDED' : 'COMPLETED' };
        }
        return p;
      })
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Payment Management</h2>
        <p className="text-slate-500 text-xs mt-2">Manage transactions and process refunds.</p>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-slate-650">
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900">{p.id}</td>
                <td className="py-3 px-4">{p.date}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">${p.amount.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={14} className="text-slate-400" />
                    {p.method}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold ${
                      p.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : p.status === 'REFUND_PENDING'
                        ? 'bg-amber-50 text-amber-600'
                        : p.status === 'REFUNDED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {p.status === 'REFUND_PENDING' && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRefund(p.id, 'approve')}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border-none cursor-pointer"
                        title="Approve Refund"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleRefund(p.id, 'reject')}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border-none cursor-pointer"
                        title="Reject Refund"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

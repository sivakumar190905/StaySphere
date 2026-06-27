import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, RefreshCw } from 'lucide-react';

interface Invoice {
  id: string;
  customerName: string;
  hotelName: string;
  amount: number;
  date: string;
}

const mockInvoices: Invoice[] = [
  { id: 'INV-2026-00001', customerName: 'Alice Johnson', hotelName: 'Grand Plaza', amount: 450.0, date: '2026-06-24' },
  { id: 'INV-2026-00002', customerName: 'Bob Smith', hotelName: 'Seaside Resort', amount: 1200.0, date: '2026-06-23' },
  { id: 'INV-2026-00003', customerName: 'Charlie Davis', hotelName: 'Mountain Retreat', amount: 350.0, date: '2026-06-23' },
];

export const InvoicesTab: React.FC = () => {
  const [invoices] = useState(mockInvoices);

  const handleAction = (action: string, id: string) => {
    alert(`Action: ${action} on invoice ${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Invoice Management</h2>
        <p className="text-slate-500 text-xs mt-2">View, download, and regenerate customer invoices.</p>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
              <th className="py-3 px-4">Invoice ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Hotel</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-slate-650">
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  {inv.id}
                </td>
                <td className="py-3 px-4">{inv.date}</td>
                <td className="py-3 px-4">{inv.customerName}</td>
                <td className="py-3 px-4">{inv.hotelName}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">${inv.amount.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleAction('View', inv.id)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border-none cursor-pointer"
                      title="View Invoice"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleAction('Download', inv.id)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border-none cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleAction('Regenerate', inv.id)}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors border-none cursor-pointer"
                      title="Regenerate Invoice"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../store/AppContext';
import { Calendar, User, Home, Tag } from 'lucide-react';

export const AdminBookingsTab: React.FC = () => {
  const { bookings } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Global Booking Logs</h2>
        <p className="text-slate-500 text-xs mt-2">Monitor all bookings across the platform.</p>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
              <th className="py-3 px-4">Booking ID</th>
              <th className="py-3 px-4">Guest</th>
              <th className="py-3 px-4">Hotel & Room</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="font-semibold text-slate-650">
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <Tag size={14} className="text-blue-500" />
                  {booking.id.substring(0, 8).toUpperCase()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    {booking.guestDetails.fullName}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Home size={14} className="text-slate-400" />
                    {booking.hotelName} - {booking.roomName}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(booking.checkIn).toLocaleDateString()} to {new Date(booking.checkOut).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold ${
                      booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold text-sm">
                  No bookings found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

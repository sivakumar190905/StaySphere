import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Home, Users } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const RoomsTab: React.FC = () => {
  const { hotels } = useApp();
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotels[0]?.id || '');

  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Room Management</h2>
          <p className="text-slate-500 text-xs mt-2">Manage room categories, pricing, and availability.</p>
        </div>
        <button className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 border-none cursor-pointer">
          <Plus size={16} />
          Add Room Category
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <label className="text-sm font-bold text-slate-700">Select Property:</label>
        <select
          value={selectedHotelId}
          onChange={(e) => setSelectedHotelId(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {selectedHotel ? (
        <div className="grid gap-4">
          {selectedHotel.rooms.map((room) => (
            <div key={room.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
                  <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{room.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1"><Home size={12} /> {room.type}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> Up to {room.capacity.guests} guests</span>
                    <span className="text-emerald-600 font-bold">${room.price}/night</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-500 rounded-lg transition-colors border-none cursor-pointer bg-transparent">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors border-none cursor-pointer bg-transparent">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {selectedHotel.rooms.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8 font-semibold">No rooms added to this property yet.</p>
          )}
        </div>
      ) : (
        <p className="text-center text-slate-400 text-sm py-8 font-semibold">Please select a property to manage its rooms.</p>
      )}
    </motion.div>
  );
};

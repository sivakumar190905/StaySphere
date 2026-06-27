import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';

export const ReviewsTab: React.FC = () => {
  const [reviews] = useState([
    { id: 1, guest: 'Sarah M.', rating: 5, date: '2026-06-20', text: 'Amazing stay! The room was spotless and the staff was incredibly helpful.' },
    { id: 2, guest: 'David L.', rating: 4, date: '2026-06-18', text: 'Great location and amenities. Breakfast could be improved.' },
    { id: 3, guest: 'Emma R.', rating: 5, date: '2026-06-15', text: 'Exceeded all expectations. We will definitely be back!' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Guest Reviews</h2>
          <p className="text-slate-500 text-xs mt-2">Monitor and respond to guest feedback.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {review.guest.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{review.guest}</h4>
                  <p className="text-[10px] font-semibold text-slate-400">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-600 text-sm">{review.text}</p>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
              <button className="text-blue-500 hover:text-blue-600 font-bold text-xs flex items-center gap-1 border-none bg-transparent cursor-pointer">
                <MessageSquare size={14} />
                Reply to Guest
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, User, ArrowRight } from 'lucide-react';

export const CommandSearch: React.FC = () => {
  const navigate = useNavigate();
  const { hotels } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Monitor toggle trigger (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Command Search Items
  const searchItems = useMemo(() => {
    const list: {
      id: string;
      title: string;
      subtitle: string;
      category: 'Destinations' | 'Hotels' | 'System Panels';
      path: string;
      icon: React.ReactNode;
      state?: any;
    }[] = [
      // Shortcuts
      { id: 'sh-home', title: 'Home', subtitle: 'Return to public homepage', category: 'System Panels', path: '/', icon: <Building size={14} className="text-slate-400" /> },
      { id: 'sh-dashboard', title: 'My Guest Dashboard', subtitle: 'View bookings and wishlist profile', category: 'System Panels', path: '/dashboard', icon: <User size={14} className="text-slate-400" /> },
    ];

    // Unique Cities / Destinations
    const cities = Array.from(new Set(hotels.map((h) => h.city)));
    cities.forEach((city) => {
      list.push({
        id: `city-${city.toLowerCase()}`,
        title: city,
        subtitle: 'Explore hotels in this destination',
        category: 'Destinations',
        path: `/hotels`,
        state: { cityQuery: city },
        icon: <MapPin size={14} className="text-emerald-500" />,
      });
    });

    // Hotel Names
    hotels.forEach((hotel) => {
      list.push({
        id: `hotel-${hotel.id}`,
        title: hotel.name,
        subtitle: `${hotel.city}, ${hotel.country} • ${hotel.stars} Star Property`,
        category: 'Hotels',
        path: `/hotel/${hotel.id}`,
        icon: <Building size={14} className="text-blue-500" />,
      });
    });

    return list;
  }, [hotels]);

  // Filter Items based on query text
  const filteredItems = useMemo(() => {
    if (!query.trim()) return searchItems.slice(0, 8); // top defaults
    const q = query.toLowerCase();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchItems, query]);

  // Reset index when search filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle item activation
  const handleSelect = (item: typeof searchItems[0]) => {
    setIsOpen(false);
    if (item.state) {
      navigate(item.path, { state: item.state });
    } else {
      navigate(item.path);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <>
      {/* Global Shortcut Keyboard Trigger Icon Floating in Bottom Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-45 bg-[#0B1437] text-slate-100 p-3.5 rounded-full hover:bg-brand-500 hover:scale-105 hover:shadow-lg transition-all border-none cursor-pointer flex items-center justify-center shadow-md shadow-slate-900/10"
        title="Open Command Search (Ctrl+K)"
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-60 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Spotlight Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden font-inter text-xs flex flex-col max-h-[60vh]"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 relative">
                <Search size={18} className="text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search destinations, properties, or system panels... (e.g. Goa, Staff)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-slate-800 font-semibold text-sm placeholder-slate-400 bg-transparent border-none focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 border border-slate-200 rounded-lg px-2 py-0.5 bg-slate-50 font-bold hidden sm:inline">
                  ESC
                </span>
              </div>

              {/* Suggestions List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar max-h-[40vh]">
                {filteredItems.length > 0 ? (
                  <div className="space-y-1">
                    {filteredItems.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                            isSelected ? 'bg-slate-50 text-slate-900' : 'text-slate-600 bg-transparent'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-white text-slate-850 shadow-xxs' : 'bg-slate-50 text-slate-450'
                          }`}>
                            {item.icon}
                          </div>
                          
                          <div className="flex-1 text-left min-w-0">
                            <span className="font-extrabold text-[13px] block truncate">{item.title}</span>
                            <span className={`text-[10px] font-bold block mt-0.5 truncate ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                              {item.subtitle}
                            </span>
                          </div>

                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            item.category === 'Destinations' ? 'bg-emerald-50 text-emerald-700' :
                            item.category === 'Hotels' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {item.category}
                          </span>

                          {isSelected && <ArrowRight size={14} className="text-slate-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-bold">
                    No matching results found for "{query}"
                  </div>
                )}
              </div>

              {/* Search Info Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <div className="flex gap-4">
                  <span>↑↓ Navigate</span>
                  <span>Enter Select</span>
                </div>
                <span>Cmd+K Toggle</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

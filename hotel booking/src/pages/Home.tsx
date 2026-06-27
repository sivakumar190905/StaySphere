import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Search, MapPin, Calendar, Users, Star, Award, ShieldCheck, ChevronRight, Sparkles, Smartphone, Heart, Compass, CheckCircle2, BadgePercent, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const Home: React.FC = () => {
  const { setSearchParams, hotels, favorites, toggleFavorite } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    hotelsCount: 200,
    citiesCount: 20,
    roomsCount: 2000,
    bookingsCount: 1500
  });

  useEffect(() => {
    api.stats.get()
      .then(data => {
        setStats({
          hotelsCount: data.hotelsCount || 200,
          citiesCount: data.citiesCount || 20,
          roomsCount: data.roomsCount || 2000,
          bookingsCount: data.bookingsCount || 1500
        });
      })
      .catch(err => {
        console.error("Failed to fetch stats, using fallbacks", err);
      });
  }, []);

  // 1. Hero Background Carousel Images
  const heroImages = [
    { title: 'The Leela Palace Udaipur', src: '/images/hero/hero1.jpg' },
    { title: 'Taj Lake Palace Udaipur', src: '/images/hero/hero1.jpg' },
    { title: 'Taj Exotica Goa', src: '/images/hero/hero3.jpg' },
    { title: 'ITC Grand Chola Chennai', src: '/images/hero/hero4.jpg' },
    { title: 'Taj Falaknuma Palace Hyderabad', src: '/images/hero/hero5.jpg' },
    { title: 'Kumarakom Lake Resort Kerala', src: '/images/hero/hero6.jpg' }
  ];
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 2. Search box states
  const [dest, setDest] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Smart Search Suggestion state
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mock search suggestions catalog
  const popularSearches = ['Goa', 'Udaipur', 'Jaipur', 'Manali', 'Pondicherry', 'Ooty'];
  const smartTags = [
    { label: 'Luxury Hotels in Goa', destination: 'Goa', tag: 'Luxury Stay' },
    { label: 'Beach Resorts in Goa', destination: 'Goa', tag: 'Free Cancellation' },
    { label: 'Pool Villas in Udaipur', destination: 'Udaipur', tag: 'Luxury Stay' },
    { label: 'Heritage Stays in Jaipur', destination: 'Jaipur', tag: 'Luxury Stay' }
  ];
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('staysphere_recent_searches');
    return saved ? JSON.parse(saved) : ['Udaipur', 'Goa', 'Bangalore'];
  });

  // Filter dynamic lists on typing
  const filteredSuggestions = dest.trim().length > 0 
    ? popularSearches.filter(c => c.toLowerCase().includes(dest.toLowerCase()))
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q !== query);
      const next = [query, ...filtered].slice(0, 5);
      localStorage.setItem('staysphere_recent_searches', JSON.stringify(next));
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRecentSearch(dest);
    setSearchParams({
      destination: dest,
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests,
      rooms,
    });
    navigate(`/search?destination=${dest}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`);
  };

  const handleSuggestionClick = (cityName: string) => {
    setDest(cityName);
    setSearchFocused(false);
  };

  const handleSmartTagClick = (tagInfo: typeof smartTags[0]) => {
    setDest(tagInfo.destination);
    setSearchFocused(false);
    saveRecentSearch(tagInfo.destination);
    setSearchParams({
      destination: tagInfo.destination,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: 2,
      rooms: 1
    });
    navigate(`/search?destination=${tagInfo.destination}&stars=5&sortBy=rating`);
  };

  // 3. Category filter for Recommended Grid
  const [activeTab, setActiveTab] = useState<'recommended' | 'beach' | 'palace' | 'mountain' | 'business'>('recommended');
  
  const filteredHotels = React.useMemo(() => {
    if (activeTab === 'beach') {
      return hotels.filter(h => ['Goa', 'Pondicherry', 'Vizag'].includes(h.city)).slice(0, 6);
    }
    if (activeTab === 'palace') {
      return hotels.filter(h => ['Udaipur', 'Jaipur', 'Mysore'].includes(h.city)).slice(0, 6);
    }
    if (activeTab === 'mountain') {
      return hotels.filter(h => ['Manali', 'Ooty', 'Kodaikanal'].includes(h.city)).slice(0, 6);
    }
    if (activeTab === 'business') {
      return hotels.filter(h => ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'].includes(h.city)).slice(0, 6);
    }
    // Default: Featured Recommended
    return hotels.filter(h => h.featured).slice(0, 6);
  }, [hotels, activeTab]);

  // Testimonials list
  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Elite Member', rating: 5, avatar: '/images/users/user1.jpg', comment: 'StaySphere made our family anniversary in Udaipur flawless. The room details matched reality 100%, and the priority butler support was spectacular.' },
    { name: 'Karan Malhotra', role: 'Business Traveler', rating: 5, avatar: '/images/users/user2.jpg', comment: 'Dynamic pricing allowed us to book the Executive Suite at Conrad Pune during a monsoon sale at 20% off. The invoicing and checkout was fully digital.' },
    { name: 'Anjali Sharma', role: 'Luxury Explorer', rating: 5, avatar: '/images/users/user3.jpg', comment: 'The hotel comparison tool is a lifesaver! I was able to compare Taj Exotica and The Leela Goa side-by-side on room rates and select the perfect pool villa.' }
  ];

  // Popular Destinations Grid
  const popularDestinations = [
    { name: 'Goa', count: 10, image: '/images/cities/goa.jpg' },
    { name: 'Udaipur', count: 10, image: '/images/cities/mumbai.jpg' },
    { name: 'Jaipur', count: 10, image: '/images/cities/delhi.jpg' },
    { name: 'Manali', count: 10, image: '/images/cities/manali.jpg' },
    { name: 'Pondicherry', count: 10, image: '/images/cities/chennai.jpg' },
    { name: 'Ooty', count: 10, image: '/images/cities/mysore.jpg' }
  ];

  const handleDestClick = (cityName: string) => {
    saveRecentSearch(cityName);
    setSearchParams({
      destination: cityName,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guests: 2,
      rooms: 1,
    });
    navigate(`/search?destination=${cityName}`);
  };

  // Local hash scroll hook
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  return (
    <div className="space-y-20 pb-20 bg-[#F8FAFC]">
      {/* 1. HERO SECTION WITH IMAGE CAROUSEL & STATS */}
      <section className="relative h-[720px] flex flex-col justify-center text-white overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroIdx}
              src={heroImages[heroIdx].src}
              alt={heroImages[heroIdx].title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Dark Slate Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#D4A017] text-xxs font-extrabold tracking-widest uppercase backdrop-blur-md"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Welcome to StaySphere Elite Escapes</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white m-0 font-serif leading-tight"
          >
            Find Your Next <br />
            <span className="bg-gradient-to-r from-blue-350 via-indigo-200 to-amber-200 bg-clip-text text-transparent italic">
              Luxury Indian Escape
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm md:text-md text-slate-200 max-w-xl mx-auto font-medium tracking-wide"
          >
            Explore handpicked heritage palaces, beachfront villas, and elite mountain sanctuaries.
          </motion.p>

          {/* 2. FLOATING SEARCH WIDGET WITH SMART SUGGESTIONS */}
          <div ref={searchContainerRef} className="max-w-4xl mx-auto mt-12 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="glass-panel p-4 rounded-3xl md:rounded-full shadow-2xl text-slate-800 flex flex-col md:flex-row gap-3 border border-white/30 bg-white/90"
            >
              {/* Destination & Suggestions */}
              <div className="flex-1 flex items-center gap-3 px-5 py-2 border-b md:border-b-0 md:border-r border-slate-100 relative">
                <MapPin className="text-[#2563EB] shrink-0" size={20} />
                <div className="text-left w-full">
                  <label className="block text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Where are you going?"
                    value={dest}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setDest(e.target.value)}
                    className="bg-transparent text-sm font-semibold w-full text-slate-800 placeholder-slate-400 focus:outline-none mt-0.5"
                  />
                </div>

                {/* Suggestions Overlay */}
                {searchFocused && (
                  <div className="absolute left-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl p-4 border border-slate-100 z-50 text-slate-800 space-y-4">
                    {/* Typed matching suggestions */}
                    {dest.trim().length > 0 && filteredSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Matching Locations</span>
                        {filteredSuggestions.map(cityName => (
                          <button
                            key={cityName}
                            type="button"
                            onClick={() => handleSuggestionClick(cityName)}
                            className="w-full text-left py-1 px-2 rounded-lg hover:bg-slate-50 text-xs font-bold flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            <MapPin size={12} className="text-[#2563EB]" />
                            <span>{cityName}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Smart query tags */}
                    <div className="space-y-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Smart Suggestions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {smartTags.map(tag => (
                          <button
                            key={tag.label}
                            type="button"
                            onClick={() => handleSmartTagClick(tag)}
                            className="bg-slate-50 hover:bg-blue-50 hover:text-[#2563EB] text-slate-600 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-slate-200/50 transition-colors cursor-pointer"
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Recent Searches</span>
                        {recentSearches.map(q => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => handleSuggestionClick(q)}
                            className="w-full text-left py-1 px-2 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            <Compass size={12} className="text-slate-400" />
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Check-In */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
                <Calendar className="text-[#2563EB] shrink-0" size={20} />
                <div className="text-left w-full">
                  <label className="block text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Check-In</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-transparent text-sm font-semibold w-full text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Check-Out */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
                <Calendar className="text-[#2563EB] shrink-0" size={20} />
                <div className="text-left w-full">
                  <label className="block text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="bg-transparent text-sm font-semibold w-full text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Guests */}
              <div
                className="relative flex-1 flex items-center gap-3 px-4 py-2 cursor-pointer"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              >
                <Users className="text-[#2563EB] shrink-0" size={20} />
                <div className="text-left w-full">
                  <label className="block text-xxs font-extrabold text-slate-400 uppercase tracking-widest">Guests</label>
                  <span className="text-sm font-semibold text-slate-800">
                    {guests} Guests, {rooms} Room
                  </span>
                </div>

                {showGuestDropdown && (
                  <div
                    className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl p-4 border border-slate-100 z-50 text-slate-800 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">Guests</p>
                        <p className="text-xs text-slate-400">Adults & children</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold"
                        >
                          -
                        </button>
                        <span className="font-semibold text-sm">{guests}</span>
                        <button
                          type="button"
                          onClick={() => setGuests(guests + 1)}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold">Rooms</p>
                        <p className="text-xs text-slate-400">Total rooms needed</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold"
                        >
                          -
                        </button>
                        <span className="font-semibold text-sm">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(rooms + 1)}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowGuestDropdown(false)}
                      className="w-full bg-[#2563EB] text-white rounded-xl py-2 text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                      Apply Configuration
                    </button>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-blue-600 text-white md:w-14 md:h-14 w-full py-3 md:py-0 rounded-xl md:rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all font-semibold md:font-normal gap-2 shrink-0 cursor-pointer border-none"
              >
                <Search size={20} />
                <span className="md:hidden">Search Accommodations</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. HERO STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block">Global Accommodations</span>
            <p className="text-4xl font-black text-slate-900 m-0">{stats.hotelsCount}</p>
            <p className="text-xs font-medium text-slate-500">Premium hotels and homestays</p>
          </div>
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block">Indian Cities</span>
            <p className="text-4xl font-black text-[#2563EB] m-0">{stats.citiesCount}</p>
            <p className="text-xs font-medium text-slate-500">From metro cities to hill stations</p>
          </div>
          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block">Satisfied Travelers</span>
            <p className="text-4xl font-black text-[#D4A017] m-0">{stats.bookingsCount}+</p>
            <p className="text-xs font-medium text-slate-500">Happy guest check-ins logged</p>
          </div>
        </div>
      </section>

      {/* 4. POPULAR DESTINATIONS GRID */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 m-0">Explore Popular Destinations</h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">Trending spots highly rated by StaySphere guests this month.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularDestinations.map((dest) => (
            <div
              key={dest.name}
              onClick={() => handleDestClick(dest.name)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-slate-100 hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-left">
                <h3 className="font-extrabold text-md m-0">{dest.name}</h3>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">{dest.count} Properties</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ELITE MEMBERSHIP PLATFORM BANNER */}
      <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F172A] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="space-y-4 max-w-xl text-left">
            <span className="text-[#D4A017] text-xs font-extrabold uppercase tracking-widest block">
              StaySphere Elite Club
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-white m-0">
              Save up to 15% on member exclusive rates
            </h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              Unlock prioritized concierge check-ins, early room auto-assignments, complimentary spa voucher codes, and rewards on every booking.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button 
                onClick={() => navigate('/signup')}
                className="bg-[#D4A017] hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-md text-xs border-none cursor-pointer"
              >
                Join for Free
              </button>
              <button 
                onClick={() => handleDestClick('')}
                className="border border-white/20 hover:bg-white/10 text-white font-extrabold px-6 py-3 rounded-xl transition-all text-xs bg-transparent cursor-pointer"
              >
                Explore Benefits
              </button>
            </div>
          </div>

          {/* Side features list */}
          <div className="w-full md:w-80 space-y-4 text-left border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0 md:pl-8 shrink-0">
            {[
              { title: 'Extra Member Discounts', desc: 'Direct savings on suites & luxury pool villas.' },
              { title: 'Priority Support Desk', desc: '24/7 priority concierge escalation lines.' },
              { title: 'Flexible Cancellation', desc: 'Worry-free booking updates on select rooms.' }
            ].map((perk, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center shrink-0 text-[#D4A017]">
                  <BadgePercent size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white m-0 leading-none">{perk.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED LUXURY COLLECTION & DYNAMIC CATEGORY FILTER */}
      <section id="hotels" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="text-left">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 m-0">Featured Hospitality Collections</h2>
            <p className="text-slate-500 text-sm font-semibold mt-1">Curated boutique properties with top guest review scores.</p>
          </div>
          
          {/* Dynamic selector category tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 text-[10px] font-extrabold uppercase overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: 'recommended', label: 'Recommended' },
              { id: 'beach', label: 'Beach Resorts' },
              { id: 'palace', label: 'Heritage Palaces' },
              { id: 'mountain', label: 'Mountain Retreats' },
              { id: 'business', label: 'Business Stays' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg transition-all shrink-0 border-none cursor-pointer tracking-wider ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#2563EB] shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            const hasFavorite = favorites.includes(hotel.id);
            return (
              <motion.div
                key={hotel.id}
                layout
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-100 flex flex-col justify-between"
              >
                {/* Hotel Image & Favorite Tag */}
                <div className="relative h-56 w-full">
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                  {hotel.tag && (
                    <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {hotel.tag}
                    </span>
                  )}
                  <button
                    onClick={() => toggleFavorite(hotel.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-sm border-none cursor-pointer"
                  >
                    <Heart size={16} className={hasFavorite ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                </div>

                {/* Hotel Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <MapPin size={12} />
                      <span>{hotel.city}, {hotel.country}</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-900 m-0 line-clamp-1 leading-snug">{hotel.name}</h3>

                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < hotel.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                      <span className="text-slate-200 text-xs">|</span>
                      <span className="bg-blue-50 text-[#2563EB] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        {hotel.rating} Excellent
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-xxs font-bold uppercase tracking-wider block">Rates from</span>
                      <p className="text-xl font-extrabold text-slate-900 m-0">
                        ₹{hotel.basePrice.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-medium text-slate-400">/ night</span>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                      className="bg-slate-900 hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border-none cursor-pointer flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 7. WHY CHOOSE STATESPHERE */}
      <section id="support" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 pt-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 m-0">Why Book With StaySphere</h2>
          <p className="text-slate-500 text-sm font-semibold">Your premium security and satisfaction guaranteed at every booking step.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
          {[
            { title: 'Best Price Guarantee', desc: 'Found it cheaper elsewhere? We match the rates and refund the difference with no questions asked.', icon: <Award className="text-amber-600" size={20} /> },
            { title: 'Verified Premium Properties', desc: 'EveryListed hotel is physically audited and monitored to guarantee premium bedding, clean linen, and hygiene.', icon: <CheckCircle2 className="text-[#2563EB]" size={20} /> },
            { title: 'Secure Encrypted Payments', desc: 'Fully encrypted secure payment rails supporting credit/debit cards, UPI apps, and flexible cancellation holds.', icon: <ShieldCheck className="text-emerald-600" size={20} /> }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 text-left p-6 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 m-0">{item.title}</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7.5. LUXURY EXPERIENCES */}
      <section id="experiences" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 m-0">Signature StaySphere Experiences</h2>
          <p className="text-slate-550 text-sm font-semibold">Curated activities to make your stay unforgettable.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {[
            {
              title: "Spa & Wellness",
              desc: "Rejuvenate your body and mind with signature treatments, ayurvedic therapies, and holistic yoga guides.",
              image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
              tag: "Holistic Health"
            },
            {
              title: "Adventure & Safaris",
              desc: "Embark on guided forest hikes, high-altitude mountain treks, or sand dune desert safaris with local trackers.",
              image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
              tag: "Thrilling Escapes"
            },
            {
              title: "Cultural Heritage Tours",
              desc: "Private guided walks through architectural palaces, historic forts, and traditional handicraft communities.",
              image: "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=400&q=80",
              tag: "Royal Traditions"
            },
            {
              title: "Fine Dining Masterclasses",
              desc: "Gastronomic journeys featuring curations by Michelin chefs, regional wine tastings, and royal cookery sessions.",
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
              tag: "Culinary Arts"
            }
          ].map((exp, i) => (
            <div key={i} className="group relative h-80 rounded-2xl overflow-hidden shadow-md border border-slate-105 hover:-translate-y-1 transition-all duration-300">
              <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {exp.tag}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                <h3 className="font-extrabold text-md m-0">{exp.title}</h3>
                <p className="text-[11px] text-slate-300 mt-1 font-semibold leading-relaxed line-clamp-2">{exp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section id="testimonials" className="bg-white py-16 border-y border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black text-slate-900 m-0">What Our Guests Say</h2>
            <p className="text-slate-500 text-sm font-semibold">Over 1,000,000 travelers booked their dream stays on StaySphere.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs m-0">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 block">{t.role}</span>
                  </div>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(t.rating)].map((_, idx) => <Star key={idx} size={12} className="fill-amber-400" />)}
                </div>
                <p className="text-slate-600 text-xs italic font-medium leading-relaxed">"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. DOWNLOAD MOBILE APP SECTION */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#0F172A] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 text-left">
          <div className="space-y-4 max-w-lg">
            <span className="text-[#D4A017] text-xs font-extrabold uppercase tracking-widest block">StaySphere Mobile</span>
            <h2 className="text-3xl font-black m-0">Download the StaySphere App</h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Book hotel rooms 2x faster, secure live check-in QR codes, track room allocations on a visual progress timeline, and receive instant housekeeping updates.
            </p>
            <div className="flex gap-3.5 pt-2">
              <button className="flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all text-xs bg-transparent cursor-pointer">
                <Smartphone size={14} /> App Store
              </button>
              <button className="flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all text-xs bg-transparent cursor-pointer">
                <Smartphone size={14} /> Google Play
              </button>
            </div>
          </div>

          {/* Interactive Mock Frame Layout */}
          <div className="relative shrink-0 w-64 h-52 bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col justify-between text-slate-100 font-jakarta text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black text-white">StaySphere Client</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">Upcoming Reservation</p>
              <h4 className="text-xs font-extrabold leading-tight m-0 text-white">The Leela Palace</h4>
              <span className="text-[9px] text-[#D4A017] font-extrabold">Room 302 • Confirmed</span>
            </div>
            <div className="bg-[#2563EB] hover:bg-blue-600 rounded-lg py-1.5 text-center text-[9px] font-extrabold cursor-pointer transition-colors text-white">
              Open QR Code
            </div>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER SIGNUP SECTION */}
      <section className="max-w-3xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900 m-0">Subscribe to Our Newsletter</h2>
        <p className="text-slate-500 text-xs font-semibold">Get premium deal vouchers, seasonal sale codes, and luxury destination catalog tips.</p>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!'); }}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
        >
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="flex-grow border border-slate-200 rounded-xl px-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Subscribe</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </section>
    </div>
  );
};
export default Home;

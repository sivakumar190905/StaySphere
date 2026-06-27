import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Hotel } from '../services/mockData';
import { MapPin, Star, Filter, ArrowUpDown, ChevronRight, SlidersHorizontal, Search, Calendar, Users, HelpCircle, X, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast';

export const SearchResults: React.FC = () => {
  const { hotels, searchParams, setSearchParams } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL search parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const sanitize = (val: any) => {
    if (!val || val === 'undefined' || val === 'null') return '';
    return val;
  };

  // Read initial values
  const initialDest = sanitize(queryParams.get('destination') ?? searchParams.destination ?? '');
  const initialCheckIn = sanitize(queryParams.get('checkIn') ?? searchParams.checkIn ?? '');
  const initialCheckOut = sanitize(queryParams.get('checkOut') ?? searchParams.checkOut ?? '');
  const initialGuests = Number(queryParams.get('guests')) || searchParams.guests || 2;
  const initialPriceMax = Number(queryParams.get('priceMax')) || 500000;
  
  const initialStars = useMemo(() => {
    const s = queryParams.get('stars');
    return s ? s.split(',').map(Number).filter(n => !isNaN(n)) : [];
  }, [queryParams]);

  const initialAmenities = useMemo(() => {
    const a = queryParams.get('amenities');
    return a ? a.split(',').filter(Boolean) : [];
  }, [queryParams]);

  const initialSortBy = (queryParams.get('sortBy') as any) || 'popularity';

  // Local States
  const [dest, setDest] = useState(initialDest);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const [priceMax, setPriceMax] = useState<number>(initialPriceMax);
  const [starFilters, setStarFilters] = useState<number[]>(initialStars);
  const [amenityFilters, setAmenityFilters] = useState<string[]>(initialAmenities);
  const [sortBy, setSortBy] = useState<'popularity' | 'priceAsc' | 'priceDesc' | 'rating'>(initialSortBy);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Comparison State
  const [comparedHotels, setComparedHotels] = useState<Hotel[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Sync state with URL updates
  useEffect(() => {
    const qParams = new URLSearchParams(location.search);
    const urlDest = qParams.get('destination') ?? '';
    const urlCheckIn = qParams.get('checkIn') ?? '';
    const urlCheckOut = qParams.get('checkOut') ?? '';
    const urlGuests = Number(qParams.get('guests')) || 2;
    const urlRooms = Number(qParams.get('rooms')) || 1;
    const urlPriceMax = Number(qParams.get('priceMax')) || 500000;
    
    const starsVal = qParams.get('stars');
    const urlStars = starsVal ? starsVal.split(',').map(Number).filter(n => !isNaN(n)) : [];

    const aVal = qParams.get('amenities');
    const urlAmenities = aVal ? aVal.split(',').filter(Boolean) : [];

    const urlSortBy = (qParams.get('sortBy') as any) || 'popularity';

    setDest(urlDest);
    setCheckIn(urlCheckIn);
    setCheckOut(urlCheckOut);
    setGuests(urlGuests);
    setPriceMax(urlPriceMax);
    setStarFilters(urlStars);
    setAmenityFilters(urlAmenities);
    setSortBy(urlSortBy);

    setSearchParams({
      destination: urlDest,
      checkIn: urlCheckIn,
      checkOut: urlCheckOut,
      guests: urlGuests,
      rooms: urlRooms,
    });
  }, [location.search]);

  // Sync local changes to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (dest) params.set('destination', dest);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', String(guests));
    params.set('rooms', String(searchParams.rooms || 1));
    params.set('priceMax', String(priceMax));
    
    if (starFilters.length > 0) params.set('stars', starFilters.join(','));
    if (amenityFilters.length > 0) params.set('amenities', amenityFilters.join(','));
    params.set('sortBy', sortBy);

    const aiQ = queryParams.get('aiQuery');
    if (aiQ) params.set('aiQuery', aiQ);

    navigate({ search: params.toString() }, { replace: true });
  }, [dest, checkIn, checkOut, guests, priceMax, starFilters, amenityFilters, sortBy]);

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach(h => h.amenities.forEach(a => set.add(a)));
    return Array.from(set);
  }, [hotels]);

  const handleModifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      destination: dest,
      checkIn,
      checkOut,
      guests,
      rooms: searchParams.rooms || 1
    });
  };

  const toggleStarFilter = (stars: number) => {
    setStarFilters(prev =>
      prev.includes(stars) ? prev.filter(s => s !== stars) : [...prev, stars]
    );
  };

  const toggleAmenityFilter = (amenity: string) => {
    setAmenityFilters(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setPriceMax(500000);
    setStarFilters([]);
    setAmenityFilters([]);
  };

  const handleCompareCheckboxChange = (hotel: Hotel, checked: boolean) => {
    if (checked) {
      if (comparedHotels.length >= 3) {
        toast.warning('You can compare a maximum of 3 hotels side-by-side.');
        return;
      }
      setComparedHotels(prev => [...prev, hotel]);
    } else {
      setComparedHotels(prev => prev.filter(h => h.id !== hotel.id));
    }
  };

  const filteredAndSortedHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        if (searchParams.destination) {
          const query = searchParams.destination.toLowerCase();
          const matchesDest =
            hotel.city.toLowerCase().includes(query) ||
            hotel.country.toLowerCase().includes(query) ||
            hotel.name.toLowerCase().includes(query);
          if (!matchesDest) return false;
        }

        if (hotel.basePrice > priceMax) return false;
        if (starFilters.length > 0 && !starFilters.includes(hotel.stars)) return false;

        if (amenityFilters.length > 0) {
          const hasAll = amenityFilters.every((a) => hotel.amenities.includes(a));
          if (!hasAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popularity') {
          return b.reviewCount - a.reviewCount;
        }
        if (sortBy === 'priceAsc') {
          return a.basePrice - b.basePrice;
        }
        if (sortBy === 'priceDesc') {
          return b.basePrice - a.basePrice;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [hotels, searchParams, priceMax, starFilters, amenityFilters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search modifier */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleModifySearch} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search state, city, or hotel..."
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none w-full text-slate-800"
            />
          </div>

          <div className="w-[150px] flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none w-full text-slate-800"
            />
          </div>

          <div className="w-[150px] flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none w-full text-slate-800"
            />
          </div>

          <div className="w-[180px] flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Users size={16} className="text-slate-400 shrink-0" />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold focus:outline-none w-full text-slate-800 cursor-pointer border-none"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Guests</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm shrink-0 border-none cursor-pointer"
          >
            Update Search
          </button>
        </form>
      </div>

      {/* Main Results Layout */}
      <div className="flex gap-8 relative">
        {/* Left Filter Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 text-left h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-md flex items-center gap-2 m-0">
              <Filter size={16} /> Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#2563EB] hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">Max Budget per Night</label>
            <input
              type="range"
              min="4000"
              max="250000"
              step="5000"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>₹4,000</span>
              <span className="text-[#2563EB] font-extrabold">₹{priceMax.toLocaleString('en-IN')} max</span>
              <span>₹2,50,000</span>
            </div>
          </div>

          {/* Stars */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">Stars Rating</label>
            <div className="space-y-2">
              {[5, 4, 3].map((starCount) => (
                <label key={starCount} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-650 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={starFilters.includes(starCount)}
                    onChange={() => toggleStarFilter(starCount)}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-350 accent-[#2563EB] cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    {starCount} Stars
                    <span className="flex">
                      {[...Array(starCount)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">Amenities</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-650 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={amenityFilters.includes(amenity)}
                    onChange={() => toggleAmenityFilter(amenity)}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-350 accent-[#2563EB] cursor-pointer"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right side: hotel items */}
        <main className="flex-grow space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4 text-left">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 m-0">
                {filteredAndSortedHotels.length} {filteredAndSortedHotels.length === 1 ? 'hotel' : 'hotels'} in database
              </h2>
              {searchParams.destination && (
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Location matching: "{searchParams.destination}"</p>
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ArrowUpDown size={14} />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-extrabold text-slate-900 border-none outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="popularity">Popularity</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Rating score</option>
                </select>
              </div>
            </div>
          </div>

          {/* List or Custom Empty State */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedHotels.length > 0 ? (
                filteredAndSortedHotels.map((hotel) => {
                  const isCompared = comparedHotels.some(h => h.id === hotel.id);
                  const discountPct = 15; // static premium deal discount for mockups
                  const originalPrice = Math.round(hotel.basePrice * 1.18);
                  const firstRoom = hotel.rooms[0];

                  return (
                    <motion.div
                      key={hotel.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-100/80 flex flex-col md:flex-row text-left transition-shadow"
                    >
                      {/* Image side */}
                      <div className="md:w-80 h-56 md:h-auto relative shrink-0">
                        <img 
                          src={hotel.images[0]} 
                          alt={hotel.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {/* Comparison checkbox */}
                        <div className="absolute top-4 left-4 bg-white/95 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-wider select-none">
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={(e) => handleCompareCheckboxChange(hotel, e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 accent-[#2563EB] cursor-pointer"
                          />
                          <span>Compare</span>
                        </div>

                        {hotel.tag && (
                          <span className="absolute bottom-4 left-4 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                            {hotel.tag}
                          </span>
                        )}
                      </div>

                      {/* Info side */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight leading-snug m-0">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1.5">
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
                                <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                                  <MapPin size={12} />
                                  <span>{hotel.city}, {hotel.country}</span>
                                </div>
                              </div>
                            </div>

                            {/* Score card */}
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-bold text-slate-650 hidden sm:block">Excellent</div>
                                <div className="bg-[#2563EB] text-white font-extrabold text-xs px-2 py-1 rounded-lg">
                                  {hotel.rating}
                                </div>
                              </div>
                              <span className="text-slate-400 text-[10px] font-bold block mt-1">{hotel.reviewCount} reviews</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{hotel.description}</p>
                        </div>

                        {/* Middle info row: Amenities and Availability badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex flex-wrap gap-1">
                            {hotel.amenities.slice(0, 3).map((a) => (
                              <span key={a} className="bg-slate-50 border border-slate-200/50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                {a}
                              </span>
                            ))}
                            {hotel.amenities.length > 3 && (
                              <span className="text-slate-400 text-[10px] font-bold px-1.5 py-0.5">+{hotel.amenities.length - 3} more</span>
                            )}
                          </div>

                          {/* Room left alerts */}
                          <div className="bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md animate-pulse">
                            Only {firstRoom?.availableCount || 3} rooms left!
                          </div>
                        </div>

                        {/* Bottom checkout row */}
                        <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                          <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Free cancellations</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                                {discountPct}% OFF Elite
                              </span>
                              <p className="text-xs text-slate-400 line-through m-0 mt-1">₹{originalPrice.toLocaleString('en-IN')}</p>
                              <p className="text-xl font-extrabold text-slate-900 m-0 mt-0.5">
                                ₹{hotel.basePrice.toLocaleString('en-IN')}{' '}
                                <span className="text-xxs font-medium text-slate-400">/ night</span>
                              </p>
                            </div>
                            <button
                              onClick={() => navigate(`/hotel/${hotel.id}`)}
                              className="bg-slate-900 hover:bg-[#2563EB] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm border-none cursor-pointer flex items-center gap-1"
                            >
                              <span>View Rooms</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                /* TRAVEL EMPTY STATE ILLUSTRATION */
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto my-8"
                >
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 relative">
                    <HelpCircle size={36} className="text-slate-350" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4A017] rounded-full animate-ping" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4A017] rounded-full" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-black text-slate-900 m-0">No Indian Escapes Found</h3>
                    <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed mt-2">
                      We couldn't find any premium stays matching your budget range or amenity filters. Try expanding your maximum budget or clearing some star rating checkmarks.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 justify-center">
                    <button
                      onClick={clearFilters}
                      className="bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm border-none"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => {
                        setPriceMax(500000);
                        setStarFilters([]);
                        setAmenityFilters([]);
                        setDest('');
                      }}
                      className="bg-slate-100 hover:bg-slate-205 text-slate-700 font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer border-none"
                    >
                      Reset Destination
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 8. HOTEL COMPARISON SLIDE-UP DRAWER */}
      {comparedHotels.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#2563EB] shadow-2xl z-50 py-4 px-6 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-left flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <BarChart size={16} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm m-0">Comparison Dashboard</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Comparing {comparedHotels.length} of 3 properties</p>
              </div>
            </div>

            {/* Comparison matrix items */}
            <div className="flex flex-wrap gap-4 flex-grow justify-center max-w-3xl">
              {comparedHotels.map(h => (
                <div key={h.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-3 text-xs w-60 relative group">
                  <button
                    onClick={() => setComparedHotels(prev => prev.filter(hotel => hotel.id !== h.id))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 hover:bg-red-500 text-white flex items-center justify-center text-[10px] shadow-sm border-none cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                  <img src={h.images[0]} alt={h.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="text-left truncate flex-grow">
                    <p className="font-bold text-slate-900 truncate m-0 leading-none">{h.name}</p>
                    <span className="text-[9px] text-[#2563EB] font-black uppercase mt-1.5 block">Starting ₹{h.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Compare Drawer Action Modal Trigger */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsComparisonOpen(true)}
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm border-none cursor-pointer"
              >
                Compare side-by-side
              </button>
              <button
                onClick={() => setComparedHotels([])}
                className="border border-slate-200 hover:bg-slate-50 text-slate-605 font-extrabold text-xs px-4 py-2.5 rounded-xl bg-transparent cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="w-80 bg-white h-full p-6 flex flex-col justify-between"
          >
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-md m-0">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs font-bold text-slate-500 border-none bg-transparent cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Max Budget</label>
                <input
                  type="range"
                  min="4000"
                  max="250000"
                  step="5000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>₹4,000</span>
                  <span className="text-[#2563EB] font-extrabold">₹{priceMax.toLocaleString('en-IN')}</span>
                  <span>₹2,50,000</span>
                </div>
              </div>

              {/* Stars */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Stars</label>
                <div className="space-y-2">
                  {[5, 4, 3].map((starCount) => (
                    <label key={starCount} className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={starFilters.includes(starCount)}
                        onChange={() => toggleStarFilter(starCount)}
                        className="rounded text-[#2563EB] border-slate-350 accent-[#2563EB] cursor-pointer"
                      />
                      <span>{starCount} Stars</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="bg-slate-900 text-white rounded-xl py-3 w-full font-bold text-xs hover:bg-slate-800 border-none cursor-pointer"
            >
              Apply Filter Settings
            </button>
          </motion.div>
        </div>
      )}

      {/* Comparison Details Modal */}
      <AnimatePresence>
        {isComparisonOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComparisonOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl text-left font-inter space-y-6 z-10"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 m-0">StaySphere Property Comparison</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Compare pricing, rating, location and perks side-by-side.</p>
                </div>
                <button
                  onClick={() => setIsComparisonOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg border-none bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Comparison Grid Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comparedHotels.map((h) => (
                  <div key={h.id} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50 p-4 space-y-4">
                    <img src={h.images[0]} alt={h.name} className="w-full h-36 object-cover rounded-xl shadow-xxs" />
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-1">{h.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex text-amber-400">
                          {[...Array(h.stars)].map((_, i) => (
                            <Star key={i} size={11} className="fill-current" />
                          ))}
                        </div>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-slate-450 text-[10px] font-bold">{h.city}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-150 pt-3 text-xs font-semibold text-slate-650">
                      <div className="flex justify-between">
                        <span>Base Rate</span>
                        <span className="text-slate-900 font-extrabold">₹{h.basePrice.toLocaleString('en-IN')} / night</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guest Rating</span>
                        <span className="bg-blue-50 text-[#2563EB] font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                          ★ {h.rating} ({h.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location</span>
                        <span className="text-slate-850 font-bold">{h.city}, {h.country}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-150 pt-3">
                      <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wide block">Included Amenities</span>
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="bg-white border border-slate-200 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsComparisonOpen(false);
                        navigate(`/hotel/${h.id}`);
                      }}
                      className="w-full mt-4 bg-slate-900 hover:bg-[#2563EB] text-white font-extrabold text-xs py-2.5 rounded-xl transition-all border-none cursor-pointer"
                    >
                      Book Rooms
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsComparisonOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border-none cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SearchResults;

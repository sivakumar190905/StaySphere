import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  Calendar, Heart, User, Settings, ArrowRight, XCircle, Trash2, MapPin, 
  LayoutDashboard, Star, Award, CreditCard, Printer, Info, Briefcase, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast';

export const Dashboard: React.FC = () => {
  const { currentUser, bookings, favorites, hotels, cancelBooking, toggleFavorite, guestRequests = [], supportTickets = [], createGuestRequest, createSupportTicket, updateProfile } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, confirm } = useToast();

  const getTabFromPath = (path: string) => {
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/wishlist')) return 'favorites';
    return null;
  };

  // Pick default tab if forwarded via state or derived from route path
  const forwardedState = location.state as { activeTab?: string };
  const [activeTab, setActiveTab] = useState<string>(() => {
    return getTabFromPath(location.pathname) || forwardedState?.activeTab || 'overview';
  });

  React.useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname]);



  // Profile local edit mock states
  const [profileName, setProfileName] = useState(() => {
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Alice Johnson';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    return currentUser ? currentUser.email : 'alice@example.com';
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    return currentUser ? currentUser.phone : '+91 98765 43210';
  });
  const [profileCompany, setProfileCompany] = useState('StaySphere Tech Labs');
  const [profileGSTIN, setProfileGSTIN] = useState('27AAPCG0808PD1ZS');
  const [profileAvatar, setProfileAvatar] = useState(() => {
    return currentUser ? currentUser.avatar || '' : '';
  });

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(`${currentUser.firstName} ${currentUser.lastName}`);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone || '');
      setProfileAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  // Filter bookmarks
  const favoritedHotels = useMemo(() => {
    return hotels.filter((h) => favorites.includes(h.id));
  }, [hotels, favorites]);

  // Split bookings by status
  const upcomingBookings = useMemo(() => bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Room Assigned' || b.status === 'Pending Approval' || b.status === 'Checked-In'), [bookings]);
  const pastBookings = useMemo(() => bookings.filter((b) => b.status === 'Checked-Out'), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === 'Cancelled' || b.status === 'Refunded'), [bookings]);

  // Mock Reviews
  const myReviews = [
    {
      id: 'rev-1',
      hotelName: 'Taj Lands End, Mumbai',
      rating: 5,
      date: '2026-05-15',
      content: 'Absolutely stellar views of the Sea Link. The hospitality is unmatched. Executive Lounge service is worth every rupee.'
    },
    {
      id: 'rev-2',
      hotelName: 'SpiceTree Retreat, Munnar',
      rating: 4,
      date: '2026-04-02',
      content: 'Charming mountain jacuzzi suite with breathtaking tea garden views. Extremely peaceful. Food options could be slightly more diverse.'
    }
  ];

  // Points breakdown
  const pointsEarned = 4250;
  const nextMilestone = 5000;
  const progressPercent = Math.round((pointsEarned / nextMilestone) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 text-left">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit space-y-5">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg bg-gradient-to-tr from-brand-600 to-blue-500 uppercase border border-slate-200">
              {profileName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm leading-none">{profileName}</h3>
            <span className="text-accent-gold-600 text-xxs font-extrabold uppercase tracking-widest block mt-1">Silver Tier Member</span>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <Calendar size={16} />
            <span>My Bookings</span>
            {upcomingBookings.length > 0 && (
              <span className="ml-auto bg-brand-50 text-brand-700 font-extrabold px-1.5 py-0.5 rounded text-xxs">
                {upcomingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <Heart size={16} />
            <span>Saved Favorites</span>
            {favorites.length > 0 && (
              <span className="ml-auto bg-rose-50 text-rose-600 font-extrabold px-1.5 py-0.5 rounded text-xxs">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <Award size={16} />
            <span>Rewards & Perks</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <Star size={16} />
            <span>My Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <CreditCard size={16} />
            <span>Billing & Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <User size={16} />
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'support'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <HelpCircle size={16} />
            <span>Support & Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white'
                : 'hover:bg-slate-50 text-slate-650 bg-transparent'
            }`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[550px]">
        <AnimatePresence mode="wait">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-r from-slate-900 via-[#0B1437] to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
                <div className="space-y-2 relative z-10">
                  <h2 className="text-2xl font-extrabold">Welcome back, {profileName}!</h2>
                  <p className="text-slate-300 text-sm max-w-md">
                    Check your reservations, unlock Silver loyalty discounts, or print invoice slips for tax filings.
                  </p>
                </div>
                <div className="shrink-0 relative z-10 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                  <span className="text-xxs font-extrabold text-accent-gold-400 uppercase tracking-widest block">Available Points</span>
                  <span className="text-2xl font-black text-white block mt-0.5">{pointsEarned} PTS</span>
                </div>
              </div>

              {/* Loyalty meter */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Award size={16} className="text-accent-gold-500" />
                      <span>Loyalty Tier Status: Silver</span>
                    </h3>
                    <p className="text-xxs text-slate-400 font-bold mt-0.5">Collect {nextMilestone - pointsEarned} more points to reach Gold membership benefits.</p>
                  </div>
                  <span className="text-xs font-black text-brand-600">{progressPercent}% Completed</span>
                </div>
                
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="grid grid-cols-3 text-center text-xxs font-bold text-slate-400 uppercase pt-1">
                  <div>Bronze (1K)</div>
                  <div>Silver (4.25K/4K)</div>
                  <div>Gold (5K)</div>
                </div>
              </div>

              {/* Grid Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming stay overview */}
                <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4 shadow-xxs">
                  <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Next Upcoming Stay</h4>
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <img src={upcomingBookings[0].hotelImage} alt={upcomingBookings[0].hotelName} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-sm line-clamp-1">{upcomingBookings[0].hotelName}</h5>
                          <p className="text-xxs text-slate-400 mt-0.5 font-bold font-mono">Room: {upcomingBookings[0].roomName}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 border-t border-slate-100 pt-3">
                        <span>Check-In: {upcomingBookings[0].checkIn}</span>
                        <button onClick={() => setActiveTab('bookings')} className="text-brand-500 hover:underline flex items-center gap-0.5">
                          Manage <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 space-y-2">
                      <p className="text-xs font-bold">No trips planned right now.</p>
                      <button onClick={() => navigate('/')} className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xxs px-4 py-2 rounded-xl transition-all border-none cursor-pointer">
                        Book Stay
                      </button>
                    </div>
                  )}
                </div>

                {/* Account quick overview */}
                <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4 shadow-xxs flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Saved Collections</h4>
                    <p className="text-slate-500 text-xs mt-1 font-semibold">You have pinned {favorites.length} properties for your next holiday getaway.</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400">Wishlist & Pinned Items</span>
                    <button onClick={() => setActiveTab('favorites')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xxs px-4 py-2 rounded-xl transition-all border-none cursor-pointer">
                      View Favorites
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Bookings list */}
          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Your Booking History</h2>
                <p className="text-slate-500 text-sm">Verify reservations, request cancellation, or retrieve billing invoices.</p>
              </div>

              {/* Upcoming stays */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Upcoming Stays</h3>
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((b) => {
                    const activeIdx = b.status === 'Pending Approval' ? 1 :
                      b.status === 'Confirmed' ? (b.assignedRoomNumber ? 3 : 2) :
                      b.status === 'Room Assigned' ? 3 :
                      b.status === 'Checked-In' ? 4 :
                      b.status === 'Checked-Out' ? 5 : 0;
                      
                    const steps = [
                      { label: 'Created', desc: 'Booking Created' },
                      { label: 'Pending', desc: 'Awaiting Approval' },
                      { label: 'Confirmed', desc: 'Booking Confirmed' },
                      { label: 'Room Assigned', desc: b.assignedRoomNumber ? `Room ${b.assignedRoomNumber}` : 'Assigning Room...' },
                      { label: 'Checked In', desc: 'Active In-House' },
                      { label: 'Checked Out', desc: 'Stay Completed' }
                    ];

                    return (
                      <div key={b.id} className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col bg-white">
                        {/* Top Block: Info & QR */}
                        <div className="flex flex-col md:flex-row border-b border-slate-100">
                          <img src={b.hotelImage} alt={b.hotelName} className="w-full md:w-52 h-44 md:h-auto object-cover shrink-0" />
                          
                          <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-extrabold text-lg text-slate-900 leading-snug">{b.hotelName}</h4>
                                  <span className="text-[10px] font-bold text-slate-400 font-mono block mt-1">ID: {b.id.toUpperCase()}</span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded text-xxs font-extrabold uppercase tracking-wider ${
                                  b.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  b.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  b.status === 'Checked-In' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                  b.status === 'Checked-Out' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  'bg-slate-50 text-slate-600 border border-slate-100'
                                }`}>
                                  {b.status}
                                </span>
                              </div>
                              
                              <p className="text-xs text-slate-500 mt-2 font-bold font-mono uppercase">
                                Room Type: <span className="text-slate-800">{b.roomName}</span>
                              </p>
                              {b.assignedRoomNumber && (
                                <p className="text-xs text-brand-600 font-bold font-mono mt-1">
                                  ASSIGNED ROOM: <span className="bg-brand-50 border border-brand-100 px-2 py-0.5 rounded text-xs font-black">{b.assignedRoomNumber}</span>
                                </p>
                              )}
                              
                              <div className="flex gap-4 text-xs font-bold text-slate-500 mt-3.5 border-t border-slate-50 pt-3">
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase block">Check-In</span>
                                  <span className="text-slate-700 font-extrabold text-sm">{b.checkIn}</span>
                                </div>
                                <div className="border-l border-slate-200 pl-4">
                                  <span className="text-slate-400 text-[10px] uppercase block">Check-Out</span>
                                  <span className="text-slate-700 font-extrabold text-sm">{b.checkOut}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 flex-wrap gap-4">
                              <div>
                                <span className="text-slate-400 text-xxs font-bold block leading-none">Total Paid</span>
                                <span className="text-lg font-extrabold text-slate-950">₹{b.totalPrice.toLocaleString('en-IN')}</span>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.open(`/invoice/INV-${b.id.substring(4)}`, '_blank')}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer border-none"
                                >
                                  <Printer size={14} /> View Invoice
                                </button>
                                {b.status !== 'Checked-In' && b.status !== 'Checked-Out' && (
                                  <button
                                    onClick={() => {
                                      confirm({
                                        title: 'Cancel Booking',
                                        message: 'Are you sure you want to cancel this booking?',
                                        confirmText: 'Cancel Booking',
                                        onConfirm: () => {
                                          cancelBooking(b.id);
                                          toast.success('Booking cancelled successfully.');
                                        }
                                      });
                                    }}
                                    className="border border-red-200 bg-transparent hover:bg-red-50 text-red-650 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <XCircle size={14} /> Cancel Stay
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* QR Code Side Panel */}
                          {b.status !== 'Cancelled' && b.status !== 'Refunded' && (
                            <div className="p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 w-full md:w-52 shrink-0">
                              <div className="relative bg-white p-3 rounded-2xl border border-slate-200 shadow-xxs flex flex-col items-center">
                                {/* Scanner Sweeper line */}
                                <div className="absolute inset-x-3 top-3 bottom-3 border border-brand-500/10 rounded-lg pointer-events-none overflow-hidden z-20">
                                  <div className="w-full h-[2px] bg-red-500 absolute top-0 left-0" style={{ animation: 'scan 2.5s infinite ease-in-out' }} />
                                </div>
                                
                                {/* Mock QR SVG */}
                                <svg viewBox="0 0 100 100" className="w-24 h-24 text-slate-900 relative z-10" fill="currentColor">
                                  <path d="M0 0h24v24H0zm6 6h12v12H6zm0 0" />
                                  <path d="M76 0h24v24H76zm6 6h12v12H82zm0 0" />
                                  <path d="M0 76h24v24H0zm6 6h12v12H6zm0 0" />
                                  <path d="M80 80h8v8h-8zm0 0" />
                                  <path d="M28 4h4v4h-4zm8 0h8v4h-8zm16 0h8v8h-8zm12 0h4v4h-4zm0 4h4v4h-4zm-20 4h4v4h-4zm-8 4h4v8h-4zm8 0h4v4h-4zm16 0h4v4h-4zm12 0h4v4h-4zm-32 4h4v4h-4zm16 0h8v4h-8zm8 4h4v4h-4zm12 0h4v4h-4zm-48 4h8v4h-8zm12 0h4v8h-4zm16 0h4v4h-4zm-20 4h4v4h-4zm12 0h8v4h-8zm8 4h4v4h-4zm4 4h4v4h-4zm12 0h8v4h-8zm-44 4h4v4h-4zm8 0h4v4h-4zm8 0h8v4h-8zm16 0h4v4h-4zm8 0h4v4h-4zm-44 4h8v4h-8zm12 0h4v4h-4zm8 0h4v4h-4zm12 0h8v4h-8zm-36 4h4v4h-4zm12 0h4v4h-4zm8 0h8v4h-8zm8 0h4v4h-4zm-28 4h8v4h-8zm16 0h4v4h-4zm8 0h8v8h-8zm-20 4h4v4h-4zm8 0h4v4h-4zm0 0" />
                                </svg>
                                
                                <span className="text-[7.5px] font-mono font-bold text-slate-400 mt-2 block select-all bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                  {b.qrCodeToken || `STS-QR-${b.id}`}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold text-center mt-2 leading-tight">Present QR pass at desk to expedite check-in.</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Block: Timeline Flow */}
                        {activeIdx >= 0 && (
                          <div className="p-6 bg-slate-50/70 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-4">Stay Progress Timeline</span>
                            
                            <div className="relative flex items-center justify-between px-2 sm:px-6">
                              {/* Connector line */}
                              <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-slate-200 z-0" />
                              <div 
                                className="absolute left-6 top-3.5 h-[2px] bg-brand-500 transition-all duration-500 z-0"
                                style={{ width: `calc(${(Math.min(activeIdx, 5) / 5) * 100}% - ${(Math.min(activeIdx, 5) / 5) * 12}px)` }}
                              />

                              {steps.map((step, sIdx) => {
                                const isCompleted = sIdx < activeIdx;
                                const isActive = sIdx === activeIdx;
                                return (
                                  <div key={sIdx} className="flex flex-col items-center relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                      isCompleted ? 'bg-brand-500 text-white shadow-sm' :
                                      isActive ? 'bg-white border-2 border-brand-500 text-brand-600 shadow-md ring-4 ring-brand-50' :
                                      'bg-white border-2 border-slate-200 text-slate-400'
                                    }`}>
                                      {isCompleted ? '✓' : sIdx + 1}
                                    </div>
                                    <div className="text-center mt-2 max-w-[80px]">
                                      <span className={`text-[10px] font-black block leading-none ${isActive ? 'text-brand-600' : 'text-slate-800'}`}>
                                        {step.label}
                                      </span>
                                      <span className="hidden sm:block text-[8px] font-bold text-slate-400 mt-1 leading-none">
                                        {step.desc}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-400 space-y-4 max-w-lg mx-auto bg-slate-50/50">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Calendar size={28} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-base">No upcoming stays scheduled</p>
                      <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">Explore over 200 luxury retreats across India and book your next escape.</p>
                    </div>
                    <button onClick={() => navigate('/')} className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all border-none cursor-pointer">
                      Find Accommodations
                    </button>
                  </div>
                )}
              </div>

              {/* Past stays */}
              {pastBookings.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Completed Trips</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pastBookings.map((b) => (
                      <div key={b.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-slate-50 opacity-90">
                        <img src={b.hotelImage} alt={b.hotelName} className="h-28 w-full object-cover" />
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">{b.hotelName}</h4>
                            <p className="text-xxs text-slate-400 font-bold mt-0.5">{b.checkIn} to {b.checkOut}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">₹{b.totalPrice.toLocaleString('en-IN')}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(`/invoice/INV-${b.id.substring(4)}`, '_blank')}
                                className="text-brand-500 hover:underline font-bold text-xs bg-transparent border-none cursor-pointer flex items-center gap-0.5"
                              >
                                Invoice
                              </button>
                              <button
                                onClick={() => navigate(`/hotel/${b.hotelId}`)}
                                className="text-slate-700 hover:underline font-bold text-xs bg-transparent border-none cursor-pointer flex items-center gap-0.5"
                              >
                                Book Again <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled Bookings */}
              {cancelledBookings.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Cancelled Bookings</h3>
                  <div className="space-y-3">
                    {cancelledBookings.map((b) => (
                      <div key={b.id} className="border border-slate-150 rounded-xl p-4 flex justify-between items-center bg-red-50/20 opacity-75">
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{b.hotelName}</h4>
                          <span className="text-xxs text-slate-400 font-bold block font-mono">{b.checkIn} to {b.checkOut}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500">₹{b.totalPrice.toLocaleString('en-IN')}</span>
                          <span className="bg-slate-100 text-slate-500 text-xxs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 3: Saved Favorites */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Your Saved Favorites</h2>
                <p className="text-slate-500 text-sm">Quick access to accommodations you bookmarked.</p>
              </div>

              {favoritedHotels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {favoritedHotels.map((hotel) => (
                    <div key={hotel.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative">
                      <button
                        onClick={() => toggleFavorite(hotel.id)}
                        className="absolute top-3 right-3 bg-white/95 rounded-full p-2 text-red-500 shadow-sm z-10 border-none cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>

                      <img src={hotel.images[0]} alt={hotel.name} className="h-40 w-full object-cover" />
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-1 text-slate-400 text-xxs font-bold">
                            <MapPin size={10} />
                            <span>{hotel.city}, {hotel.country}</span>
                          </div>
                          <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 mt-0.5">{hotel.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="bg-amber-50 text-amber-700 text-xxs font-bold px-1.5 py-0.5 rounded">
                              ★ {hotel.rating}
                            </span>
                            <span className="text-slate-400 text-xxs font-bold">({hotel.reviewCount} reviews)</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <span className="font-extrabold text-sm text-slate-900">₹{hotel.basePrice.toLocaleString('en-IN')}/night</span>
                          <button
                            onClick={() => navigate(`/hotel/${hotel.id}`)}
                            className="bg-slate-900 hover:bg-brand-500 text-white font-bold text-xxs px-4 py-2 rounded-xl border-none cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 p-12 rounded-3xl text-center text-slate-400 space-y-4 max-w-lg mx-auto bg-slate-50/50">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-rose-500/80 animate-pulse">
                    <Heart size={28} className="fill-current" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900 text-base">Your Wishlist is Empty</p>
                    <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">Tap the heart icon on any property during search to save it to your dashboard catalog.</p>
                  </div>
                  <button onClick={() => navigate('/')} className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all border-none cursor-pointer">
                    Start Exploring
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 4: Rewards */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">StaySphere Rewards</h2>
                <p className="text-slate-500 text-sm">Track your exclusive status perks, discount certificates, and points ledger.</p>
              </div>

              {/* Progress Panel */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xxs font-extrabold text-accent-gold-400 uppercase tracking-widest">Membership Status</span>
                    <h3 className="text-xl font-extrabold mt-1">{profileName} - Silver Elite</h3>
                  </div>
                  <Award size={36} className="text-accent-gold-400" />
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Loyalty Points: {pointsEarned} PTS</span>
                    <span>Next Tier: 5,000 PTS</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-accent-gold-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-xl text-xxs font-bold text-slate-350 border border-white/5 flex gap-2">
                  <Info size={16} className="text-accent-gold-400 shrink-0" />
                  <span>Your Silver Status unlocks 10% room discount via code <span className="text-white font-mono bg-white/10 px-1 rounded">WELCOME10</span> and priority housekeeper allocation.</span>
                </div>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-150 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Complimentary Fast Wi-Fi</h4>
                  <p className="text-xs text-slate-500">Enjoy premium high-speed connection checks at zero cost across all partner properties.</p>
                </div>
                <div className="p-4 border border-slate-150 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Flexible Cancellation Extension</h4>
                  <p className="text-xs text-slate-500">Cancel up to 18 hours prior to arrival with guaranteed refund status.</p>
                </div>
                <div className="p-4 border border-slate-150 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Gold Tier Upgrades</h4>
                  <p className="text-xs text-slate-500">Reach 5,000 points to unlock room view upgrades, complimentary breakfast, and check-out extension.</p>
                </div>
                <div className="p-4 border border-slate-150 rounded-xl space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Special Deals Panel</h4>
                  <p className="text-xs text-slate-500">Unlock early bird reservation deals in tourism cities like Jaipur and Udaipur Palace collections.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5: Reviews */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Your Reviews</h2>
                <p className="text-slate-500 text-sm">Manage feedback and ratings you submitted for stays.</p>
              </div>

              <div className="space-y-4">
                {myReviews.map((rev) => (
                  <div key={rev.id} className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{rev.hotelName}</h4>
                        <span className="text-xxs text-slate-400 font-bold block mt-0.5">Submitted on {rev.date}</span>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-650 italic leading-relaxed">"{rev.content}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 6: Payments & Invoices */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Billing & Transactions</h2>
                <p className="text-slate-500 text-sm">Retrieve tax-compliant invoices and check card payment guarantees.</p>
              </div>

              {bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-550 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 text-slate-400 uppercase text-xxs font-black tracking-wider text-left bg-slate-50">
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3 px-4">Hotel</th>
                        <th className="py-3 px-4">Check-In</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4 text-center">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{b.id.toUpperCase()}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{b.hotelName}</td>
                          <td className="py-3 px-4 font-semibold">{b.checkIn}</td>
                          <td className="py-3 px-4 font-extrabold text-slate-950">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => window.open(`/invoice/INV-${b.id.substring(4)}`, '_blank')}
                              className="bg-slate-900 hover:bg-brand-500 text-white font-bold text-xxs px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer flex items-center gap-1 mx-auto"
                            >
                              <Printer size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400">
                  <p className="font-bold">No payment history found.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 7: Profile details */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Profile Details</h2>
                <p className="text-slate-500 text-sm">Update your contact information and corporate credentials for auto-filling checkout details.</p>
              </div>

              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const parts = profileName.trim().split(/\s+/);
                  const firstName = parts[0] || '';
                  const lastName = parts.slice(1).join(' ') || '';
                  await updateProfile({
                    firstName,
                    lastName,
                    phone: profilePhone,
                    avatar: profileAvatar
                  });
                  toast.success('Profile updated successfully!');
                } catch (err: any) {
                  toast.error(err.message || 'Failed to update profile');
                }
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1 text-xs">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Profile Image URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1 text-xs">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
                      disabled
                    />
                  </div>

                  <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <h4 className="font-extrabold text-slate-950 text-xs mb-3 flex items-center gap-1"><Briefcase size={14} className="text-slate-400" /> Default Business Info (GST)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-xs">
                        <label className="block font-bold text-slate-500 uppercase tracking-wide">Default Company Name</label>
                        <input
                          type="text"
                          value={profileCompany}
                          onChange={(e) => setProfileCompany(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="block font-bold text-slate-500 uppercase tracking-wide">Default GSTIN</label>
                        <input
                          type="text"
                          value={profileGSTIN}
                          onChange={(e) => setProfileGSTIN(e.target.value.toUpperCase())}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-800 font-semibold focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer border-none"
                >
                  Save Profile Settings
                </button>
              </form>
            </motion.div>
          )}

          {/* Tab 8: Settings */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Account Settings</h2>
                <p className="text-slate-500 text-sm">Configure security keys and marketing subscriptions.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="p-4 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-slate-900">Email Notifications</p>
                    <span className="text-slate-400 text-xxs font-normal">Receive immediate confirmation updates and loyalty points reports.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-10 h-5 rounded-full bg-brand-500 accent-brand-500 cursor-pointer" />
                </div>

                <div className="p-4 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-slate-900">SMS Reminders</p>
                    <span className="text-slate-400 text-xxs font-normal">Receive check-in guidelines from properties directly on WhatsApp.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-10 h-5 rounded-full bg-brand-500 accent-brand-500 cursor-pointer" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 9: Support & Requests */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left animate-fadeIn"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Support & Guest Requests</h2>
                <p className="text-slate-500 text-sm">Request room assistance for active stays or file general support tickets.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                {/* Left: New Request Forms */}
                <div className="space-y-6">
                  {/* Guest Request Form */}
                  <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Request Room Service</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const bookingId = (form.elements.namedItem('bookingId') as HTMLSelectElement).value;
                      const requestType = (form.elements.namedItem('requestType') as HTMLSelectElement).value;
                      const details = (form.elements.namedItem('details') as HTMLTextAreaElement).value;
                      
                      if (!bookingId) {
                        toast.error("Please select an active booking.");
                        return;
                      }
                      try {
                        await createGuestRequest(bookingId, requestType, details);
                        toast.success("Guest request submitted successfully.");
                        form.reset();
                      } catch (err) {
                        toast.error("Failed to submit request.");
                      }
                    }} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase">Select Stay</label>
                        <select name="bookingId" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 font-semibold focus:outline-none cursor-pointer">
                          <option value="">-- Choose Reservation --</option>
                          {bookings.filter(b => b.status === 'Checked-In' || b.status === 'Confirmed').map(b => (
                            <option key={b.id} value={b.id}>{b.hotelName} (Room {b.assignedRoomNumber || 'TBD'})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase">Request Type</label>
                        <select name="requestType" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 font-semibold focus:outline-none cursor-pointer">
                          <option value="Extra Towels">Extra Towels</option>
                          <option value="Extra Pillow">Extra Pillow</option>
                          <option value="Late Checkout">Late Checkout Request</option>
                          <option value="Housekeeping">Housekeeping / Cleaning</option>
                          <option value="Maintenance">Maintenance / Room Repair</option>
                          <option value="Other">Other Assistance</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase">Additional details</label>
                        <textarea name="details" required rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 font-semibold focus:outline-none" placeholder="E.g. Please bring two extra pillows before 8 PM."></textarea>
                      </div>
                      <button type="submit" className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all border-none cursor-pointer">
                        Submit Request
                      </button>
                    </form>
                  </div>

                  {/* General Support Ticket Form */}
                  <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">File Support Ticket</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
                      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                      const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;

                      try {
                        await createSupportTicket(subject, description, priority);
                        toast.success("Support ticket filed successfully.");
                        form.reset();
                      } catch (err) {
                        toast.error("Failed to submit support ticket.");
                      }
                    }} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase">Subject</label>
                        <input name="subject" type="text" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 font-semibold focus:outline-none" placeholder="E.g. Invoice discrepancy or refund inquiry" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase">Description</label>
                        <textarea name="description" required rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 font-semibold focus:outline-none" placeholder="Provide full details of your issue."></textarea>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase">Priority</label>
                        <select name="priority" required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 font-semibold focus:outline-none cursor-pointer">
                          <option value="LOW">Low</option>
                          <option value="MEDIUM" selected>Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                      <button type="submit" className="bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all border-none cursor-pointer">
                        File Ticket
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right: Active Service Log */}
                <div className="space-y-6">
                  {/* Guest Requests Log */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Live Room Requests ({guestRequests.length})</h3>
                    {guestRequests.length > 0 ? (
                      <div className="space-y-3">
                        {guestRequests.map((req) => (
                          <div key={req.id} className="p-4 border border-slate-150 rounded-2xl bg-white space-y-2 text-xs text-left">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{req.requestType}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                req.status === 'OPEN' ? 'bg-amber-50 text-amber-700' :
                                req.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>{req.status}</span>
                            </div>
                            <p className="text-slate-600 font-medium">{req.details}</p>
                            <div className="text-[10px] text-slate-450 font-semibold flex justify-between">
                              <span>Hotel: {req.hotelName} (Room {req.roomNumber || 'TBD'})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400">
                        <p className="font-bold text-xs">No active room service requests.</p>
                      </div>
                    )}
                  </div>

                  {/* Support Tickets Log */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Support Tickets ({supportTickets.length})</h3>
                    {supportTickets.length > 0 ? (
                      <div className="space-y-3">
                        {supportTickets.map((t) => (
                          <div key={t.id} className="p-4 border border-slate-150 rounded-2xl bg-white space-y-2 text-xs text-left">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{t.subject}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                t.status === 'OPEN' ? 'bg-amber-50 text-amber-700' :
                                t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>{t.status}</span>
                            </div>
                            <p className="text-slate-600 font-medium">{t.description}</p>
                            <div className="text-[10px] text-slate-450 font-semibold flex justify-between">
                              <span>Priority: {t.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400">
                        <p className="font-bold text-xs">No active support tickets.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

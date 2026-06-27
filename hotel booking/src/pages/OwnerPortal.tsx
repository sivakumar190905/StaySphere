import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Hotel, Room, Booking } from '../services/mockData';
import { 
  Plus, Edit3, Trash2, Calendar, BarChart3, LogOut, 
  CheckCircle, Clock, Sliders, TrendingUp, Lock, Unlock, Info, Sparkles, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast';
import { RevenueTab } from '../components/partner/RevenueTab';
import { RoomsTab } from '../components/partner/RoomsTab';
import { AvailabilityTab } from '../components/partner/AvailabilityTab';
import { ReviewsTab } from '../components/partner/ReviewsTab';

type PartnerTab = 'dashboard' | 'hotels' | 'rooms' | 'pricing' | 'availability' | 'bookings' | 'revenue' | 'reviews' | 'calendar' | 'allocation' | 'analytics';

export const OwnerPortal: React.FC = () => {
  const navigate = useNavigate();
  const { hotels, bookings, addHotel, deleteHotel, updateHotel, updateBooking, addNotification } = useApp();
  const { toast, confirm: showConfirm } = useToast();
  const [activeTab, setActiveTab] = useState<PartnerTab>('dashboard');
  const [bookingsSubTab, setBookingsSubTab] = useState<'log' | 'allocations'>('log');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'pricing' | 'calendar' | 'reviews'>('pricing');

  // Room Assignment states
  const [changeRoomBooking, setChangeRoomBooking] = useState<Booking | null>(null);
  const [upgradeRoomBooking, setUpgradeRoomBooking] = useState<Booking | null>(null);

  // Helpers for Room Allocation
  const getAvailableRoomNumbers = (hotelId: string, roomId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    const roomCategory = hotel?.rooms.find(r => r.id === roomId);
    return roomCategory?.roomNumbers.filter(rn => rn.status === 'Available') || [];
  };

  const getUpgradeOptions = (hotelId: string, currentRoomId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) return [];
    const currentRoom = hotel.rooms.find(r => r.id === currentRoomId);
    if (!currentRoom) return [];
    return hotel.rooms.filter(r => r.price > currentRoom.price);
  };

  const handleApproveBooking = (booking: Booking) => {
    const hotel = hotels.find(h => h.id === booking.hotelId);
    if (!hotel) {
      toast.error("Hotel not found in system databases.");
      return;
    }
    const roomCategory = hotel.rooms.find(r => r.id === booking.roomId);
    if (!roomCategory) {
      toast.error("Room category not found for this hotel.");
      return;
    }
    const availableRoomNo = roomCategory.roomNumbers.find(rn => rn.status === 'Available');
    if (!availableRoomNo) {
      toast.warning(`Overbooking Prevention: No vacant room numbers in the "${roomCategory.name}" category are available.`);
      return;
    }

    const updatedRoomNumbers = roomCategory.roomNumbers.map(rn => 
      rn.number === availableRoomNo.number ? { ...rn, status: 'Reserved' as const } : rn
    );
    const updatedRooms = hotel.rooms.map(r => 
      r.id === roomCategory.id ? { ...r, roomNumbers: updatedRoomNumbers } : r
    );
    const updatedHotel = { ...hotel, rooms: updatedRooms };
    
    const updatedBooking: Booking = {
      ...booking,
      status: 'Confirmed',
      assignedRoomNumber: availableRoomNo.number
    };

    updateHotel(updatedHotel);
    updateBooking(updatedBooking);
    addNotification(
      'Booking Approved & Room Allocated',
      `Booking ${booking.id} has been approved. Room ${availableRoomNo.number} (${roomCategory.name}) assigned.`
    );
    toast.success(`Successfully approved booking! Assigned Room: ${availableRoomNo.number}`);
  };

  const handleRejectBooking = (booking: Booking) => {
    showConfirm({
      title: 'Reject Booking Request',
      message: `Are you sure you want to reject booking request ${booking.id}?`,
      confirmText: 'Reject Request',
      onConfirm: () => {
        const updatedBooking: Booking = {
          ...booking,
          status: 'Cancelled'
        };
        updateBooking(updatedBooking);
        addNotification(
          'Booking Request Rejected',
          `Reservation request ${booking.id} at ${booking.hotelName} was rejected.`
        );
        toast.warning(`Booking ${booking.id} has been rejected.`);
      }
    });
  };

  const handleChangeRoomNumber = (booking: Booking, newRoomNumber: string) => {
    const hotel = hotels.find(h => h.id === booking.hotelId);
    if (!hotel) return;
    
    const roomCategory = hotel.rooms.find(r => r.id === booking.roomId);
    if (!roomCategory) return;

    let updatedRoomNumbers = roomCategory.roomNumbers.map(rn => 
      rn.number === booking.assignedRoomNumber ? { ...rn, status: 'Available' as const } : rn
    );

    updatedRoomNumbers = updatedRoomNumbers.map(rn => 
      rn.number === newRoomNumber ? { ...rn, status: 'Reserved' as const } : rn
    );

    const updatedRooms = hotel.rooms.map(r => 
      r.id === roomCategory.id ? { ...r, roomNumbers: updatedRoomNumbers } : r
    );
    
    const updatedHotel = { ...hotel, rooms: updatedRooms };
    const updatedBooking: Booking = {
      ...booking,
      assignedRoomNumber: newRoomNumber
    };

    updateHotel(updatedHotel);
    updateBooking(updatedBooking);
    setChangeRoomBooking(null);
    addNotification('Room Assignment Changed', `Guest room assigned for ${booking.id} changed to Room ${newRoomNumber}.`);
    toast.success(`Successfully reassigned room to: ${newRoomNumber}`);
  };

  const handleUpgradeRoom = (booking: Booking, targetRoomCategory: Room, targetRoomNumber: string) => {
    const hotel = hotels.find(h => h.id === booking.hotelId);
    if (!hotel) return;

    const oldRoomCategory = hotel.rooms.find(r => r.id === booking.roomId);
    let updatedRooms = hotel.rooms;
    if (oldRoomCategory) {
      const updatedOldRoomNumbers = oldRoomCategory.roomNumbers.map(rn => 
        rn.number === booking.assignedRoomNumber ? { ...rn, status: 'Available' as const } : rn
      );
      updatedRooms = updatedRooms.map(r => 
        r.id === oldRoomCategory.id ? { ...r, roomNumbers: updatedOldRoomNumbers } : r
      );
    }

    const updatedTargetRoomNumbers = targetRoomCategory.roomNumbers.map(rn => 
      rn.number === targetRoomNumber ? { ...rn, status: 'Reserved' as const } : rn
    );
    updatedRooms = updatedRooms.map(r => 
      r.id === targetRoomCategory.id ? { ...r, roomNumbers: updatedTargetRoomNumbers } : r
    );

    const updatedHotel = { ...hotel, rooms: updatedRooms };
    
    const updatedBooking: Booking = {
      ...booking,
      roomId: targetRoomCategory.id,
      roomName: targetRoomCategory.name,
      assignedRoomNumber: targetRoomNumber
    };

    updateHotel(updatedHotel);
    updateBooking(updatedBooking);
    setUpgradeRoomBooking(null);
    addNotification('Room Category Upgraded', `Booking ${booking.id} upgraded to ${targetRoomCategory.name} (Room ${targetRoomNumber}).`);
    toast.success(`Successfully upgraded room to: ${targetRoomCategory.name} - Room ${targetRoomNumber}`);
  };

  // Form toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Form Fields
  const [hotelName, setHotelName] = useState('');
  const [hotelCity, setHotelCity] = useState('');
  const [hotelCountry, setHotelCountry] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelPrice, setHotelPrice] = useState(12000);
  const [hotelDesc, setHotelDesc] = useState('');
  const [hotelTag, setHotelTag] = useState('New Property');
  const [hotelStars, setHotelStars] = useState(4);
  const [hotelAmenities, setHotelAmenities] = useState<string>('Free Wi-Fi, Pool, Gym');
  const [hotelImage, setHotelImage] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80');

  // Dynamic Pricing Simulator states
  const [pricingHotelId, setPricingHotelId] = useState(hotels[0]?.id || '');
  const [pricingRoomId, setPricingRoomId] = useState(hotels[0]?.rooms[0]?.id || '');
  const [surgePercent, setSurgePercent] = useState(0);

  // Availability Calendar states
  const [calendarHotelId, setCalendarHotelId] = useState(hotels[0]?.id || '');
  const [blockedDates, setBlockedDates] = useState<string[]>([
    '2026-06-12', '2026-06-18', '2026-06-19', '2026-06-25'
  ]);

  // Selected Hotel/Room details for pricing simulator
  const selectedPricingHotel = useMemo(() => hotels.find(h => h.id === pricingHotelId), [hotels, pricingHotelId]);
  const selectedPricingRoom = useMemo(() => selectedPricingHotel?.rooms.find(r => r.id === pricingRoomId), [selectedPricingHotel, pricingRoomId]);

  // Reset room selection when selected hotel changes
  React.useEffect(() => {
    if (selectedPricingHotel && selectedPricingHotel.rooms.length > 0) {
      setPricingRoomId(selectedPricingHotel.rooms[0].id);
    }
  }, [pricingHotelId]);

  // Calculate Owner stats based on in-memory db
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Room Assigned' || b.status === 'Pending Approval' || b.status === 'Checked-In').length;
    const totalRevenue = bookings
      .filter((b) => b.status !== 'Cancelled' && b.status !== 'Refunded')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const confirmedCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned').length;
    const checkedInCount = bookings.filter(b => b.status === 'Checked-In').length;
    const checkedOutCount = bookings.filter(b => b.status === 'Checked-Out').length;
    const pendingCount = bookings.filter(b => b.status === 'Pending Approval').length;
    const cancelledCount = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Refunded').length;

    return { 
      totalBookings, 
      activeBookings, 
      totalRevenue, 
      confirmedCount,
      checkedInCount,
      checkedOutCount,
      pendingCount,
      cancelledCount
    };
  }, [bookings]);

  // SVG Dashboard Circle math
  const svgMetrics = useMemo(() => {
    const total = stats.totalBookings;
    const r = 50;
    const circumference = 2 * Math.PI * r;

    const pctConfirmed = stats.confirmedCount / total;
    const pctCheckedIn = stats.checkedInCount / total;
    const pctCheckedOut = stats.checkedOutCount / total;
    const pctPending = stats.pendingCount / total;
    const pctCancelled = stats.cancelledCount / total;

    const lenConfirmed = circumference * pctConfirmed;
    const lenCheckedIn = circumference * pctCheckedIn;
    const lenCheckedOut = circumference * pctCheckedOut;
    const lenPending = circumference * pctPending;
    const lenCancelled = circumference * pctCancelled;

    return {
      circumference,
      lenConfirmed,
      lenCheckedIn,
      lenCheckedOut,
      lenPending,
      lenCancelled,
    };
  }, [stats]);

  const handleAddHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !hotelCity || !hotelCountry) {
      toast.error('Please fill out Name, City and Country');
      return;
    }

    const amenitiesList = hotelAmenities.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    // Default mock room
    const mockRoom: Room = {
      id: 'r-' + Math.random().toString(36).substr(2, 9),
      name: 'Deluxe Room',
      type: 'deluxe',
      price: hotelPrice,
      capacity: { guests: 2, beds: 1 },
      amenities: amenitiesList,
      images: [hotelImage],
      availableCount: 5,
      sizeSqFt: 350,
      status: 'Available',
      roomNumbers: [
        { number: '101', status: 'Available' },
        { number: '102', status: 'Available' },
        { number: '103', status: 'Available' },
        { number: '104', status: 'Available' },
        { number: '105', status: 'Available' }
      ]
    };

    addHotel({
      name: hotelName,
      city: hotelCity,
      country: hotelCountry,
      address: hotelAddress,
      basePrice: hotelPrice,
      description: hotelDesc,
      stars: hotelStars,
      tag: hotelTag,
      images: [hotelImage],
      amenities: amenitiesList,
      rooms: [mockRoom],
      featured: true
    });

    // Reset
    setHotelName('');
    setHotelCity('');
    setHotelCountry('');
    setHotelAddress('');
    setHotelDesc('');
    setShowAddForm(false);
    toast.success('Hotel listed successfully!');
  };

  const handleStartEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setHotelName(hotel.name);
    setHotelCity(hotel.city);
    setHotelCountry(hotel.country);
    setHotelAddress(hotel.address);
    setHotelPrice(hotel.basePrice);
    setHotelDesc(hotel.description);
    setHotelTag(hotel.tag || '');
    setHotelStars(hotel.stars);
    setHotelAmenities(hotel.amenities.join(', '));
    setHotelImage(hotel.images[0] || '');
    setActiveTab('hotels');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;

    const amenitiesList = hotelAmenities.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    updateHotel({
      ...editingHotel,
      name: hotelName,
      city: hotelCity,
      country: hotelCountry,
      address: hotelAddress,
      basePrice: hotelPrice,
      description: hotelDesc,
      stars: hotelStars,
      tag: hotelTag || undefined,
      images: [hotelImage],
      amenities: amenitiesList
    });

    setEditingHotel(null);
    toast.success('Hotel updated successfully!');
  };

  // Pricing: Apply simulated price to database
  const handlePublishRates = () => {
    if (!selectedPricingHotel || !selectedPricingRoom) return;

    const simulatedPrice = Math.round(selectedPricingRoom.price * (1 + surgePercent / 100));
    const updatedRooms = selectedPricingHotel.rooms.map(r => 
      r.id === pricingRoomId ? { ...r, price: simulatedPrice } : r
    );

    updateHotel({
      ...selectedPricingHotel,
      basePrice: pricingRoomId === selectedPricingHotel.rooms[0]?.id ? simulatedPrice : selectedPricingHotel.basePrice,
      rooms: updatedRooms
    });

    setSurgePercent(0);
    toast.success(`Live Rates published! ${selectedPricingRoom.name} base rate is now ₹${simulatedPrice.toLocaleString('en-IN')}.`);
  };

  // Calendar: Toggle block date
  const handleToggleCalendarDate = (dateStr: string) => {
    setBlockedDates(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  // Calendar day cells helper for June 2026
  const calendarDays = useMemo(() => {
    const totalDays = 30;
    const daysArr = [];
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `2026-06-${dayStr}`;
      
      // Check if there is an active booking checked-in on this date
      const hasBooking = bookings.some(b => 
        b.hotelId === calendarHotelId && 
        b.status === 'Checked-In' &&
        dateStr >= b.checkIn && 
        dateStr <= b.checkOut
      );

      const isBlocked = blockedDates.includes(dateStr);
      let status: 'Available' | 'Occupied' | 'Blocked' = 'Available';
      if (hasBooking) status = 'Occupied';
      else if (isBlocked) status = 'Blocked';

      daysArr.push({ day, dateStr, status });
    }
    return daysArr;
  }, [calendarHotelId, blockedDates, bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 text-left font-jakarta">
      {/* Dark Navy Sidebar Panel */}
      <aside className="w-full md:w-64 shrink-0 bg-[#0B1437] text-slate-100 p-6 rounded-3xl shadow-lg h-fit space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-extrabold text-md shadow-sm">
            PP
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm leading-none">StaySphere Partner</h3>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mt-1">Property Cockpit</span>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <BarChart3 size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'hotels' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Home size={16} />
            <span>Hotels</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'rooms' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Plus size={16} />
            <span>Rooms</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'bookings' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Calendar size={16} />
            <span>Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('revenue')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'revenue' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <TrendingUp size={16} />
            <span>Revenue</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'analytics' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Sliders size={16} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-slate-800 transition-all bg-transparent border-none cursor-pointer"
          >
            <LogOut size={16} />
            <span>Exit Partner Cockpit</span>
          </button>
        </div>
      </aside>

      {/* Main Operations Panel */}
      <main className="flex-1 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[550px]">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Property Performance Overview</h2>
                <p className="text-slate-500 text-xs mt-2">Aggregate metrics of listed luxury accommodations, gross payouts, and review scores.</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Total Bookings</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{stats.totalBookings}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Gross Revenue</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Occupancy Rate</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">72%</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Average Rating</span>
                  <p className="text-2xl font-extrabold text-brand-600 leading-none">4.8</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                {/* Left: Recent Bookings list table */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Recent Payout Bookings</h3>
                  
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                          <th className="py-3 px-4">Guest</th>
                          <th className="py-3 px-4">Dates</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-semibold text-slate-650">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/55">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{b.guestDetails.fullName}</td>
                            <td className="py-3.5 px-4 text-slate-400">{b.checkIn}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700`}>
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: SVG Booking Status ring chart */}
                <div className="lg:col-span-5 p-6 border border-slate-100 rounded-3xl bg-slate-50 flex flex-col items-center justify-center space-y-6">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider text-center w-full">Booking Status Summary</h4>
                  
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" className="stroke-slate-100 fill-none" strokeWidth="12" />
                      
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-brand-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - svgMetrics.lenConfirmed}
                      />

                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-indigo-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - (svgMetrics.lenConfirmed + svgMetrics.lenCheckedIn)}
                      />

                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-emerald-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - (svgMetrics.lenConfirmed + svgMetrics.lenCheckedIn + svgMetrics.lenCheckedOut)}
                      />

                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-amber-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - (svgMetrics.lenConfirmed + svgMetrics.lenCheckedIn + svgMetrics.lenCheckedOut + svgMetrics.lenPending)}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-800 leading-none">{stats.totalBookings}</span>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">Bookings</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-bold text-slate-650 w-full">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-brand-500 shrink-0" />
                      <span>Confirmed: {stats.confirmedCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-indigo-500 shrink-0" />
                      <span>In-House: {stats.checkedInCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                      <span>Checked-Out: {stats.checkedOutCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
                      <span>Pending: {stats.pendingCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotels' && (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Hotel Management</h2>
                  <p className="text-slate-500 text-xs mt-2">Add new properties, edit listings, and manage your portfolio.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingHotel(null);
                    setShowAddForm(!showAddForm);
                  }}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm border-none cursor-pointer"
                >
                  {showAddForm ? 'View Listings' : 'Add New Property'}
                </button>
              </div>

              {showAddForm || editingHotel ? (
                <form onSubmit={editingHotel ? handleSaveEdit : handleAddHotel} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <h3 className="sm:col-span-2 font-bold text-sm text-slate-900 m-0">
                    {editingHotel ? `Edit Property: ${editingHotel.name}` : 'Property Specifications'}
                  </h3>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Hotel Name *</label>
                    <input
                      type="text"
                      required
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">City *</label>
                    <input
                      type="text"
                      required
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Country *</label>
                    <input
                      type="text"
                      required
                      value={hotelCountry}
                      onChange={(e) => setHotelCountry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Full Address</label>
                    <input
                      type="text"
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Base Price (INR ₹) *</label>
                    <input
                      type="number"
                      required
                      value={hotelPrice}
                      onChange={(e) => setHotelPrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Tag / Class</label>
                    <input
                      type="text"
                      value={hotelTag}
                      onChange={(e) => setHotelTag(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Stars (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={hotelStars}
                      onChange={(e) => setHotelStars(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Amenities (comma separated)</label>
                    <input
                      type="text"
                      value={hotelAmenities}
                      onChange={(e) => setHotelAmenities(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Image Link URL</label>
                    <input
                      type="text"
                      value={hotelImage}
                      onChange={(e) => setHotelImage(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider">Short Description</label>
                    <textarea
                      value={hotelDesc}
                      onChange={(e) => setHotelDesc(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs border-none cursor-pointer mt-2"
                  >
                    {editingHotel ? 'Save Modifications' : 'Create Listing'}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {hotels.map((h) => (
                    <div key={h.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                      <img src={h.images[0]} alt={h.name} className="h-36 w-full object-cover" />
                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 m-0 leading-tight">{h.name}</h4>
                            <span className="text-slate-400 text-[10px] block mt-0.5">{h.city}, {h.country}</span>
                          </div>
                          <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            ★ {h.rating}
                          </span>
                        </div>
                        <p className="text-slate-500 line-clamp-2">{h.description}</p>
                        <span className="font-bold text-slate-900 block pt-1">Starting from: ₹{h.basePrice.toLocaleString('en-IN')} / night</span>
                        <div className="flex gap-2 pt-2 border-t border-slate-100 justify-end">
                          <button
                            onClick={() => handleStartEdit(h)}
                            className="bg-slate-100 hover:bg-slate-205 text-slate-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-xs border-none cursor-pointer"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              showConfirm({
                                title: 'Delete Property Listing',
                                message: `Are you sure you want to permanently delete the listing for "${h.name}"?`,
                                confirmText: 'Delete Listing',
                                onConfirm: () => {
                                  deleteHotel(h.id);
                                  toast.success('Listing deleted successfully!');
                                }
                              });
                            }}
                            className="border border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-transparent cursor-pointer"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 3: Dynamic Pricing Simulator */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Property Analytics</h2>
                  <p className="text-slate-500 text-xs mt-2">Simulate pricing models, view calendar availability, and read customer reviews.</p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl text-xxs font-bold text-slate-600">
                  <button
                    onClick={() => setAnalyticsSubTab('pricing')}
                    className={`px-3.5 py-2 rounded-lg border-none cursor-pointer font-extrabold ${
                      analyticsSubTab === 'pricing' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Dynamic Pricing
                  </button>
                  <button
                    onClick={() => setAnalyticsSubTab('calendar')}
                    className={`px-3.5 py-2 rounded-lg border-none cursor-pointer font-extrabold ${
                      analyticsSubTab === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Availability Calendar
                  </button>
                  <button
                    onClick={() => setAnalyticsSubTab('reviews')}
                    className={`px-3.5 py-2 rounded-lg border-none cursor-pointer font-extrabold ${
                      analyticsSubTab === 'reviews' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Guest Reviews
                  </button>
                </div>
              </div>

              {analyticsSubTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Simulator Inputs */}
                    <div className="md:col-span-2 space-y-5 text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase tracking-wider">Select Property</label>
                        <select
                          value={pricingHotelId}
                          onChange={(e) => setPricingHotelId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold focus:outline-none focus:border-brand-500"
                        >
                          {hotels.map(h => (
                            <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-500 uppercase tracking-wider">Select Room Category</label>
                        <select
                          value={pricingRoomId}
                          onChange={(e) => setPricingRoomId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold focus:outline-none focus:border-brand-500"
                        >
                          {selectedPricingHotel?.rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (Base Price: ₹{r.price})</option>
                          ))}
                        </select>
                      </div>

                      {/* Seasonal Surge Multiplier Slider */}
                      <div className="space-y-3 pt-2">
                        <label className="block font-bold text-slate-550 uppercase tracking-wider">Seasonal Rate Surge/Discount Multiplier</label>
                        <input
                          type="range"
                          min="-30"
                          max="50"
                          step="5"
                          value={surgePercent}
                          onChange={(e) => setSurgePercent(Number(e.target.value))}
                          className="w-full accent-brand-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between font-extrabold text-[10px] text-slate-500">
                          <span className="text-rose-600">-30% Monsoon Discount</span>
                          <span className="text-brand-600 font-extrabold text-sm">{surgePercent >= 0 ? `+${surgePercent}%` : `${surgePercent}%`} multiplier</span>
                          <span className="text-emerald-600">+50% Festive Peak Surge</span>
                        </div>
                      </div>

                      {/* Preset Templates */}
                      <div className="space-y-2 pt-2">
                        <span className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Select Simulation Template</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSurgePercent(-15)}
                            className="bg-white hover:bg-rose-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-rose-700 transition-colors"
                          >
                            Monsoon Discount (-15%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSurgePercent(0)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 transition-colors"
                          >
                            Reset Standard (0%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSurgePercent(20)}
                            className="bg-white hover:bg-blue-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-blue-700 transition-colors"
                          >
                            Weekend surge (+20%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSurgePercent(35)}
                            className="bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-emerald-700 transition-colors"
                          >
                            Diwali/Christmas Peak (+35%)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Simulator Live Output Card */}
                    <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest block">Simulated pricing invoice</span>
                        
                        <div className="space-y-1.5 text-xs text-slate-655 font-semibold border-b border-slate-100 pb-3">
                          <div className="flex justify-between">
                            <span>Standard Base Rate:</span>
                            <span className="text-slate-800">₹{selectedPricingRoom?.price.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rate Adjustment:</span>
                            <span className={surgePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {surgePercent >= 0 ? `+₹${Math.round(selectedPricingRoom ? selectedPricingRoom.price * (surgePercent / 100) : 0).toLocaleString('en-IN')}` : `-₹${Math.abs(Math.round(selectedPricingRoom ? selectedPricingRoom.price * (surgePercent / 100) : 0)).toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          <div className="flex justify-between font-extrabold text-slate-900 pt-1.5">
                            <span>Simulated Rate:</span>
                            <span>₹{Math.round((selectedPricingRoom?.price || 0) * (1 + surgePercent / 100)).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xxs text-slate-455 uppercase font-bold">
                          <div className="flex justify-between">
                            <span>CGST (6%):</span>
                            <span>₹{Math.round((selectedPricingRoom?.price || 0) * (1 + surgePercent / 100) * 0.06).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST (6%):</span>
                            <span>₹{Math.round((selectedPricingRoom?.price || 0) * (1 + surgePercent / 100) * 0.06).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between font-black text-slate-950 border-t border-slate-100 pt-1.5 text-xs">
                            <span>Final Customer Price:</span>
                            <span>₹{Math.round((selectedPricingRoom?.price || 0) * (1 + surgePercent / 100) * 1.12).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handlePublishRates}
                        className="w-full bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-xxs py-3 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <TrendingUp size={14} /> Publish Rates Live
                      </button>
                    </div>
                  </div>

                  {/* AI Pricing Suggestions & Competitor Benchmarking Grid */}
                  <div className="pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Column 1: AI Pricing Intelligence */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Sparkles size={16} className="animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider m-0 leading-none">AI Pricing Intelligence</h3>
                          <p className="text-[10px] text-slate-400 mt-1 m-0">Occupancy-based auto-adjustments & seasonal forecast alerts.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Suggestion 1 */}
                        <div className="p-4 border border-slate-150 rounded-2xl bg-white space-y-3 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 m-0">The Leela Palace Udaipur</h4>
                              <span className="text-[10px] text-slate-404 font-bold block mt-0.5">Category: Royal Suite</span>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded">Occupancy: 88%</span>
                          </div>
                          <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                            <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                            <span>High seasonal demand detected in Udaipur area. Recommend increasing base rates to capture surplus traveler budget.</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <div className="text-xxs font-bold text-slate-500">
                              Current: <span className="text-slate-800 font-black">₹36,000</span> → Rec: <span className="text-emerald-600 font-black">₹41,400 (+15%)</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const h = hotels.find(x => x.name.includes('Leela Palace Udaipur'));
                                if (h) {
                                  const r = h.rooms.find(x => x.name.includes('Royal Suite'));
                                  if (r) {
                                    const newPrice = Math.round(r.price * 1.15);
                                    const updatedRooms = h.rooms.map(rm => rm.id === r.id ? { ...rm, price: newPrice } : rm);
                                    updateHotel({ ...h, basePrice: h.rooms[0]?.id === r.id ? newPrice : h.basePrice, rooms: updatedRooms });
                                    addNotification('AI Suggestion Applied', `Increased Leela Palace Royal Suite rate by 15% to ₹${newPrice.toLocaleString('en-IN')}`);
                                    toast.success(`Applied AI recommendation: Royal Suite price increased to ₹${newPrice.toLocaleString('en-IN')}`);
                                  } else {
                                    toast.error("Royal Suite category not found on Leela Palace Udaipur.");
                                  }
                                } else {
                                  toast.error("Leela Palace Udaipur not found in listings database.");
                                }
                              }}
                              className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer"
                            >
                              Apply Adjustment
                            </button>
                          </div>
                        </div>

                        {/* Suggestion 2 */}
                        <div className="p-4 border border-slate-150 rounded-2xl bg-white space-y-3 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 m-0">Taj Exotica Resort Goa</h4>
                              <span className="text-[10px] text-slate-404 font-bold block mt-0.5">Category: Private Pool Villa</span>
                            </div>
                            <span className="bg-rose-50 text-rose-700 text-[9px] font-black px-2 py-0.5 rounded">Occupancy: 34%</span>
                          </div>
                          <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                            <Info size={14} className="text-rose-500 shrink-0 mt-0.5" />
                            <span>High vacancy rates identified for the upcoming weekend. Suggest minor discount to stimulate last-minute villa bookings.</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <div className="text-xxs font-bold text-slate-500">
                              Current: <span className="text-slate-800 font-black">₹1,28,000</span> → Rec: <span className="text-rose-600 font-black">₹1,15,200 (-10%)</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const h = hotels.find(x => x.name.includes('Taj Exotica'));
                                if (h) {
                                  const r = h.rooms.find(x => x.name.includes('Private Pool Villa'));
                                  if (r) {
                                    const newPrice = Math.round(r.price * 0.90);
                                    const updatedRooms = h.rooms.map(rm => rm.id === r.id ? { ...rm, price: newPrice } : rm);
                                    updateHotel({ ...h, basePrice: h.rooms[0]?.id === r.id ? newPrice : h.basePrice, rooms: updatedRooms });
                                    addNotification('AI Suggestion Applied', `Decreased Taj Exotica Private Pool Villa rate by 10% to ₹${newPrice.toLocaleString('en-IN')}`);
                                    toast.success(`Applied AI recommendation: Private Pool Villa price decreased to ₹${newPrice.toLocaleString('en-IN')}`);
                                  } else {
                                    toast.error("Private Pool Villa category not found on Taj Exotica.");
                                  }
                                } else {
                                  toast.error("Taj Exotica Resort Goa not found in listings database.");
                                }
                              }}
                              className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer"
                            >
                              Apply Adjustment
                            </button>
                          </div>
                        </div>

                        {/* Suggestion 3 */}
                        <div className="p-4 border border-slate-150 rounded-2xl bg-white space-y-3 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 m-0">Span Resort & Spa Manali</h4>
                              <span className="text-[10px] text-slate-404 font-bold block mt-0.5">Category: Luxury Villa</span>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded">Occupancy: 95%</span>
                          </div>
                          <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                            <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                            <span>Snowfall season peak spike. Near-perfect booking fill rate. Increase base rates immediately to maximize yield.</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <div className="text-xxs font-bold text-slate-500">
                              Current: <span className="text-slate-800 font-black">₹84,000</span> → Rec: <span className="text-emerald-600 font-black">₹1,00,800 (+20%)</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const h = hotels.find(x => x.name.includes('Span Resort'));
                                if (h) {
                                  const r = h.rooms.find(x => x.name.includes('Luxury Villa'));
                                  if (r) {
                                    const newPrice = Math.round(r.price * 1.20);
                                    const updatedRooms = h.rooms.map(rm => rm.id === r.id ? { ...rm, price: newPrice } : rm);
                                    updateHotel({ ...h, basePrice: h.rooms[0]?.id === r.id ? newPrice : h.basePrice, rooms: updatedRooms });
                                    addNotification('AI Suggestion Applied', `Increased Span Resort Luxury Villa rate by 20% to ₹${newPrice.toLocaleString('en-IN')}`);
                                    toast.success(`Applied AI recommendation: Luxury Villa price increased to ₹${newPrice.toLocaleString('en-IN')}`);
                                  } else {
                                    toast.error("Luxury Villa category not found on Span Resort.");
                                  }
                                } else {
                                  toast.error("Span Resort & Spa Manali not found in listings database.");
                                }
                              }}
                              className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer"
                            >
                              Apply Adjustment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Competitor Index Benchmark */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider m-0 leading-none">Competitor Index Benchmark</h3>
                          <p className="text-[10px] text-slate-400 mt-1 m-0">Live rates vs. direct compset properties in Udaipur and Goa.</p>
                        </div>
                      </div>

                      <div className="border border-slate-150 rounded-2xl bg-white overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-155 text-slate-450 font-extrabold uppercase text-[9px] tracking-wider">
                              <th className="py-3 px-4">Our Property</th>
                              <th className="py-3 px-4">Our Rate</th>
                              <th className="py-3 px-4">Comp Average</th>
                              <th className="py-3 px-4">Market Gap</th>
                              <th className="py-3 px-4 text-right">Action Index</th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-slate-600 text-xxs">
                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-3.5 px-4">
                                <p className="text-slate-900 font-extrabold m-0">Leela Palace Udaipur</p>
                                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Royal Suite</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 font-black">₹36,000</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">₹44,000</td>
                              <td className="py-3.5 px-4 text-rose-600 font-black">-18.1% (Low)</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-wider">
                                  Increase Rate
                                </span>
                              </td>
                            </tr>

                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-3.5 px-4">
                                <p className="text-slate-900 font-extrabold m-0">Taj Exotica Goa</p>
                                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Private Pool Villa</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 font-black">₹1,28,000</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">₹1,21,500</td>
                              <td className="py-3.5 px-4 text-emerald-600 font-black">+5.3% (High)</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-wider">
                                  Apply Discount
                                </span>
                              </td>
                            </tr>

                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-3.5 px-4">
                                <p className="text-slate-900 font-extrabold m-0">Span Resort Manali</p>
                                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Luxury Villa</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 font-black">₹84,000</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">₹85,200</td>
                              <td className="py-3.5 px-4 text-slate-500 font-black">-1.4% (Parity)</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-650 text-[8px] font-black uppercase tracking-wider">
                                  Competitive
                                </span>
                              </td>
                            </tr>

                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-3.5 px-4">
                                <p className="text-slate-900 font-extrabold m-0">Rambagh Palace Jaipur</p>
                                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Heritage Suite</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 font-black">₹1,80,000</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">₹1,95,000</td>
                              <td className="py-3.5 px-4 text-rose-600 font-black">-7.7% (Low)</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[8px] font-black uppercase tracking-wider">
                                  Increase Rate
                                </span>
                              </td>
                            </tr>

                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-3.5 px-4">
                                <p className="text-slate-900 font-extrabold m-0">W Goa Beach Resort</p>
                                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Executive Suite</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 font-black">₹32,000</td>
                              <td className="py-3.5 px-4 text-slate-500 font-semibold">₹32,500</td>
                              <td className="py-3.5 px-4 text-slate-500 font-black">-1.5% (Parity)</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-655 text-[8px] font-black uppercase tracking-wider">
                                  Competitive
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Strategy Tip */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xxs text-slate-650 space-y-2">
                        <p className="font-extrabold uppercase text-[9px] text-slate-455 tracking-wider flex items-center gap-1.5 m-0 leading-none">
                          <Info size={12} className="text-brand-500" />
                          <span>StaySphere Dynamic Strategy Tip</span>
                        </p>
                        <p className="leading-relaxed m-0 mt-1">
                          Your current average room rates are tracking <strong className="text-slate-800 font-bold">5.8% below competitors</strong> across primary palace and resort segments. Adjusting rates toward market parity in high-occupancy months can capture an estimated additional <strong className="text-slate-800 font-bold">₹4,20,000 in monthly margins</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {analyticsSubTab === 'calendar' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-none m-0">Property Availability Calendar</h3>
                      <p className="text-slate-500 text-xs mt-1">Block dates for maintenance, select blackout days, or view reservation occupancies.</p>
                    </div>

                    {/* Property selector */}
                    <select
                      value={calendarHotelId}
                      onChange={(e) => setCalendarHotelId(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white font-semibold text-xs text-slate-800 focus:outline-none"
                    >
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                      ))}
                    </select>
                  </div>

                  {/* Legend & Stats */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-wrap gap-6 text-xxs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded bg-white border border-slate-200" />
                      <span>Available Date</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded bg-brand-500 border border-brand-500" />
                      <span>Occupied (Guest Confirmed)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded bg-rose-105 border border-rose-200 flex items-center justify-center text-rose-700 font-extrabold">
                        ✖
                      </div>
                      <span>Blocked Date (Owner Hold)</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-brand-600 font-black">
                      <Info size={12} />
                      <span>Click an available date cell to toggle block.</span>
                    </div>
                  </div>

                  {/* Monthly calendar Grid: June 2026 */}
                  <div className="border border-slate-150 rounded-2xl p-6 bg-white space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">June 2026</h4>
                      <span className="text-xs text-slate-450 font-bold">30 Days • Roster Schedule</span>
                    </div>

                    <div className="grid grid-cols-7 gap-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-3">
                      {calendarDays.map((dayObj) => (
                        <div
                          key={dayObj.dateStr}
                          onClick={() => dayObj.status !== 'Occupied' && handleToggleCalendarDate(dayObj.dateStr)}
                          className={`h-16 rounded-xl border flex flex-col justify-between p-2 cursor-pointer transition-all ${
                            dayObj.status === 'Occupied' ? 'bg-brand-500 border-brand-500 text-white cursor-not-allowed shadow-xs' :
                            dayObj.status === 'Blocked' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                            'bg-white border-slate-200 text-slate-800 hover:border-brand-500'
                          }`}
                        >
                          <span className="text-[10px] font-black">{dayObj.day}</span>
                          
                          {dayObj.status === 'Occupied' && (
                            <span className="text-[8px] font-extrabold text-slate-100 leading-none">Booked</span>
                          )}
                          {dayObj.status === 'Blocked' && (
                            <span className="text-[8px] font-black text-rose-600 leading-none flex items-center gap-0.5">
                              <Lock size={8} /> Blocked
                            </span>
                          )}
                          {dayObj.status === 'Available' && (
                            <span className="text-[8px] font-bold text-slate-350 leading-none flex items-center gap-0.5">
                              <Unlock size={8} /> Free
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {analyticsSubTab === 'reviews' && (
                <div className="space-y-6">
                  <ReviewsTab />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Bookings Desk</h2>
                  <p className="text-slate-500 text-xs mt-2">Manage guest requests, checkin approvals, and room allocations.</p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl text-xxs font-bold text-slate-600">
                  <button
                    onClick={() => setBookingsSubTab('log')}
                    className={`px-3.5 py-2 rounded-lg border-none cursor-pointer font-extrabold ${
                      bookingsSubTab === 'log' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Reservations Log
                  </button>
                  <button
                    onClick={() => setBookingsSubTab('allocations')}
                    className={`px-3.5 py-2 rounded-lg border-none cursor-pointer font-extrabold ${
                      bookingsSubTab === 'allocations' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500'
                    }`}
                  >
                    Allocations & Approvals
                  </button>
                </div>
              </div>

              {bookingsSubTab === 'log' ? (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Ref Code</th>
                        <th className="py-3 px-4">Hotel / Room</th>
                        <th className="py-3 px-4">Guest Details</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4">Total Price</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-slate-600">
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-4 px-4 font-mono font-bold text-slate-900 uppercase">{b.id}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900 line-clamp-1">{b.hotelName}</p>
                            <span className="text-[10px] text-slate-400">{b.roomName}</span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">{b.guestDetails.fullName}</p>
                            <span className="text-[10px] text-slate-400 block">{b.guestDetails.email}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-500">
                            <p>{b.checkIn}</p>
                            <span className="text-[10px] text-slate-400">to {b.checkOut}</span>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-950">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pending Approvals */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock size={16} />
                      <span>Pending Approvals ({bookings.filter(b => b.status === 'Pending Approval').length})</span>
                    </h3>

                    {bookings.filter(b => b.status === 'Pending Approval').length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {bookings.filter(b => b.status === 'Pending Approval').map((b) => (
                          <div key={b.id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xxs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">{b.guestDetails.fullName}</span>
                                <span className="bg-slate-100 text-slate-655 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">{b.id}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 font-semibold">
                                <p>Hotel: <span className="text-slate-800 font-extrabold">{b.hotelName}</span></p>
                                <p>Requested: <span className="text-brand-600 font-bold">{b.roomName}</span></p>
                                <p>Dates: <span className="text-slate-850 font-bold">{b.checkIn} to {b.checkOut}</span></p>
                                <p>Guests: <span className="text-slate-800">{b.guests} Adults / {b.rooms} Room</span></p>
                              </div>
                              {b.guestDetails.specialRequests && (
                                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                                  Special Request: "{b.guestDetails.specialRequests}"
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 shrink-0 w-full md:w-auto">
                              <button
                                onClick={() => handleApproveBooking(b)}
                                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm border-none cursor-pointer"
                              >
                                Approve & Auto-Allocate
                              </button>
                              <button
                                onClick={() => handleRejectBooking(b)}
                                className="flex-1 md:flex-none border border-red-200 bg-transparent hover:bg-red-50 text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                              >
                                Reject Request
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400">
                        <p className="font-bold text-xs">No pending booking approvals at the moment.</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmed Room Assignments */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle size={16} className="text-brand-500" />
                      <span>Room Assignments Registry</span>
                    </h3>

                    <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Booking Ref</th>
                            <th className="py-3 px-4">Guest</th>
                            <th className="py-3 px-4">Hotel / Category</th>
                            <th className="py-3 px-4">Room No</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Room Actions</th>
                          </tr>
                        </thead>
                        <tbody className="font-semibold text-slate-655">
                          {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned' || b.status === 'Checked-In').map((b) => {
                            const availableRooms = getAvailableRoomNumbers(b.hotelId, b.roomId);
                            const upgradeOptions = getUpgradeOptions(b.hotelId, b.roomId);
                            
                            return (
                              <React.Fragment key={b.id}>
                                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                                  <td className="py-4 px-4 font-mono font-bold text-slate-900 uppercase">{b.id}</td>
                                  <td className="py-4 px-4">
                                    <p className="font-bold text-slate-900">{b.guestDetails.fullName}</p>
                                    <span className="text-[10px] text-slate-400">{b.guestDetails.phone}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <p className="font-bold text-slate-800 line-clamp-1">{b.hotelName}</p>
                                    <span className="text-[10px] text-slate-405 block">{b.roomName}</span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="bg-slate-100 border border-slate-200 font-black text-slate-800 px-2 py-0.5 rounded font-mono text-xs">
                                      {b.assignedRoomNumber || 'None'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                      b.status === 'Checked-In' ? 'bg-indigo-50 text-indigo-700' :
                                      b.status === 'Room Assigned' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      {b.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="flex gap-1.5 justify-end">
                                      <button
                                        onClick={() => {
                                          setUpgradeRoomBooking(null);
                                          setChangeRoomBooking(changeRoomBooking?.id === b.id ? null : b);
                                        }}
                                        className="bg-slate-105 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg font-bold text-[10px] border-none cursor-pointer"
                                      >
                                        Change Room
                                      </button>
                                      <button
                                        onClick={() => {
                                          setChangeRoomBooking(null);
                                          setUpgradeRoomBooking(upgradeRoomBooking?.id === b.id ? null : b);
                                        }}
                                        className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] border-none cursor-pointer"
                                      >
                                        Complimentary Upgrade
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* CHANGE ROOM SELECTOR ROW */}
                                {changeRoomBooking?.id === b.id && (
                                  <tr className="bg-slate-50/70 border-b border-slate-100">
                                    <td colSpan={6} className="p-4 text-left">
                                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                        <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                                          Select New Room Number (Category: {b.roomName})
                                        </p>
                                        {availableRooms.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {availableRooms.map((rn) => (
                                              <button
                                                key={rn.number}
                                                onClick={() => handleChangeRoomNumber(b, rn.number)}
                                                className="bg-slate-105 hover:bg-brand-500 hover:text-white border border-slate-250 font-mono text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                                              >
                                                Room {rn.number}
                                              </button>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xxs text-red-500 font-bold">
                                            Overbooking Warning: No other vacant rooms are currently available in the same room category.
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}

                                {/* COMPLIMENTARY UPGRADE SELECTOR ROW */}
                                {upgradeRoomBooking?.id === b.id && (
                                  <tr className="bg-slate-50/70 border-b border-slate-100">
                                    <td colSpan={6} className="p-4 text-left">
                                      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200">
                                        <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                                          Select Upgrade Room Category & Number
                                        </p>
                                        {upgradeOptions.length > 0 ? (
                                          <div className="space-y-3">
                                            {upgradeOptions.map((cat) => {
                                              const catAvail = cat.roomNumbers.filter(rn => rn.status === 'Available');
                                              return (
                                                <div key={cat.id} className="border-b border-slate-100 pb-3 last:border-none last:pb-0 space-y-2">
                                                  <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-slate-705">{cat.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold font-mono">Price: ₹{cat.price.toLocaleString('en-IN')}/night</span>
                                                  </div>
                                                  {catAvail.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                      {catAvail.map((rn) => (
                                                        <button
                                                          key={rn.number}
                                                          onClick={() => handleUpgradeRoom(b, cat, rn.number)}
                                                          className="bg-brand-50 hover:bg-brand-500 hover:text-white border border-brand-100 font-mono text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer text-brand-700"
                                                        >
                                                          Room {rn.number}
                                                        </button>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <p className="text-[10px] text-slate-455 italic font-semibold">No vacant rooms in this category</p>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <p className="text-xxs text-slate-455 italic font-semibold">
                                            This reservation is already booked in the highest category available at this property.
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'rooms' && <RoomsTab />}

          {activeTab === 'availability' && <AvailabilityTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
        </AnimatePresence>
      </main>
    </div>
  );
};

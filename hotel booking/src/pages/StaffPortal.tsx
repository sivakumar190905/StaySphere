import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Booking, Room } from '../services/mockData';
import { 
  Calendar, HelpCircle, Layers, BarChart3, LogOut, 
  ShieldAlert, Users, ClipboardList, QrCode, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast';

type StaffTab = 'dashboard' | 'checkin' | 'housekeeping' | 'tickets' | 'managerConsole';

export const StaffPortal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    bookings, 
    hotels, 
    updateHotel, 
    updateBooking, 
    addNotification,
    guestRequests: dbGuestRequests,
    supportTickets: dbSupportTickets,
    operationalRooms,
    maintenanceTickets,
    resolveHousekeeping,
    resolveMaintenance,
    updateGuestRequestStatus,
    updateSupportTicketStatus,
    createMaintenanceTicket
  } = useApp();
  const { toast } = useToast();
  
  // Role switcher state
  const [staffRole, setStaffRole] = useState<'Receptionist' | 'Housekeeper' | 'Manager'>('Manager');
  const [activeTab, setActiveTab] = useState<StaffTab>('dashboard');
  const [housekeepingFilter, setHousekeepingFilter] = useState<'all' | 'Cleaning' | 'Maintenance' | 'Available'>('all');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'Request' | 'Maintenance' | 'Complaint'>('all');

  // Lookup & Operations states
  const [searchToken, setSearchToken] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);

  // QR Scan simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTargetName, setScanTargetName] = useState('');

  // Helpers
  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchToken.trim()) return;
    const cleanToken = searchToken.trim().toUpperCase();
    const found = bookings.find(b => 
      b.id.toUpperCase() === cleanToken || 
      (b.qrCodeToken && b.qrCodeToken.toUpperCase() === cleanToken)
    );
    if (found) {
      setSearchedBooking(found);
    } else {
      toast.error("No reservation matching this ID or QR token was found.");
      setSearchedBooking(null);
    }
  };

  const handleStartQRScanSim = (booking: Booking) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanTargetName(booking.guestDetails.fullName);
    setScanProgress(0);
    toast.info(`Aligning desk scanner for ${booking.guestDetails.fullName}'s QR Pass...`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Use QR token if available, else standard fallback
        const token = booking.qrCodeToken || `STS-QR-${booking.hotelName.replace(/\s+/g, '-').toUpperCase()}-${booking.id.split('-').pop()}`;
        setSearchToken(token);
        
        // Execute lookup instantly
        const found = bookings.find(b => 
          b.id.toUpperCase() === token.toUpperCase() || 
          (b.qrCodeToken && b.qrCodeToken.toUpperCase() === token.toUpperCase())
        );
        if (found) {
          setSearchedBooking(found);
          toast.success(`QR Token Scanned Successfully! Verified guest ${found.guestDetails.fullName}.`);
        } else {
          const fallbackFound = bookings.find(b => b.id === booking.id);
          if (fallbackFound) {
            setSearchedBooking(fallbackFound);
            toast.success(`QR code read. Verified guest ${fallbackFound.guestDetails.fullName}.`);
          } else {
            toast.error("Decrypted QR payload could not be verified in system database.");
          }
        }
        setIsScanning(false);
      }
    }, 150);
  };

  const handleCheckInGuest = (booking: Booking) => {
    const updatedBooking: Booking = {
      ...booking,
      status: 'Checked-In'
    };
    updateBooking(updatedBooking);

    const hotel = hotels.find(h => h.id === booking.hotelId);
    if (hotel && booking.assignedRoomNumber) {
      const roomCategory = hotel.rooms.find(r => r.id === booking.roomId);
      if (roomCategory) {
        const updatedRoomNumbers = roomCategory.roomNumbers.map(rn => 
          rn.number === booking.assignedRoomNumber ? { ...rn, status: 'Occupied' as const } : rn
        );
        const updatedRooms = hotel.rooms.map(r => 
          r.id === roomCategory.id ? { ...r, roomNumbers: updatedRoomNumbers } : r
        );
        updateHotel({ ...hotel, rooms: updatedRooms });
      }
    }

    addNotification('Guest Checked In', `Guest ${booking.guestDetails.fullName} checked into Room ${booking.assignedRoomNumber || 'N/A'}.`);
    toast.success(`Guest ${booking.guestDetails.fullName} successfully checked in.`);
    if (searchedBooking?.id === booking.id) {
      setSearchedBooking(updatedBooking);
    }
  };

  const handleCheckOutGuest = (booking: Booking) => {
    const updatedBooking: Booking = {
      ...booking,
      status: 'Checked-Out'
    };
    updateBooking(updatedBooking);

    const hotel = hotels.find(h => h.id === booking.hotelId);
    if (hotel && booking.assignedRoomNumber) {
      const roomCategory = hotel.rooms.find(r => r.id === booking.roomId);
      if (roomCategory) {
        const updatedRoomNumbers = roomCategory.roomNumbers.map(rn => 
          rn.number === booking.assignedRoomNumber ? { ...rn, status: 'Cleaning' as const } : rn
        );
        const updatedRooms = hotel.rooms.map(r => 
          r.id === roomCategory.id ? { ...r, roomNumbers: updatedRoomNumbers } : r
        );
        updateHotel({ ...hotel, rooms: updatedRooms });
      }
    }

    addNotification('Guest Checked Out', `Guest ${booking.guestDetails.fullName} checked out of Room ${booking.assignedRoomNumber || 'N/A'}. Room sent to housekeeping queue.`);
    toast.success(`Guest ${booking.guestDetails.fullName} successfully checked out.`);
    if (searchedBooking?.id === booking.id) {
      setSearchedBooking(updatedBooking);
    }
  };

  const handleReleaseRoom = async (hotelId: string, roomCategoryId: string, roomNo: string) => {
    const opRoom = operationalRooms.find(r => r.number === roomNo && String(r.hotelId) === String(hotelId));
    if (opRoom) {
      try {
        if (opRoom.status === 'Cleaning') {
          await resolveHousekeeping(opRoom.id);
          toast.success(`Room ${roomNo} has been marked Clean & Available.`);
        } else if (opRoom.status === 'Maintenance') {
          const ticket = maintenanceTickets.find(t => t.roomNumberId === opRoom.id && t.status === 'OPEN');
          if (ticket) {
            await resolveMaintenance(ticket.id);
            toast.success(`Room ${roomNo} maintenance resolved.`);
          } else {
            await resolveHousekeeping(opRoom.id);
            toast.success(`Room ${roomNo} released to Available.`);
          }
        }
      } catch (e) {
        toast.error("Failed to release room: " + (e instanceof Error ? e.message : 'Unknown error'));
      }
    } else {
      const hotel = hotels.find(h => h.id === hotelId);
      if (!hotel) return;
      const roomCategory = hotel.rooms.find(r => r.id === roomCategoryId);
      if (!roomCategory) return;

      const updatedRoomNumbers = roomCategory.roomNumbers.map(rn => 
        rn.number === roomNo ? { ...rn, status: 'Available' as const } : rn
      );
      const updatedRooms = hotel.rooms.map(r => 
        r.id === roomCategoryId ? { ...r, roomNumbers: updatedRoomNumbers } : r
      );

      updateHotel({
        ...hotel,
        rooms: updatedRooms
      });

      addNotification('Housekeeping: Room Ready', `Room ${roomNo} at ${hotel.name} is now clean and available for check-in.`);
      toast.success(`Room ${roomNo} has been marked Clean & Available.`);
    }
  };

  const housekeepingRooms = useMemo(() => {
    const list: { hotelId: string; hotelName: string; roomCategoryId: string; roomCategoryName: string; number: string; status: 'Cleaning' | 'Maintenance' | 'Available' | 'Reserved' | 'Occupied' | 'Blocked' }[] = [];
    (hotels || []).forEach(h => {
      (h.rooms || []).forEach(r => {
        (r.roomNumbers || []).forEach(rn => {
          if (rn.status === 'Cleaning' || rn.status === 'Maintenance') {
            list.push({
              hotelId: h.id,
              hotelName: h.name,
              roomCategoryId: r.id,
              roomCategoryName: r.name,
              number: rn.number,
              status: rn.status
            });
          }
        });
      });
    });
    return list;
  }, [hotels]);

  // Handle active tab switches automatically when role changes to prevent illegal views
  useEffect(() => {
    if (staffRole === 'Receptionist') {
      if (activeTab === 'housekeeping' || activeTab === 'managerConsole') {
        setActiveTab('dashboard');
      }
    } else if (staffRole === 'Housekeeper') {
      if (activeTab !== 'housekeeping' && activeTab !== 'tickets') {
        setActiveTab('housekeeping');
      }
    }
  }, [staffRole]);

  const requestsMapped = useMemo(() => {
    return (dbGuestRequests || []).map(r => {
      const b = bookings.find(x => x.id === r.bookingId);
      return {
        id: `req-${r.id}`,
        dbId: r.id,
        kind: 'request' as const,
        guestName: b ? b.guestDetails.fullName : 'Guest',
        roomNo: `${r.hotelName || 'Hotel'} Room ${r.roomNumber || 'N/A'}`,
        request: `${r.requestType}: ${r.details}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString() : 'Recently',
        status: r.status === 'OPEN' ? 'Pending' : r.status === 'IN_PROGRESS' ? 'In-Progress' : 'Resolved',
        type: 'Request' as const
      };
    });
  }, [dbGuestRequests, bookings]);

  const ticketsMapped = useMemo(() => {
    return (dbSupportTickets || []).map(t => {
      return {
        id: `ticket-${t.id}`,
        dbId: t.id,
        kind: 'ticket' as const,
        guestName: t.userName || 'User',
        roomNo: `Account: ${t.userEmail}`,
        request: `${t.subject}: ${t.description}`,
        time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString() : 'Recently',
        status: t.status === 'OPEN' ? 'Pending' : t.status === 'IN_PROGRESS' ? 'In-Progress' : 'Resolved',
        type: t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'Complaint' as const : 'Request' as const
      };
    });
  }, [dbSupportTickets]);

  const maintenanceMapped = useMemo(() => {
    return (maintenanceTickets || []).map(m => {
      return {
        id: `maint-${m.id}`,
        dbId: m.id,
        kind: 'maintenance' as const,
        guestName: 'Maintenance Log',
        roomNo: `${m.hotelName || 'Hotel'} Room ${m.roomNumber || 'N/A'}`,
        request: `Issue: ${m.description} (${m.roomName || 'Unknown Category'})`,
        time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : 'Recently',
        status: m.status === 'OPEN' ? 'Pending' : 'Resolved',
        type: 'Maintenance' as const
      };
    });
  }, [maintenanceTickets]);

  const guestRequests = useMemo(() => {
    return [...requestsMapped, ...ticketsMapped, ...maintenanceMapped];
  }, [requestsMapped, ticketsMapped, maintenanceMapped]);

  // Simulated Staff Shift Roster for Manager
  const [staffRoster, setStaffRoster] = useState([
    { id: 'stf-1', name: 'Rohan Sharma', role: 'Housekeeper', shift: 'Morning', status: 'Active', task: 'Cleaning Room 102' },
    { id: 'stf-2', name: 'Priya Patel', role: 'Receptionist', shift: 'Morning', status: 'Active', task: 'Guest Check-ins' },
    { id: 'stf-3', name: 'Amit Kumar', role: 'Maintenance', shift: 'On-Call', status: 'Idle', task: 'None' },
    { id: 'stf-4', name: 'Neha Gupta', role: 'Housekeeper', shift: 'Evening', status: 'Offline', task: 'None' }
  ]);

  // Stats
  const staffStats = useMemo(() => {
    const totalPending = bookings.filter(b => b.status === 'Pending Approval').length;
    const totalConfirmed = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned').length;
    const totalCheckedIn = bookings.filter(b => b.status === 'Checked-In').length;
    const totalCheckedOut = bookings.filter(b => b.status === 'Checked-Out').length;

    let availableCount = 0;
    let occupiedCount = 0;
    let cleaningCount = 0;
    let maintenanceCount = 0;
    let reservedCount = 0;

    (hotels || []).forEach(h => {
      (h.rooms || []).forEach(r => {
        if (r.status === 'Available') availableCount += (r.availableCount || 0);
        if (r.status === 'Occupied') occupiedCount += 3; // Mocking occupancy count
        if (r.status === 'Cleaning') cleaningCount += 2;
        if (r.status === 'Maintenance') maintenanceCount += 1;
        if (r.status === 'Reserved') reservedCount += 1;
      });
    });

    const totalRooms = availableCount + occupiedCount + cleaningCount + maintenanceCount + reservedCount;

    return { 
      totalPending, 
      totalConfirmed, 
      totalCheckedIn, 
      totalCheckedOut, 
      availableCount, 
      occupiedCount, 
      cleaningCount, 
      maintenanceCount, 
      reservedCount,
      totalRooms: totalRooms || 96 
    };
  }, [bookings, hotels]);

  // SVG Dashboard Circle math
  const svgMetrics = useMemo(() => {
    const total = staffStats.totalRooms;
    const r = 50;
    const circumference = 2 * Math.PI * r;

    const pctAvailable = staffStats.availableCount / total;
    const pctOccupied = staffStats.occupiedCount / total;
    const pctCleaning = staffStats.cleaningCount / total;
    const pctMaintenance = staffStats.maintenanceCount / total;
    const pctReserved = staffStats.reservedCount / total;

    const lenAvailable = circumference * pctAvailable;
    const lenOccupied = circumference * pctOccupied;
    const lenCleaning = circumference * pctCleaning;
    const lenMaintenance = circumference * pctMaintenance;
    const lenReserved = circumference * pctReserved;

    return {
      circumference,
      lenAvailable,
      lenOccupied,
      lenCleaning,
      lenMaintenance,
      lenReserved,
    };
  }, [staffStats]);

  // Update a booking's status
  const handleUpdateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    const b = bookings.find(x => x.id === bookingId);
    if (b) {
      updateBooking({ ...b, status: newStatus });
      addNotification('Booking Updated', `Booking ${bookingId} has been updated to ${newStatus}.`);
      toast.success(`Booking ${bookingId} updated to ${newStatus}.`);
    }
  };

  // Housekeeping: Update Room Status
  const handleUpdateRoomStatus = async (hotelId: string, roomId: string, newStatus: Room['status']) => {
    if (newStatus === 'Maintenance') {
      const opRoom = operationalRooms.find(r => String(r.hotelId) === String(hotelId) && r.roomId === roomId && r.status !== 'Maintenance');
      if (opRoom) {
        const desc = prompt(`Enter maintenance issue for Room ${opRoom.number}:`, "Routine inspection / maintenance");
        if (desc !== null) {
          try {
            await createMaintenanceTicket(opRoom.id, desc);
            toast.success(`Room ${opRoom.number} placed in Maintenance.`);
            return;
          } catch (e) {
            toast.error("Failed to block room for maintenance: " + (e instanceof Error ? e.message : 'Unknown error'));
            return;
          }
        }
      }
    }

    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) return;

    const updatedRooms = hotel.rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r);
    updateHotel({
      ...hotel,
      rooms: updatedRooms
    });
  };

  // Guest Request: Resolve Ticket
  const handleResolveRequest = async (id: string, newStatus: string) => {
    const ticket = guestRequests.find(t => t.id === id);
    if (!ticket) return;

    const dbStatus = newStatus === 'In-Progress' ? 'IN_PROGRESS' : newStatus === 'Resolved' ? 'RESOLVED' : 'CLOSED';
    try {
      if (ticket.kind === 'request') {
        const backendStatus = dbStatus === 'RESOLVED' ? 'COMPLETED' : dbStatus;
        await updateGuestRequestStatus(ticket.dbId, backendStatus);
        toast.success("Guest request updated successfully.");
      } else if (ticket.kind === 'ticket') {
        await updateSupportTicketStatus(ticket.dbId, dbStatus);
        toast.success("Support ticket updated successfully.");
      } else if (ticket.kind === 'maintenance') {
        if (dbStatus === 'RESOLVED') {
          await resolveMaintenance(ticket.dbId);
          toast.success("Maintenance ticket resolved and room released.");
        }
      }
    } catch (e) {
      toast.error("Failed to update ticket: " + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  // Manager: Update Staff Task
  const handleAssignStaffTask = (staffId: string, newTask: string) => {
    setStaffRoster(prev =>
      prev.map(s => s.id === staffId ? { ...s, task: newTask, status: newTask === 'None' ? 'Idle' : 'Active' } : s)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 text-left font-jakarta">
      {/* Dark Navy Sidebar Panel */}
      <aside className="w-full md:w-64 shrink-0 bg-[#0B1437] text-slate-100 p-6 rounded-3xl shadow-lg h-fit space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-extrabold text-md shadow-sm">
            SP
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm leading-none">Operations Desk</h3>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mt-1">StaySphere Office</span>
          </div>
        </div>

        {/* Role Switcher Widget */}
        <div className="space-y-1.5 border-b border-slate-800 pb-5">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Workspace Profile</label>
          <select
            value={staffRole}
            onChange={(e) => setStaffRole(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
          >
            <option value="Receptionist">Receptionist View</option>
            <option value="Housekeeper">Housekeeper View</option>
            <option value="Manager">Operations Manager</option>
          </select>
        </div>

        {/* Sidebar Tabs Filtered by Role */}
        <nav className="space-y-1 text-xs font-bold text-slate-400">
          {(staffRole === 'Receptionist' || staffRole === 'Manager') && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-850 hover:text-white bg-transparent'
              }`}
            >
              <BarChart3 size={16} />
              <span>Dashboard Overview</span>
            </button>
          )}

          {(staffRole === 'Receptionist' || staffRole === 'Manager') && (
            <button
              onClick={() => setActiveTab('checkin')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
                activeTab === 'checkin' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-850 hover:text-white bg-transparent'
              }`}
            >
              <Calendar size={16} />
              <span>Check-In / Roster</span>
            </button>
          )}

          {(staffRole === 'Housekeeper' || staffRole === 'Manager') && (
            <button
              onClick={() => setActiveTab('housekeeping')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
                activeTab === 'housekeeping' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-850 hover:text-white bg-transparent'
              }`}
            >
              <Layers size={16} />
              <span>Room Management</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all relative border-none cursor-pointer ${
              activeTab === 'tickets' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-850 hover:text-white bg-transparent'
            }`}
          >
            <HelpCircle size={16} />
            <span>Guest Requests</span>
            {guestRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="absolute right-3 bg-amber-500 text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                {guestRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>

          {staffRole === 'Manager' && (
            <button
              onClick={() => setActiveTab('managerConsole')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all relative border-none cursor-pointer ${
                activeTab === 'managerConsole' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' : 'hover:bg-slate-850 hover:text-white bg-transparent'
              }`}
            >
              <ClipboardList size={16} />
              <span>Manager Console</span>
            </button>
          )}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-slate-800 transition-all bg-transparent border-none cursor-pointer"
          >
            <LogOut size={16} />
            <span>Exit Operations</span>
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
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Workspace Dashboard</h2>
                    <p className="text-slate-500 text-xs mt-2">Live operational metrics filtered for: <span className="font-extrabold text-brand-600">{staffRole}</span></p>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-xxs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Desk Shift: Morning
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Today Check-Ins</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Room Assigned').length}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Expected Check-Outs</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{bookings.filter((b) => b.status === 'Checked-In').length}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Available Rooms</span>
                  <p className="text-2xl font-extrabold text-emerald-600 leading-none">{staffStats.availableCount}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Pending Requests</span>
                  <p className="text-2xl font-extrabold text-amber-500 leading-none">
                    {guestRequests.filter(r => r.status === 'Pending').length}
                  </p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                {/* Left: Today's Check-ins list table */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Expected Guest Arrivals</h3>
                  
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                          <th className="py-3 px-4">Guest</th>
                          <th className="py-3 px-4">Room Category</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-semibold text-slate-600">
                        {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned').slice(0, 5).map((b) => (
                          <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{b.guestDetails.fullName}</td>
                            <td className="py-3.5 px-4">{b.roomName}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                                (b.status === 'Confirmed' || b.status === 'Room Assigned') ? 'bg-blue-55 text-blue-700 border border-blue-100' :
                                b.status === 'Checked-In' ? 'bg-indigo-50 text-indigo-700' :
                                b.status === 'Checked-Out' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: SVG Room Status ring chart */}
                <div className="lg:col-span-5 p-6 border border-slate-150 rounded-3xl bg-slate-50 flex flex-col items-center justify-center space-y-6">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider text-center w-full">Room Status Distribution</h4>
                  
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" className="stroke-slate-200 fill-none" strokeWidth="12" />
                      
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-emerald-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - svgMetrics.lenAvailable}
                      />

                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-brand-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - (svgMetrics.lenAvailable + svgMetrics.lenOccupied)}
                      />

                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-amber-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - (svgMetrics.lenAvailable + svgMetrics.lenOccupied + svgMetrics.lenCleaning)}
                      />

                      <circle 
                        cx="60" 
                        cy="60" 
                        r="50" 
                        className="stroke-red-500 fill-none transition-all duration-500" 
                        strokeWidth="12" 
                        strokeDasharray={svgMetrics.circumference} 
                        strokeDashoffset={svgMetrics.circumference - (svgMetrics.lenAvailable + svgMetrics.lenOccupied + svgMetrics.lenCleaning + svgMetrics.lenMaintenance)}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-800 leading-none">{staffStats.totalRooms}</span>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">Total Rooms</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-bold text-slate-600 w-full">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                      <span>Available: {staffStats.availableCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-brand-500 shrink-0" />
                      <span>Occupied: {staffStats.occupiedCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
                      <span>Cleaning: {staffStats.cleaningCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-red-500 shrink-0" />
                      <span>Maintenance: {staffStats.maintenanceCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <style>{`
                @keyframes laserSweep {
                  0% { top: 0%; opacity: 0.8; }
                  50% { top: 100%; opacity: 1; }
                  100% { top: 0%; opacity: 0.8; }
                }
                .laser-beam {
                  position: absolute;
                  left: 0;
                  right: 0;
                  height: 3px;
                  background-color: #22c55e;
                  box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
                  animation: laserSweep 2s infinite ease-in-out;
                  z-index: 10;
                  pointer-events: none;
                }
              `}</style>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Arrival Roster Checklist</h2>
                <p className="text-slate-500 text-xs mt-2">Manage check-in confirmations, guest list cards, and status overrides.</p>
              </div>

              {/* Grid Layout for Lookup/Sim and Mock Scanner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Columns: Lookup & Queue */}
                <div className="lg:col-span-7 space-y-4">
                  {/* QR / ID Lookup Box */}
                  <form onSubmit={handleLookupBooking} className="flex gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                    <input
                      type="text"
                      value={searchToken}
                      onChange={(e) => setSearchToken(e.target.value)}
                      placeholder="Verify QR Code Token or Booking ID (e.g. STS-QR-... or STS-2026-...)"
                      className="flex-1 bg-white border border-slate-250 rounded-xl px-4 py-2.5 font-semibold font-mono uppercase tracking-wide focus:outline-none focus:border-brand-500 text-slate-850"
                    />
                    <button
                      type="submit"
                      className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm border-none cursor-pointer"
                    >
                      Search Booking
                    </button>
                  </form>

                  {/* Confirmed Arrivals Waiting Queue */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider text-left">Awaiting Check-in (Quick-Scan Passes)</h3>
                      <span className="bg-blue-100 text-blue-850 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned').length} Awaiting
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned').slice(0, 4).map(b => (
                        <div key={b.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-xxs text-left hover:border-brand-300 transition-all">
                          <div className="space-y-1">
                            <p className="font-extrabold text-xs text-slate-900 leading-tight line-clamp-1">{b.guestDetails.fullName}</p>
                            <p className="text-[9px] text-slate-400 font-bold font-mono">{b.id}</p>
                            <p className="text-[9px] text-slate-500 font-bold truncate max-w-[120px]">{b.roomName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartQRScanSim(b)}
                            disabled={isScanning}
                            className={`bg-slate-900 hover:bg-brand-500 text-white font-extrabold text-[10px] px-3 py-2 rounded-lg transition-all cursor-pointer border-none flex items-center gap-1 shrink-0 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <QrCode size={11} /> Scan QR
                          </button>
                        </div>
                      ))}
                      {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Room Assigned').length === 0 && (
                        <div className="col-span-2 py-6 text-center text-slate-400 space-y-1">
                          <p className="text-xs font-bold">No active arrivals ready for check-in.</p>
                          <p className="text-[10px] text-slate-400">All bookings are either pending approval, cancelled, or already checked in.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Columns: Interactive Desk QR Scanner Visualizer */}
                <div className="lg:col-span-5 bg-[#0B1437] text-white p-5 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[260px] relative overflow-hidden shadow-md">
                  {/* Scanner Grid Header */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Camera size={14} className="text-brand-400" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">StaySphere Desk Lens v2.0</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-brand-505'} inline-block`} />
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{isScanning ? 'Scanning...' : 'Lens Idle'}</span>
                    </div>
                  </div>

                  {/* Viewfinder View */}
                  <div className="my-4 flex-1 flex flex-col items-center justify-center relative">
                    <div className="relative w-40 h-40 border-2 border-slate-700/50 rounded-2xl flex items-center justify-center bg-slate-950/60 overflow-hidden shadow-inner">
                      {/* Viewfinder corners styling */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brand-500" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brand-500" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brand-500" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brand-500" />

                      {/* Moving laser sweep when scanning */}
                      {isScanning && <div className="laser-beam" />}

                      {/* Icon or Status */}
                      {isScanning ? (
                        <div className="flex flex-col items-center text-center space-y-2 z-20">
                          <QrCode size={36} className="text-green-400 animate-pulse" />
                          <span className="text-[9px] font-mono text-green-400 font-bold tracking-widest animate-pulse">CAPTURING...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-2 text-slate-500 z-20">
                          <QrCode size={32} />
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest max-w-[100px] leading-tight">Awaiting Target Pass</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicator and Details */}
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {isScanning ? (
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-300">
                          <span className="truncate max-w-[180px]">Target: {scanTargetName}</span>
                          <span>{scanProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-150" 
                            style={{ width: `${scanProgress}%` }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-0.5">
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">
                          Click <span className="text-brand-400 font-black">"Scan QR"</span> on any confirmed arrival on the left to simulate a terminal QR check-in scan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Result Overlay */}
              {searchedBooking && (
                <div className="border-2 border-brand-500 rounded-3xl p-6 bg-brand-50/10 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-brand-100 pb-3 flex-wrap gap-4 text-left">
                    <div>
                      <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block">Scanned / Search Result</span>
                      <h4 className="font-extrabold text-md text-slate-900 mt-1">{searchedBooking.guestDetails.fullName}</h4>
                      <span className="font-mono text-xs text-slate-450 block mt-0.5">{searchedBooking.guestDetails.email} • {searchedBooking.guestDetails.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="bg-brand-500 text-white font-mono text-xxs font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                        {searchedBooking.id}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono uppercase">{searchedBooking.qrCodeToken}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-slate-650 pt-1 text-left">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Accomodation</span>
                      <span className="text-slate-800 font-extrabold line-clamp-1">{searchedBooking.hotelName}</span>
                      <span className="text-slate-500 font-bold block mt-0.5">{searchedBooking.roomName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Assigned Room</span>
                      <span className="bg-slate-100 border border-slate-200 font-black text-slate-800 px-2 py-0.5 rounded font-mono text-xs inline-block mt-0.5">
                        {searchedBooking.assignedRoomNumber || 'None Assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Check-In / Out</span>
                      <span className="text-slate-800 font-bold block">{searchedBooking.checkIn}</span>
                      <span className="text-slate-500 font-bold block mt-0.5">to {searchedBooking.checkOut}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide inline-block mt-0.5 ${
                        (searchedBooking.status === 'Confirmed' || searchedBooking.status === 'Room Assigned') ? 'bg-blue-55 text-blue-700 border border-blue-100' :
                        searchedBooking.status === 'Checked-In' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        searchedBooking.status === 'Checked-Out' ? 'bg-emerald-50 text-emerald-700 border border-emerald-105' :
                        searchedBooking.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {searchedBooking.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-brand-100 justify-end">
                    {(searchedBooking.status === 'Confirmed' || searchedBooking.status === 'Room Assigned') && (
                      <button
                        onClick={() => handleCheckInGuest(searchedBooking)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm border-none cursor-pointer"
                      >
                        Check-In Guest
                      </button>
                    )}
                    {searchedBooking.status === 'Checked-In' && (
                      <button
                        onClick={() => handleCheckOutGuest(searchedBooking)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm border-none cursor-pointer"
                      >
                        Check-Out Guest
                      </button>
                    )}
                    <button
                      onClick={() => setSearchedBooking(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-850 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer border-none"
                    >
                      Clear Lookup
                    </button>
                  </div>
                </div>
              )}

              {/* Roster table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Hotel & Room</th>
                      <th className="py-3 px-4">Guest Details</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
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
                          <span className="text-[10px] text-slate-400 block">{b.guestDetails.phone}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          <p>{b.checkIn}</p>
                          <span className="text-[10px] text-slate-400">to {b.checkOut}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            b.status === 'Confirmed' ? 'bg-blue-50 text-blue-700' :
                            b.status === 'Checked-In' ? 'bg-indigo-50 text-indigo-700' :
                            b.status === 'Checked-Out' ? 'bg-emerald-50 text-emerald-700' :
                            b.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-1 justify-end">
                            {b.status === 'Confirmed' && (
                              <button
                                onClick={() => handleCheckInGuest(b)}
                                className="bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm border-none cursor-pointer"
                              >
                                Check In
                              </button>
                            )}
                            {b.status === 'Checked-In' && (
                              <button
                                onClick={() => handleCheckOutGuest(b)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm border-none cursor-pointer"
                              >
                                Check Out
                              </button>
                            )}
                            {b.status !== 'Checked-Out' && b.status !== 'Cancelled' && b.status !== 'Refunded' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                className="border border-red-200 hover:bg-red-50 text-red-650 text-[10px] font-bold px-2 py-1.5 rounded-lg bg-transparent cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'housekeeping' && (
            <motion.div
              key="housekeeping"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Room Status Management</h2>
                  <p className="text-slate-500 text-xs mt-2">Track room availability states and dispatch cleanup crews.</p>
                </div>

                <div className="flex gap-2">
                  {(['all', 'Cleaning', 'Maintenance', 'Available'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setHousekeepingFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        housekeepingFilter === f 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {f === 'all' ? 'All Rooms' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Housekeeping Service Queue */}
              <div className="space-y-4 bg-slate-50/50 p-5 rounded-3xl border border-slate-200">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ClipboardList size={16} className="text-brand-500" />
                  <span>Housekeeping Service Queue ({housekeepingRooms.length} Rooms Pending Action)</span>
                </h3>

                {housekeepingRooms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {housekeepingRooms.map((room) => (
                      <div key={`${room.hotelId}-${room.roomCategoryId}-${room.number}`} className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xxs flex items-center justify-between gap-4">
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Room {room.number}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              room.status === 'Cleaning' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-750 border border-red-100'
                            }`}>
                              {room.status}
                            </span>
                          </div>
                          <p className="text-xs font-extrabold text-slate-800 truncate max-w-[180px]">{room.hotelName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{room.roomCategoryName}</p>
                        </div>

                        <button
                          onClick={() => handleReleaseRoom(room.hotelId, room.roomCategoryId, room.number)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-2 rounded-xl transition-all border-none cursor-pointer shrink-0"
                        >
                          {room.status === 'Cleaning' ? 'Mark Clean / Release' : 'Mark Repaired / Release'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400">
                    <p className="font-bold text-xs text-slate-500">All rooms are clean and fully operational. Zero housekeeper dispatches pending.</p>
                  </div>
                )}
              </div>

              {/* Grid of rooms per hotel */}
              <div className="space-y-8 pt-4">
                {hotels.map((hotel) => {
                  const filteredRooms = (hotel.rooms || []).filter(r => housekeepingFilter === 'all' || r.status === housekeepingFilter);
                  if (filteredRooms.length === 0) return null;

                  return (
                    <div key={hotel.id} className="border border-slate-200 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <h4 className="font-extrabold text-sm text-slate-900">{hotel.name} ({hotel.city})</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rooms: {filteredRooms.length}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRooms.map((room) => (
                          <div key={room.id} className="border border-slate-100 bg-slate-50 p-4 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{room.name}</p>
                              <span className="text-[10px] font-medium text-slate-400 uppercase">{room.type} • Status</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                room.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                                room.status === 'Occupied' ? 'bg-blue-50 text-blue-700' :
                                room.status === 'Reserved' ? 'bg-indigo-50 text-indigo-700' :
                                room.status === 'Cleaning' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {room.status}
                              </span>

                              <select
                                value={room.status}
                                onChange={(e) => handleUpdateRoomStatus(hotel.id, room.id, e.target.value as Room['status'])}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none cursor-pointer"
                              >
                                <option value="Available">Available</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Maintenance">Maintenance</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Guest Service Cockpit</h2>
                  <p className="text-slate-500 text-xs mt-2">Manage live utility requests, room maintenance issues, and guest complaints.</p>
                </div>

                <div className="flex gap-2 text-xxs font-extrabold uppercase">
                  {(['all', 'Request', 'Maintenance', 'Complaint'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTicketFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        ticketFilter === f 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {f === 'all' ? 'All Tickets' : f === 'Request' ? 'Guest Requests' : f === 'Maintenance' ? 'Maintenance' : 'Complaints'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {guestRequests.filter(r => ticketFilter === 'all' || r.type === ticketFilter).map((req) => (
                  <div
                    key={req.id}
                    className={`border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                      req.status === 'Pending' ? 'border-amber-250 bg-amber-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{req.guestName}</span>
                        <span className="bg-slate-100 text-slate-655 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {req.roomNo}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          req.type === 'Request' ? 'bg-blue-50 text-blue-700' :
                          req.type === 'Maintenance' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-750'
                        }`}>
                          {req.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium italic">"{req.request}"</p>
                      <span className="text-[10px] text-slate-450 block font-semibold">{req.time}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        req.status === 'In-Progress' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {req.status}
                      </span>

                      <div className="flex gap-1">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleResolveRequest(req.id, 'In-Progress')}
                            className="bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm border-none cursor-pointer"
                          >
                            Claim
                          </button>
                        )}
                        {req.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolveRequest(req.id, 'Resolved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm border-none cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'managerConsole' && staffRole === 'Manager' && (
            <motion.div
              key="managerConsole"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Operations Manager Console</h2>
                <p className="text-slate-500 text-xs mt-2">Dispatch cleaning staff, assign work tickets, and check properties operation logs.</p>
              </div>

              {/* Staff Allocation Section */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-1">
                  <Users size={16} className="text-slate-400" />
                  <span>On-Duty Staff Roster</span>
                </h3>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Shift</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Current Task</th>
                        <th className="py-3 px-4 text-right">Assign Task</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-slate-650">
                      {staffRoster.map((staff) => (
                        <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{staff.name}</td>
                          <td className="py-3.5 px-4">{staff.role}</td>
                          <td className="py-3.5 px-4">{staff.shift}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              staff.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                              staff.status === 'Idle' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {staff.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-500">{staff.task}</td>
                          <td className="py-3.5 px-4 text-right">
                            {staff.role === 'Housekeeper' && staff.status !== 'Offline' ? (
                              <select
                                onChange={(e) => handleAssignStaffTask(staff.id, e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>Assign Cleaning...</option>
                                <option value="Cleaning Room 101">Room 101</option>
                                <option value="Cleaning Room 102">Room 102</option>
                                <option value="Cleaning Room 204">Room 204 (Suite)</option>
                                <option value="None">Mark Idle / Clear Task</option>
                              </select>
                            ) : staff.role === 'Maintenance' && staff.status !== 'Offline' ? (
                              <select
                                onChange={(e) => handleAssignStaffTask(staff.id, e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>Assign Repairs...</option>
                                <option value="Repair AC in Room 302">Room 302 AC</option>
                                <option value="Fix Tap in Room 204">Room 204 Tap</option>
                                <option value="None">Mark Idle / Clear Task</option>
                              </select>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic font-medium">No overrides available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance & Warning panel */}
              <div className="bg-red-50/30 p-6 rounded-2xl border border-red-100 space-y-4">
                <h4 className="font-extrabold text-sm text-rose-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert size={18} className="text-rose-600" />
                  <span>Immediate Maintenance Attention Required</span>
                </h4>
                
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-red-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block">Presidential Suite (JW Marriott Pune)</span>
                      <span className="text-[10px] text-red-650 font-bold block mt-0.5">Issue: Centralized AC cooling failure logged by reception desk</span>
                    </div>
                    <span className="bg-red-50 text-red-700 text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">Priority High</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-red-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 block">Royal Lake View Suite (Leela Palace Udaipur)</span>
                      <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Issue: Balcony sliding door lock alignment fault</span>
                    </div>
                    <span className="bg-amber-50 text-amber-700 text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">Priority Medium</span>
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

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { INITIAL_CITIES } from '../services/mockData';
import type { CityData } from '../services/mockData';
import { 
  Users, Check, Trash2, BarChart2, MapPin, Database, Terminal, Landmark,
  Plus, MessageSquare, LogOut, Network, ArrowRight, Shield, Calendar, CreditCard, FileText, Activity, TrendingUp, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';
import { useEffect } from 'react';
import { PaymentsTab } from '../components/admin/PaymentsTab';
import { InvoicesTab } from '../components/admin/InvoicesTab';
import { AuditLogsTab } from '../components/admin/AuditLogsTab';
import { AdminBookingsTab } from '../components/admin/AdminBookingsTab';
import { AdminTicketsTab } from '../components/admin/AdminTicketsTab';
import { AdminAnalyticsTab } from '../components/admin/AdminAnalyticsTab';
import { ReviewsTab } from '../components/partner/ReviewsTab';

export const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const { hotels, bookings, deleteHotel, supportTickets } = useApp();
  const { toast, confirm } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'approvals' | 'bookings' | 'payments' | 'invoices' | 'reviews' | 'tickets' | 'analytics' | 'audit' | 'cities' | 'database' | 'settings'>('dashboard');

  // List of cities managed in state to support dynamic updates
  const [cities, setCities] = useState<CityData[]>(INITIAL_CITIES);
  const [newCityName, setNewCityName] = useState('');
  const [newCityTier, setNewCityTier] = useState<'Popular' | 'Tier 2'>('Popular');
  const [newCityDesc, setNewCityDesc] = useState('');
  const [newCityImage, setNewCityImage] = useState('https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80');

  // SQL/Mongo Terminal State
  const [sqlQuery, setSqlQuery] = useState('db.hotels.find({ stars: 5 });');
  const [sqlTerminalLogs, setSqlTerminalLogs] = useState<{ query: string; result: any; timeMs: number }[]>([
    { query: 'db.version()', result: '7.0.12', timeMs: 1 }
  ]);

  // Local state for users roster and requests
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [dbName, setDbName] = useState('staysphere');
  
  // Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

  const fetchUsersAndRequests = async () => {
    try {
      const usersData = await api.admin.getUsers();
      setRealUsers(usersData);
      const reqsData = await api.admin.getPartnerRequests();
      setPartnerRequests(reqsData);
    } catch (e: any) {
      toast.error('Failed to load admin data: ' + e.message);
    }
  };

  useEffect(() => {
    fetchUsersAndRequests();

    const checkDbHealth = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data.status || 'connected');
          setDbName(data.database || 'staysphere');
        } else {
          setDbStatus('disconnected');
        }
      } catch (err) {
        console.error("Health check failed:", err);
        setDbStatus('disconnected');
      }
    };

    checkDbHealth();
    const interval = setInterval(checkDbHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // For compatibility with ERD and SQL simulators (we construct mockUsers dynamically from realUsers)
  const mockUsers = useMemo(() => {
    return realUsers.map(u => ({
      id: String(u.id),
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role === 'PARTNER' ? 'Owner' : u.role === 'STAFF' ? 'Staff' : 'Guest',
      joined: new Date(u.createdAt || Date.now()).toISOString().split('T')[0]
    }));
  }, [realUsers]);

  // Define 16 MongoDB Collections and Metadata
  const dbTables = useMemo(() => [
    { name: 'users', rows: mockUsers.length + 120, size: '48 KB', desc: 'User accounts, hashed credentials, contact, and system roles.' },
    { name: 'hotels', rows: hotels.length, size: '150 KB', desc: 'Luxury hotel profiles, address details, stars, and base prices.' },
    { name: 'rooms', rows: hotels.reduce((acc, h) => acc + h.rooms.length, 0), size: '92 KB', desc: 'Rooms, amenities list, pricing, and nested assigned room numbers.' },
    { name: 'bookings', rows: bookings.length + 3, size: '12 KB', desc: 'Reservation documents: check-in, check-out, prices, guest reference.' },
    { name: 'payments', rows: bookings.length + 3, size: '8 KB', desc: 'Transaction documents: transaction ID, method, amount, status.' },
    { name: 'invoices', rows: bookings.length + 3, size: '10 KB', desc: 'Billing details, CGST/SGST breakdown, and active coupons.' },
    { name: 'reviews', rows: hotels.reduce((acc, h) => acc + h.reviews.length, 0), size: '32 KB', desc: 'Guest feedback ratings, comments, and sentiment ratings.' },
    { name: 'wishlist', rows: 4, size: '4 KB', desc: 'Saved hotel document references, mapped to user identifier keys.' },
    { name: 'notifications', rows: 2, size: '2 KB', desc: 'System notification logs, titles, alerts, read flags, and recipient refs.' },
    { name: 'supportTickets', rows: supportTickets.length + 2, size: '6 KB', desc: 'Customer support tickets, category, status, priority, and messages.' },
    { name: 'partnerRequests', rows: partnerRequests.length + 1, size: '3 KB', desc: 'Pending and approved hoteliers requesting system access.' },
    { name: 'activityLogs', rows: 14, size: '16 KB', desc: 'Security audit logs, action, description, timestamp, and IP addresses.' },
    { name: 'hotelDocuments', rows: 3, size: '15 KB', desc: 'FAQ and hotel manuals used as contextual search indexes in RAG.' },
    { name: 'travelGuides', rows: 3, size: '8 KB', desc: 'Curation of destination guides, recommendations, and local maps.' },
    { name: 'policies', rows: 2, size: '4 KB', desc: 'System-wide cancellation terms, refund matrices, and guest guidelines.' },
    { name: 'chatHistory', rows: 5, size: '12 KB', desc: 'Interactive chat messages, queries, assistant answers, and user profiles.' },
  ], [hotels, bookings, mockUsers, supportTickets, partnerRequests]);

  // Compile reviews for moderation
  const allReviews = useMemo(() => {
    const list: { hotelId: string; hotelName: string; reviewId: string; guestName: string; rating: number; comment: string; date: string }[] = [];
    hotels.forEach((h) => {
      h.reviews.forEach((r) => {
        list.push({
          hotelId: h.id,
          hotelName: h.name,
          reviewId: r.id,
          guestName: r.guestName,
          rating: r.rating,
          comment: r.comment,
          date: r.date,
        });
      });
    });
    return list;
  }, [hotels]);

  const handleDeleteUser = (id: number) => {
    confirm({
      title: 'Suspend User',
      message: 'Are you sure you want to suspend this user?',
      confirmText: 'Suspend',
      onConfirm: async () => {
        try {
          await api.admin.deleteUser(id);
          toast.success('User suspended successfully.');
          fetchUsersAndRequests();
        } catch (e: any) {
          toast.error(e.message || 'Failed to suspend user.');
        }
      }
    });
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFirstName || !staffLastName || !staffEmail || !staffPhone || !staffPassword) {
      toast.error('All staff fields are mandatory.');
      return;
    }
    setStaffLoading(true);
    try {
      await api.admin.createStaff({
        firstName: staffFirstName,
        lastName: staffLastName,
        email: staffEmail,
        phone: staffPhone,
        password: staffPassword,
        role: 'STAFF'
      });
      toast.success('Staff account created successfully!');
      setShowAddStaffModal(false);
      // Reset form
      setStaffFirstName('');
      setStaffLastName('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffPassword('');
      fetchUsersAndRequests();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create staff account.');
    } finally {
      setStaffLoading(false);
    }
  };

  // Add City Handler
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName) return;

    const newCity: CityData = {
      name: newCityName,
      propertyCount: 0,
      image: newCityImage,
      tier: newCityTier,
      description: newCityDesc
    };

    setCities(prev => [...prev, newCity]);
    setNewCityName('');
    setNewCityDesc('');
    toast.success(`City "${newCityName}" added successfully to the catalog!`);
  };

  // SQL/Mongo Query Execution Engine Simulator
  const handleExecuteSql = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqlQuery.trim()) return;

    const query = sqlQuery.trim();
    let result: any = null;
    const startTime = performance.now();

    try {
      const qLower = query.toLowerCase().replace(/\s+/g, '');
      
      if (qLower.startsWith('db.users.find')) {
        result = mockUsers;
      } else if (qLower.startsWith('db.hotels.find')) {
        if (qLower.includes('stars:5')) {
          result = hotels.filter(h => h.stars === 5).map(h => ({ id: h.id, name: h.name, city: h.city, stars: h.stars, basePrice: h.basePrice }));
        } else {
          result = hotels.map(h => ({ id: h.id, name: h.name, city: h.city, stars: h.stars, basePrice: h.basePrice }));
        }
      } else if (qLower.startsWith('db.rooms.find')) {
        result = hotels[0]?.rooms || [];
      } else if (qLower.startsWith('db.bookings.find')) {
        result = bookings.map(b => ({ id: b.id, hotel: b.hotelName, guest: b.guestDetails.fullName, amount: b.totalPrice, status: b.status }));
      } else if (qLower.startsWith('db.payments.find')) {
        result = bookings.map(b => ({ id: `pay-${b.id}`, method: 'Credit Card', amount: b.totalPrice, status: 'SUCCESS' }));
      } else if (qLower.startsWith('db.invoices.find')) {
        result = bookings.map(b => ({ id: `inv-${b.id}`, booking_id: b.id, cgst: b.cgst || 0, sgst: b.sgst || 0, payable: b.totalPrice }));
      } else if (qLower.startsWith('db.reviews.find')) {
        result = allReviews.slice(0, 5);
      } else if (qLower.startsWith('db.wishlist.find')) {
        result = favoritedHotelsSchema();
      } else if (qLower.startsWith('db.notifications.find')) {
        result = [
          { id: 1, title: 'Welcome to StaySphere', type: 'Welcome', isRead: false },
          { id: 2, title: 'Elite Membership Active', type: 'Elite Status', isRead: false }
        ];
      } else if (qLower.startsWith('db.supporttickets.find')) {
        result = supportTickets.map(t => ({ id: t.id, guest: t.userName, subject: t.subject, status: t.status }));
      } else if (qLower.startsWith('db.partnerrequests.find')) {
        result = partnerRequests.map(r => ({ id: r.id, businessName: r.businessName, email: r.email, status: r.status }));
      } else if (qLower.startsWith('db.activitylogs.find')) {
        result = [
          { id: 1, action: 'LOGIN', details: 'User logged in', ip: '127.0.0.1' },
          { id: 2, action: 'BOOKING_CREATE', details: 'Booking STS-2026-00125 created', ip: '127.0.0.1' }
        ];
      } else if (qLower.startsWith('db.hoteldocuments.find')) {
        result = [
          { id: 'doc-1', title: 'FAQ: How to Book a Luxury Retreat', type: 'FAQ' },
          { id: 'doc-2', title: 'FAQ: Cancellation Policies', type: 'FAQ' }
        ];
      } else if (qLower.startsWith('db.travelguides.find')) {
        result = [
          { id: 1, destination: 'Mumbai', recommendations: 'Marine Drive, Gateway of India' },
          { id: 2, destination: 'Udaipur', recommendations: 'City Palace, Lake Pichola' }
        ];
      } else if (qLower.startsWith('db.policies.find')) {
        result = [
          { id: 1, name: 'Standard Cancellation', rules: 'Cancellations 24h prior qualify for 100% refund' },
          { id: 2, name: 'Check-in and Check-out', rules: 'Check-in 2:00 PM, Check-out 12:00 PM' }
        ];
      } else if (qLower.startsWith('db.chathistory.find')) {
        result = [
          { id: 1, role: 'user', content: 'What is the check-in time?' },
          { id: 2, role: 'ai', content: 'Standard check-in is at 2:00 PM.' }
        ];
      } else if (qLower.startsWith('db.version') || qLower.startsWith('db.version()')) {
        result = '7.0.12';
      } else {
        result = { error: `Syntax error or collection not found. Try running a command like db.users.find() or db.hotels.find().` };
      }
    } catch (err: any) {
      result = { error: err.message };
    }

    const endTime = performance.now();
    const timeMs = Math.round((endTime - startTime) * 100) / 100;

    setSqlTerminalLogs(prev => [{ query, result, timeMs }, ...prev]);
  };

  const favoritedHotelsSchema = () => {
    return hotels.slice(0, 2).map(h => ({ id: Math.random().toString(36).substr(2, 5), user_id: 'u1', hotel_id: h.id }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 text-left font-jakarta">
      {/* Dark Navy Sidebar Panel */}
      <aside className="w-full md:w-64 shrink-0 bg-[#0B1437] text-slate-100 p-6 rounded-3xl shadow-lg h-fit space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-extrabold text-md shadow-sm">
            AP
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm leading-none">StaySphere Admin</h3>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mt-1">Platform Control</span>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <BarChart2 size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'users' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Users size={16} />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'approvals' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Shield size={16} />
            <span>Hotel Approvals</span>
            {partnerRequests.length > 0 && (
              <span className="ml-auto bg-amber-500 text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                {partnerRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'bookings' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Calendar size={16} />
            <span>Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'payments' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <CreditCard size={16} />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'invoices' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <FileText size={16} />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <MessageSquare size={16} />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'tickets' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Activity size={16} />
            <span>Support Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <TrendingUp size={16} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'audit' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Database size={16} />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border-none cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/15' : 'hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-slate-800 transition-all bg-transparent border-none cursor-pointer"
          >
            <LogOut size={16} />
            <span>Exit Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
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
                <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Platform Analytics</h2>
                <p className="text-slate-500 text-xs mt-2">System-wide reports on reservations, total registrations, and pricing.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Platform Revenue</span>
                  <p className="text-2xl font-extrabold text-[#2563EB] leading-none">
                    ₹{(bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Total Bookings</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{bookings.length}</p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Total Users</span>
                  <p className="text-2xl font-extrabold text-[#D4A017] leading-none">{realUsers.length}</p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-left space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Active Hotels</span>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{hotels.length}</p>
                </div>
              </div>

              {/* Analytics Visualization Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Chart 1: Occupancy Trends */}
                <div className="border border-slate-100 p-5 rounded-3xl bg-slate-50 text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Average Occupancy Trends</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded tracking-wide border border-emerald-100">+4.2% MoM</span>
                  </div>
                  <div className="relative">
                    <svg viewBox="0 0 400 200" className="w-full h-44 text-slate-400" fill="currentColor">
                      <defs>
                        <linearGradient id="chart-blue-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="30" y1="20" x2="390" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="60" x2="390" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="100" x2="390" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="140" x2="390" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="180" x2="390" y2="180" stroke="#cbd5e1" strokeWidth="1" />
                      
                      {/* X Grid lines */}
                      <line x1="30" y1="180" x2="30" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="102" y1="180" x2="102" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="174" y1="180" x2="174" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="246" y1="180" x2="246" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="318" y1="180" x2="318" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="390" y1="180" x2="390" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Area Area Path */}
                      <path d="M30 180 L30 120 C 66 110, 66 90, 102 98 C 138 106, 138 120, 174 112 C 210 104, 210 70, 246 72 C 282 74, 282 60, 318 58 C 354 56, 354 40, 390 40 L390 180 Z" fill="url(#chart-blue-grad)" />
                      
                      {/* Stroke Line Path */}
                      <path d="M30 120 C 66 110, 66 90, 102 98 C 138 106, 138 120, 174 112 C 210 104, 210 70, 246 72 C 282 74, 282 60, 318 58 C 354 56, 354 40, 390 40" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

                      {/* Interactive Dots */}
                      <circle cx="30" cy="120" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="102" cy="98" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="174" cy="112" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="246" cy="72" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="318" cy="58" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                      <circle cx="390" cy="40" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />

                      {/* Y-Axis Labels */}
                      <text x="5" y="25" className="text-[9px] font-bold fill-slate-400 font-mono">100%</text>
                      <text x="5" y="65" className="text-[9px] font-bold fill-slate-400 font-mono">75%</text>
                      <text x="5" y="105" className="text-[9px] font-bold fill-slate-400 font-mono">50%</text>
                      <text x="5" y="145" className="text-[9px] font-bold fill-slate-400 font-mono">25%</text>
                      <text x="5" y="185" className="text-[9px] font-bold fill-slate-400 font-mono">0%</text>

                      {/* X-Axis Labels */}
                      <text x="25" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Dec</text>
                      <text x="97" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Jan</text>
                      <text x="169" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Feb</text>
                      <text x="241" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Mar</text>
                      <text x="313" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Apr</text>
                      <text x="380" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">May</text>
                    </svg>
                  </div>
                </div>

                {/* Chart 2: Revenue Growth */}
                <div className="border border-slate-100 p-5 rounded-3xl bg-slate-50 text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-extrabold text-xs uppercase tracking-wider block">Monthly Gross Payouts (INR)</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded tracking-wide border border-emerald-100">+12.4% YoY</span>
                  </div>
                  <div className="relative">
                    <svg viewBox="0 0 400 200" className="w-full h-44 text-slate-400" fill="currentColor">
                      <defs>
                        <linearGradient id="chart-bar-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="30" y1="20" x2="390" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="60" x2="390" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="100" x2="390" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="140" x2="390" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="180" x2="390" y2="180" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Bar columns Dec to May */}
                      <rect x="50" y="100" width="20" height="80" rx="3" fill="url(#chart-bar-grad)" />
                      <rect x="115" y="85" width="20" height="95" rx="3" fill="url(#chart-bar-grad)" />
                      <rect x="180" y="70" width="20" height="110" rx="3" fill="url(#chart-bar-grad)" />
                      <rect x="245" y="50" width="20" height="130" rx="3" fill="url(#chart-bar-grad)" />
                      <rect x="310" y="60" width="20" height="120" rx="3" fill="url(#chart-bar-grad)" />
                      <rect x="375" y="30" width="20" height="150" rx="3" fill="url(#chart-bar-grad)" />

                      {/* Y-Axis Labels */}
                      <text x="5" y="25" className="text-[9px] font-bold fill-slate-400 font-mono">5.0Cr</text>
                      <text x="5" y="65" className="text-[9px] font-bold fill-slate-400 font-mono">3.7Cr</text>
                      <text x="5" y="105" className="text-[9px] font-bold fill-slate-400 font-mono">2.5Cr</text>
                      <text x="5" y="145" className="text-[9px] font-bold fill-slate-400 font-mono">1.2Cr</text>
                      <text x="5" y="185" className="text-[9px] font-bold fill-slate-400 font-mono">0.0Cr</text>

                      {/* X-Axis Labels */}
                      <text x="45" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Dec</text>
                      <text x="110" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Jan</text>
                      <text x="175" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Feb</text>
                      <text x="240" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Mar</text>
                      <text x="305" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">Apr</text>
                      <text x="370" y="195" className="text-[9px] font-bold fill-slate-400 font-mono">May</text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Layout Grids */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                
                {/* Left: Database Console Connectivity Status Block */}
                <div className="lg:col-span-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                      <Database size={16} className="text-brand-500" />
                      <span>Database Console</span>
                    </div>

                    <div className="space-y-3 pt-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Connection Status</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Connected
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Database</span>
                        <span className="font-mono text-slate-800 font-bold">staysphere_prod</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Connections</span>
                        <span className="font-mono text-slate-800 font-bold">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Average Latency</span>
                        <span className="font-mono text-slate-800 font-bold">0.8ms</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('database')}
                    className="w-full mt-6 bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all border-none cursor-pointer"
                  >
                    <Terminal size={14} />
                    <span>Open Console</span>
                  </button>
                </div>

                {/* Middle: Top Cities by Bookings Horizontal Progress Bars */}
                <div className="lg:col-span-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                    <MapPin size={16} className="text-indigo-500" />
                    <span>Top Cities by Bookings</span>
                  </div>

                  <div className="space-y-3.5 pt-2 text-xs">
                    {[
                      { name: 'Goa', count: 1245, pct: '100%', color: 'from-[#5B5FEF] to-[#6C4CFF]' },
                      { name: 'Delhi', count: 1102, pct: '88%', color: 'from-[#5B5FEF] to-[#6C4CFF]' },
                      { name: 'Mumbai', count: 982, pct: '79%', color: 'from-[#5B5FEF] to-[#6C4CFF]' },
                      { name: 'Bangalore', count: 874, pct: '70%', color: 'from-[#5B5FEF] to-[#6C4CFF]' },
                      { name: 'Jaipur', count: 645, pct: '52%', color: 'from-[#5B5FEF] to-[#6C4CFF]' }
                    ].map((city) => (
                      <div key={city.name} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{city.name}</span>
                          <span>{city.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: city.pct }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${city.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Recent Support Tickets */}
                <div className="lg:col-span-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                    <MessageSquare size={16} className="text-amber-500" />
                    <span>Recent Support Tickets</span>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    {supportTickets.length === 0 ? (
                      <p className="text-slate-500 font-bold p-4">No active support tickets.</p>
                    ) : (
                      supportTickets.slice(0, 4).map((ticket) => (
                        <div key={ticket.id} className="p-3 border border-slate-200/60 rounded-xl bg-white space-y-1 hover:border-slate-300 transition-all text-left">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-slate-850 text-[10px]">#{ticket.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${ticket.priority === 'High' || ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="font-bold text-slate-700 leading-snug line-clamp-1 mt-1">{ticket.subject}</p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 font-bold">
                            <span>Status: {ticket.status}</span>
                            <span>{new Date(ticket.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Enterprise Redesign Part 2: Advanced Relational Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                
                {/* Geographic Heatmap Widget */}
                <div className="lg:col-span-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 space-y-4 text-left font-jakarta">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                      <MapPin size={16} className="text-emerald-500" />
                      <span>Geographic Heatmap</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase font-mono">Live Density</span>
                  </div>

                  {/* Simulated India Map overlay */}
                  <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <svg viewBox="0 0 100 120" className="h-44 text-slate-655 opacity-30" fill="currentColor">
                      <path d="M45 10 C 60 12, 65 25, 62 35 C 58 45, 65 52, 62 60 C 58 70, 70 80, 62 90 C 55 98, 50 115, 45 120 C 40 115, 38 98, 35 90 C 30 80, 20 70, 22 60 C 25 52, 28 45, 25 35 C 28 25, 35 12, 45 10 Z" />
                    </svg>
                    
                    {/* Pulsing density map nodes */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white relative cursor-pointer" />
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-955 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Delhi (82%)</span>
                    </div>

                    <div className="absolute top-1/2 left-2/5 -translate-x-1/2 -translate-y-1/2 group">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-amber-600 rounded-full border-2 border-white relative cursor-pointer" />
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-955 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Rajasthan (94%)</span>
                    </div>

                    <div className="absolute top-3/5 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-emerald-600 rounded-full border-2 border-white relative cursor-pointer" />
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-955 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Goa (98%)</span>
                    </div>

                    <div className="absolute top-3/4 left-2/5 -translate-x-1/2 -translate-y-1/2 group">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-red-655 rounded-full border-2 border-white relative cursor-pointer" />
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-955 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Kerala (76%)</span>
                    </div>
                  </div>
                </div>

                {/* Customer Satisfaction Widget */}
                <div className="lg:col-span-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 space-y-4 text-left font-jakarta">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                      <MessageSquare size={16} className="text-indigo-500" />
                      <span>Customer Satisfaction</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">NPS 86</span>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-center gap-4">
                      <p className="text-3.5xl font-black text-slate-950 font-mono m-0">4.8</p>
                      <div>
                        <p className="font-extrabold text-slate-800">Excellent average rating</p>
                        <p className="text-[10px] text-slate-450 font-bold">Based on 124,562 guest reviews</p>
                      </div>
                    </div>

                    {/* Horizontal satisfaction distribution bars */}
                    <div className="space-y-2 pt-1">
                      {[
                        { label: '5 ★ Excellent', pct: '88%', fill: 'bg-emerald-500' },
                        { label: '4 ★ Very Good', pct: '9%', fill: 'bg-blue-500' },
                        { label: '3 ★ Average', pct: '2%', fill: 'bg-amber-500' },
                        { label: '2-1 ★ Poor', pct: '1%', fill: 'bg-red-500' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-20 font-bold text-slate-500 text-[10px] uppercase shrink-0">{item.label}</span>
                          <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.fill}`} style={{ width: item.pct }} />
                          </div>
                          <span className="w-8 font-bold text-slate-700 text-right text-[10px] font-mono shrink-0">{item.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Partner Activity & Staff Productivity Widget */}
                <div className="lg:col-span-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 space-y-4 text-left font-jakarta">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                      <Network size={16} className="text-amber-500" />
                      <span>Operational Productivity</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase font-mono">KPI Audit</span>
                  </div>

                  <div className="space-y-3 pt-2 text-xs font-semibold text-slate-650">
                    <div className="p-3 border border-slate-200/50 rounded-xl bg-white space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Partner Host Activity</p>
                      <div className="flex justify-between items-center pt-1">
                        <span>New Hotel Registrations</span>
                        <span className="text-slate-800 font-bold font-mono">+18 this week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Approval Time</span>
                        <span className="text-slate-800 font-bold font-mono">4.2 hours</span>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-200/50 rounded-xl bg-white space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Desk Staff Productivity</p>
                      <div className="flex justify-between items-center pt-1">
                        <span>Guest Requests Resolved</span>
                        <span className="text-slate-800 font-bold font-mono">98.4%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Dispatch Latency</span>
                        <span className="text-slate-800 font-bold font-mono">12 mins</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Hotel inventory sanity manager */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Hotel Moderation Quick Action</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotels.map((h) => (
                    <div key={h.id} className="border border-slate-100 p-4 rounded-2xl flex justify-between items-center bg-slate-50">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{h.name}</h4>
                        <span className="text-slate-400 text-[10px] font-bold block mt-0.5">{h.address}, {h.city}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                          <Check size={12} /> Approved
                        </span>
                        <button
                          onClick={() => {
                            confirm({
                              title: 'Remove Hotel Listing',
                              message: 'Are you sure you want to remove this hotel listing from the platform?',
                              confirmText: 'Remove',
                              onConfirm: () => {
                                deleteHotel(h.id);
                                toast.success('Hotel listing removed successfully.');
                              }
                            });
                          }}
                          className="border border-red-200 hover:bg-red-50 text-red-650 px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all bg-transparent cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">User Management</h2>
                  <p className="text-slate-500 text-sm">Manage property hosts, receptionists, housekeepers, and travelers.</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm border-none cursor-pointer"
                >
                  <Plus size={14} /> Add Staff Member
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-xxs">
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-slate-650">
                    {realUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{u.firstName} {u.lastName}</td>
                        <td className="py-3.5 px-4">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xxs font-extrabold uppercase tracking-wide ${
                              u.role === 'PARTNER' ? 'bg-blue-50 text-blue-700' :
                              u.role === 'STAFF' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-705'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 ml-auto border border-red-155 hover:bg-red-50 px-2.5 py-1 rounded-lg bg-transparent cursor-pointer"
                          >
                            <Trash2 size={12} /> Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">City Catalog Management</h2>
                  <p className="text-slate-500 text-sm">Add or edit cities supported by StaySphere. Proves scalability for unlimited destinations.</p>
                </div>
              </div>

              {/* Add City Form */}
              <form onSubmit={handleAddCity} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">City Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">City Tier</label>
                  <select
                    value={newCityTier}
                    onChange={(e) => setNewCityTier(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold focus:outline-none"
                  >
                    <option value="Popular">Popular Tier</option>
                    <option value="Tier 2">Tier 2 Destination</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">City Image URL</label>
                  <input
                    type="text"
                    placeholder="Unsplash image URL"
                    value={newCityImage}
                    onChange={(e) => setNewCityImage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">Short Description</label>
                  <textarea
                    placeholder="Brief description of the city..."
                    value={newCityDesc}
                    onChange={(e) => setNewCityDesc(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white font-semibold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 sm:col-span-2 w-fit shadow-sm border-none cursor-pointer"
                >
                  <Plus size={14} /> Add City
                </button>
              </form>

              {/* Cities Grid List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {cities.map((city) => (
                  <div key={city.name} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                    <img src={city.image} alt={city.name} className="h-28 w-full object-cover" />
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-slate-900">{city.name}</span>
                        <span className="bg-slate-100 text-slate-550 px-2 py-0.5 rounded text-xxs font-extrabold uppercase">
                          {city.tier}
                        </span>
                      </div>
                      <p className="text-slate-450 line-clamp-2">{city.description}</p>
                      <span className="font-bold text-brand-500">{city.propertyCount} Properties listed</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Hotel Approvals</h2>
                <p className="text-slate-500 text-xs mt-2">Approve or reject properties added by partners before they go live.</p>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="py-3 px-4">Hotel Name</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Rooms</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-slate-650">
                    {hotels.filter(h => h.status === 'PENDING_APPROVAL').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">No properties pending approval.</td>
                      </tr>
                    ) : (
                      hotels.filter(h => h.status === 'PENDING_APPROVAL').map((h) => (
                        <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50/55">
                          <td className="py-3 px-4 font-bold text-slate-900">{h.name}</td>
                          <td className="py-3 px-4">{h.city}, {h.country}</td>
                          <td className="py-3 px-4">{h.rooms.length} Categories</td>
                          <td className="py-3 px-4 text-right">
                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs mr-2 transition-all shadow-sm border-none cursor-pointer">
                              Approve
                            </button>
                            <button onClick={() => deleteHotel(h.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm border-none cursor-pointer">
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'audit' && <AuditLogsTab />}

          {activeTab === 'bookings' && <AdminBookingsTab />}
          {activeTab === 'tickets' && <AdminTicketsTab />}
          {activeTab === 'analytics' && <AdminAnalyticsTab />}
          {activeTab === 'reviews' && <ReviewsTab />}

          {activeTab === 'approvals' && (
            <motion.div
              key="moderation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Partner Requests Approvals */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Partner Onboarding Requests</h2>
                  <p className="text-slate-500 text-sm">Review, approve or reject partnership requests from boutique hotel operators.</p>
                </div>

                <div className="space-y-4">
                  {partnerRequests.length === 0 ? (
                    <div className="border border-dashed border-slate-200 p-8 text-center text-slate-400 font-semibold rounded-2xl bg-white">
                      No partner requests yet.
                    </div>
                  ) : (
                    partnerRequests.map((req) => (
                      <div key={req.id} className="border border-slate-200 p-5 rounded-2xl bg-white space-y-4 text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{req.firstName} {req.lastName}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                                req.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-750'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <span className="text-slate-400 block mt-0.5">{req.email} | {req.phone}</span>
                          </div>
                          <span className="text-slate-400 text-xxs font-bold">Applied: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <Landmark size={14} className="text-slate-450" />
                            <span>Property: {req.hotelName}</span>
                          </div>
                          <p className="text-slate-500 font-semibold">{req.hotelAddress}</p>
                        </div>

                        {req.status === 'PENDING' && (
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={async () => {
                                confirm({
                                  title: 'Reject Request',
                                  message: 'Are you sure you want to reject this partner request?',
                                  confirmText: 'Reject',
                                  onConfirm: async () => {
                                    try {
                                      await api.admin.rejectPartnerRequest(req.id);
                                      toast.success('Partner request rejected.');
                                      fetchUsersAndRequests();
                                    } catch (e: any) {
                                      toast.error(e.message || 'Failed to reject.');
                                    }
                                  }
                                });
                              }}
                              className="border border-red-200 hover:bg-red-50 text-red-650 px-4 py-1.5 rounded-xl text-xxs font-bold bg-transparent cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.admin.approvePartnerRequest(req.id);
                                  toast.success('Partner request approved! Account active.');
                                  fetchUsersAndRequests();
                                } catch (e: any) {
                                  toast.error(e.message || 'Failed to approve.');
                                }
                              }}
                              className="bg-[#2563EB] hover:bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xxs font-extrabold border-none cursor-pointer"
                            >
                              Approve & Create Account
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Review Moderation */}
              <div className="space-y-4 pt-6 border-t border-slate-250">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Review Moderation</h2>
                  <p className="text-slate-500 text-sm">Review, flag or delete feedback that violates terms of service.</p>
                </div>

                <div className="space-y-4">
                  {allReviews.map((rev) => (
                    <div key={rev.reviewId} className="border border-slate-200 p-4 rounded-xl bg-white space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900">{rev.guestName}</span>
                          <span className="text-slate-450 font-medium"> on </span>
                          <span className="font-bold text-slate-750">{rev.hotelName}</span>
                        </div>
                        <span className="bg-amber-50 text-amber-700 text-xxs font-extrabold px-2 py-0.5 rounded">
                          ★ {rev.rating}
                        </span>
                      </div>

                      <p className="text-slate-500 italic">"{rev.comment}"</p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-slate-400 text-xxs font-bold">{rev.date}</span>
                        <button
                          onClick={() => toast.success('Review marked safe!')}
                          className="text-emerald-600 hover:text-emerald-700 font-bold border border-emerald-100 hover:bg-emerald-50 px-3 py-1 rounded-lg text-xxs bg-transparent cursor-pointer"
                        >
                          Mark Safe
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div
              key="database"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">MongoDB Document Explorer</h2>
                <p className="text-slate-500 text-sm">Active document collections, schema references, and MongoDB shell CLI logs.</p>
              </div>

              {/* Db metrics summary block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold text-xxs uppercase tracking-wider block">Database Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                      dbStatus === 'connected' ? 'bg-emerald-500' :
                      dbStatus === 'reconnecting' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className={`text-md font-bold uppercase ${
                      dbStatus === 'connected' ? 'text-emerald-450' :
                      dbStatus === 'reconnecting' ? 'text-amber-450' : 'text-rose-450'
                    }`}>
                      {dbStatus === 'connected' ? 'Connected' :
                       dbStatus === 'reconnecting' ? 'Reconnecting' : 'Disconnected'}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xxs font-semibold block">{dbName} (MongoDB Atlas)</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold text-xxs uppercase tracking-wider block">Active Connections</span>
                  <p className="text-lg font-extrabold text-slate-100">5 Active / 100 Max</p>
                  <span className="text-slate-500 text-xxs font-semibold block">Avg Query Latency: 0.42ms</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold text-xxs uppercase tracking-wider block">Database Size on Disk</span>
                  <p className="text-lg font-extrabold text-slate-100">16 Collections | 1.8 MB</p>
                  <span className="text-slate-500 text-xxs font-semibold block">Indexes size: 320 KB on disk</span>
                </div>
              </div>

              {/* Primary Schema Row Count Panels */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'users', count: mockUsers.length + 120, size: '48 KB', color: 'border-blue-100 bg-blue-50/20 text-blue-700' },
                  { name: 'hotels', count: hotels.length, size: '150 KB', color: 'border-indigo-100 bg-indigo-50/20 text-indigo-700' },
                  { name: 'bookings', count: bookings.length + 3, size: '12 KB', color: 'border-amber-100 bg-amber-50/20 text-amber-700' },
                  { name: 'invoices', count: bookings.length + 3, size: '10 KB', color: 'border-emerald-100 bg-emerald-50/20 text-emerald-700' }
                ].map(panel => (
                  <div key={panel.name} className={`p-4 border rounded-2xl text-left space-y-1 ${panel.color}`}>
                    <span className="font-mono text-xs font-black block leading-none">col_{panel.name}</span>
                    <p className="text-xl font-black text-slate-900 mt-1.5 leading-none">{(panel.count).toLocaleString()} docs</p>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">disk size: {panel.size}</span>
                  </div>
                ))}
              </div>

              {/* ERD Schema Map and Tables Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 16 Collections Explorer Sidebar */}
                <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-xs text-slate-850 uppercase tracking-wide flex items-center gap-1.5">
                      <Network size={14} className="text-brand-500" /> Collections ({dbTables.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Autofills query click</span>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {dbTables.map(table => (
                      <button
                        key={table.name}
                        onClick={() => setSqlQuery(`db.${table.name}.find();`)}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-slate-50 transition-all flex justify-between items-center text-xxs font-bold text-slate-650 cursor-pointer"
                        title={table.desc}
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-900 block font-black">{table.name}</span>
                          <span className="text-[9px] text-slate-400 font-medium block leading-none">{table.desc}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="bg-slate-105 text-slate-700 px-1.5 py-0.5 rounded block text-[9px]">{table.rows} docs</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">{table.size}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SQL terminal editor console & ERD Schema schematic diagram */}
                <div className="lg:col-span-8 space-y-6">
                  {/* SQL Terminal Console */}
                  <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <span className="text-xs font-bold font-mono text-slate-400 flex items-center gap-1.5">
                        <Terminal size={14} className="text-brand-500" /> mongosh - MongoDB Shell Console
                      </span>
                      <span className="bg-slate-800 text-slate-300 font-mono text-xxs px-2 py-0.5 rounded">
                        rs: atlas-shard-0
                      </span>
                    </div>

                    <form onSubmit={handleExecuteSql} className="flex gap-2 text-xs font-mono">
                      <span className="text-brand-500 select-none font-bold">staysphere&gt;</span>
                      <input
                        type="text"
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-100 caret-white"
                      />
                      <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-3 py-1 rounded-lg border-none cursor-pointer">
                        Run Query
                      </button>
                    </form>

                    <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-52 pt-4 border-t border-slate-900 select-all">
                      <p className="text-slate-500 text-xxs">// Click on any collection in the catalog sidebar to pre-populate find() syntax query console</p>
                      {sqlTerminalLogs.map((log, idx) => (
                        <div key={idx} className="space-y-1 text-left">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Query: {log.query}</span>
                            <span>Executed in {log.timeMs}ms</span>
                          </div>
                          <pre className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-slate-300 overflow-x-auto text-[10px] whitespace-pre-wrap font-mono">
                            {typeof log.result === 'string'
                              ? log.result
                              : JSON.stringify(log.result, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collapsible ERD schematic map diagram */}
                  <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Network size={16} className="text-indigo-500" />
                      <span>StaySphere Database Reference Map Schema</span>
                    </h4>

                    {/* Simple ERD schematic flow boxes mapping */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xxs font-semibold text-slate-650 pt-2 font-mono">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                        <span className="font-black text-slate-900 block border-b border-slate-100 pb-1">COLLECTION: users</span>
                        <p className="text-[10px]"><span className="text-brand-600 font-bold">_id (Long)</span></p>
                        <p className="text-[10px]">role (Enum)</p>
                        <p className="text-[10px]">email (String)</p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 flex flex-col justify-center items-center text-center">
                        <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Reference mapping</span>
                        <div className="flex items-center gap-1 my-1">
                          <span>users._id</span>
                          <ArrowRight size={12} className="text-brand-500" />
                          <span>bookings.user</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>hotels._id</span>
                          <ArrowRight size={12} className="text-brand-500" />
                          <span>rooms.hotel</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                        <span className="font-black text-slate-900 block border-b border-slate-100 pb-1">COLLECTION: bookings</span>
                        <p className="text-[10px]"><span className="text-brand-600 font-bold">_id (String)</span></p>
                        <p className="text-[10px]">room (String - Ref)</p>
                        <p className="text-[10px]">user (Long - Ref)</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-none">System Settings</h2>
                <p className="text-slate-500 text-xs mt-2">Manage StaySphere global application configurations, integrations, and database operations.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-6 text-xs font-bold text-slate-700">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 m-0 border-b border-slate-200 pb-2">Global System Toggles</h3>
                  
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-xxs">
                    <div>
                      <h4 className="font-extrabold text-slate-800 m-0">Auto-Approve Partner Hotel Listings</h4>
                      <p className="text-slate-400 font-semibold text-[10px] m-0 mt-0.5">Automatically accept hotels submitted by partners without admin manual queue approvals.</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-xxs">
                    <div>
                      <h4 className="font-extrabold text-slate-800 m-0">Real-Time MongoDB Atlas Sync Alerts</h4>
                      <p className="text-slate-400 font-semibold text-[10px] m-0 mt-0.5">Send instant push notifications and logs for user registration & bookings.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-xxs">
                    <div>
                      <h4 className="font-extrabold text-slate-800 m-0">AI Assistant Grounding Mode (RAG)</h4>
                      <p className="text-slate-400 font-semibold text-[10px] m-0 mt-0.5">Feed active hotels database profiles directly as context to the chat concierge client.</p>
                    </div>
                    <input type="checkbox" defaultChecked disabled className="w-4 h-4 accent-[#2563EB] cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 m-0 border-b border-slate-200 pb-2">Database Backup & Logs</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => toast.success('Database backup initiated successfully to MongoDB Atlas Cloud!')}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold py-3 px-4 rounded-xl border-none cursor-pointer text-center"
                    >
                      Backup Database
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success('Platform activity audit logs compiled!')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold py-3 px-4 rounded-xl border-none cursor-pointer text-center"
                    >
                      Compile System Logs
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-xs font-bold text-slate-800 text-left">
            <div>
              <h3 className="text-lg font-black text-slate-900">Add Staff Member</h3>
              <p className="text-slate-455 font-semibold">Create a reception or housekeeping staff workspace account.</p>
            </div>
            
            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya"
                    value={staffFirstName}
                    onChange={(e) => setStaffFirstName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white font-semibold text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel"
                    value={staffLastName}
                    onChange={(e) => setStaffLastName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya.staff@staysphere.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 99999-00002"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider">Workspace Password</label>
                <input
                  type="password"
                  required
                  placeholder="Set workspace password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-655 px-4 py-2 rounded-xl bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="bg-[#2563EB] hover:bg-blue-600 disabled:bg-blue-400 text-white px-5 py-2 rounded-xl border-none cursor-pointer"
                >
                  {staffLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

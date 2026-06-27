import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Landmark, Mail, Lock, Phone, User, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const BecomePartner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password || !hotelName || !hotelAddress) {
      toast.error('Please fill out all onboarding fields.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.registerPartner({
        firstName,
        lastName,
        email,
        phone,
        password,
        hotelName,
        hotelAddress,
      });
      setSubmitted(true);
      toast.success('Onboarding application submitted!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-[#F8FAFC] font-jakarta">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100/50 text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Landmark size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
            <p className="text-slate-500 text-xs font-bold leading-relaxed">
              Your partnership request has been received and is pending administrative review. We will notify you once approved.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex text-left font-jakarta bg-[#F8FAFC]">
      {/* LEFT SIDE (45% Desktop Info Split) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
            alt="Palace Hotel Partner View"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>

        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white">StaySphere</span>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#2563EB] text-xxs font-extrabold tracking-widest uppercase">
              <Sparkles size={12} className="text-[#D4A017] animate-pulse" />
              <span>Property Partner Portal</span>
            </div>
            <h1 className="text-4xl font-black leading-tight m-0 text-white">
              Grow Your Hospitality <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
                Business with Us
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-sm leading-relaxed font-semibold">
              Join India's premium boutique resort collective. Access reservations tools, automated housekeeping, invoice builders, and revenue logs.
            </p>
          </div>

          <div className="text-slate-400 text-xxs font-bold uppercase tracking-wider">
            © 2026 StaySphere Hospitality Group Ltd.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (55% Form Container) */}
      <div className="flex-grow lg:w-[55%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100/50 my-6">
          <div className="space-y-2 text-center sm:text-left mb-6">
            <h2 className="text-2xl font-black text-slate-900 m-0">Become a Hotel Partner</h2>
            <p className="text-slate-450 text-xs font-bold leading-none">Complete onboarding request to register your property.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-left">
            {/* Personal Details */}
            <div className="border-b border-slate-100 pb-4 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">Owner / Manager Details</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider">First Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      required
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <label className="block text-slate-550 uppercase tracking-wider">Contact Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-slate-400" size={14} />
                    <input
                      type="email"
                      required
                      placeholder="partner@yourbrand.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-550 uppercase tracking-wider">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 text-slate-400" size={14} />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765-43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-3">
                <label className="block text-slate-500 uppercase tracking-wider">Portal Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-slate-400" size={14} />
                  <input
                    type="password"
                    required
                    placeholder="Set account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">Hotel / Resort Information</span>
              <div className="space-y-1">
                <label className="block text-slate-500 uppercase tracking-wider">Property Name</label>
                <div className="relative flex items-center">
                  <Landmark className="absolute left-3.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Resort"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1 mt-3">
                <label className="block text-slate-500 uppercase tracking-wider">Property Address</label>
                <div className="relative flex items-start">
                  <MapPin className="absolute left-3.5 top-3 text-slate-400" size={14} />
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter complete physical address details"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-600 disabled:bg-blue-400 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-6"
            >
              <span>{loading ? 'Submitting...' : 'Submit Partnership Application'}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default BecomePartner;

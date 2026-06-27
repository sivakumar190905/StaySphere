import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Phone, MapPin } from 'lucide-react';
import logoSymbol from '../../assets/staysphere_logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={logoSymbol}
                alt="StaySphere Logo"
                className="w-8 h-8 object-contain"
              />
              <h1 className="font-jakarta text-[20px] font-extrabold tracking-tight m-0 select-none text-white leading-none">
                <span>Stay</span>
                <span className="text-brand-500">Sphere</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Your gateway to unforgettable stays, luxury heritage resorts, and boutique palaces across India. Book with peace of mind.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all text-xxs font-bold text-slate-400">FB</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all text-xxs font-bold text-slate-400">TW</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all text-xxs font-bold text-slate-400">IG</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all text-xxs font-bold text-slate-400">LI</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Popular Destinations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Featured Resorts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Special Member Deals</a></li>
              <li><Link to="/become-partner" className="hover:text-white transition-colors font-bold">Become a Partner</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center / FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cancel Booking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Refund Policies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Connected</h4>
            <p className="text-sm text-slate-400">Subscribe to our newsletter for exclusive weekly discounts and travel guides.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-full"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <Mail size={16} />
              </button>
            </form>
            <div className="pt-2 text-xs space-y-1.5 text-slate-500">
              <div className="flex items-center gap-1.5"><Phone size={12} /><span>+91 (80) 555-STAY</span></div>
              <div className="flex items-center gap-1.5"><MapPin size={12} /><span>StaySphere HQ, Indiranagar, Bengaluru, Karnataka, India</span></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} StaySphere Inc. Designed for demo showcase. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1"><Globe size={12} /><span>English (IN)</span></div>
            <span>INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Logo } from '../common/Logo';
import { Heart, User, Shield, Briefcase, Menu, X, Calendar, ChevronDown, Bell, LogOut, Globe, Search, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { favorites, setCurrentRole, isAuthenticated, currentUser, logout, notifications, markNotificationsRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Dropdown States
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = React.useState(false);

  // Selector choices
  const [selectedLang, setSelectedLang] = React.useState('EN');
  const [selectedCurr, setSelectedCurr] = React.useState('INR');

  // Refs for click outside
  const profileRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const langRef = React.useRef<HTMLDivElement>(null);
  const currRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (currRef.current && !currRef.current.contains(target)) {
        setCurrDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const centerLinks = [
    { label: 'Home', href: '/' },
    { label: 'Hotels', href: '/search' },
    { label: 'Deals', href: '#deals' },
    { label: 'Support', href: '/support' },
  ];

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.substring(1);
      if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/${href}`);
      }
    } else {
      e.preventDefault();
      navigate(href);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 h-[76px] backdrop-blur-[12px] bg-white/80 border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full gap-4">
          
          {/* LEFT: Logo & Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-3" onClick={() => setCurrentRole('guest')}>
              <Logo size={28} showText={true} />
              <div className="hidden lg:flex flex-col border-l border-slate-200 pl-3.5 text-left select-none">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none font-mono">Premium Indian Hotels</span>
                <span className="text-[8px] font-bold text-slate-400 mt-1 tracking-wider leading-none">Palaces & Resorts</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {centerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href, link.label)}
                className={`text-xs font-black tracking-wider uppercase transition-colors relative py-1.5 group ${
                  isActive(link.href) ? 'text-[#2563EB]' : 'text-slate-550 hover:text-[#2563EB]'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-[#2563EB] rounded-full transition-all duration-300 ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </a>
            ))}
          </div>

          {/* RIGHT: Search, Selectors, AI Concierge, Profile dropdown */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 ml-auto">
            {/* Search Trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-slate-555 font-bold text-xs transition-all cursor-pointer w-[140px] lg:w-[220px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Search size={13} className="text-slate-450" />
                <span className="text-slate-450 font-semibold">Search...</span>
              </div>
              <kbd className="text-[9px] bg-white px-1 py-0.5 rounded border shadow-xxs font-mono text-slate-400">⌘K</kbd>
            </button>

            {/* Language Selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-slate-550 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer border-none bg-transparent"
              >
                <Globe size={15} />
                <span>{selectedLang}</span>
                <ChevronDown size={10} className="text-slate-455" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-1.5 border border-slate-100 z-50 text-xs font-bold text-slate-705 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                  {['EN', 'HI', 'TA', 'KA'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      {lang === 'EN' ? 'English (EN)' : lang === 'HI' ? 'Hindi (HI)' : lang === 'TA' ? 'Tamil (TA)' : 'Kannada (KA)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div ref={currRef} className="relative">
              <button
                onClick={() => setCurrDropdownOpen(!currDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-slate-550 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer border-none bg-transparent"
              >
                <span className="font-extrabold text-[12px]">₹</span>
                <span>{selectedCurr}</span>
                <ChevronDown size={10} className="text-slate-455" />
              </button>
              {currDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-1.5 border border-slate-100 z-50 text-xs font-bold text-slate-705 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                  {['INR', 'USD', 'EUR', 'GBP'].map(curr => (
                    <button
                      key={curr}
                      onClick={() => {
                        setSelectedCurr(curr);
                        setCurrDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      {curr === 'INR' ? 'Rupees (₹)' : curr === 'USD' ? 'Dollars ($)' : curr === 'EUR' ? 'Euros (€)' : 'Pounds (£)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ✨ AI Concierge Link */}
            <Link
              to="/ai-assistant"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-slate-700 hover:text-[#2563EB] hover:bg-blue-50/50 transition-all border border-slate-150 bg-white/50 backdrop-blur-sm"
            >
              <span>✨ AI Concierge</span>
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="flex items-center gap-1.5 p-2 rounded-xl text-slate-550 hover:text-rose-500 hover:bg-rose-50/50 transition-all relative"
            >
              <Heart size={16} className={favorites.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-450'} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[8px] font-black leading-none text-white bg-rose-500 rounded-full border border-white">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-550 hover:text-[#2563EB] hover:bg-blue-50/30 transition-all relative border-none bg-transparent cursor-pointer"
              >
                <Bell size={16} className="text-slate-450" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[8px] font-black text-white bg-[#2563EB] rounded-full border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-3 border border-slate-100 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markNotificationsRead}
                        className="text-[10px] font-extrabold text-[#2563EB] hover:text-blue-600 bg-transparent border-none cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 text-left ${
                            !n.read ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-xs text-slate-800">{n.title}</p>
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown or Sign In */}
            {isAuthenticated && currentUser ? (
              <div ref={profileRef} className="relative pl-2 border-l border-slate-200">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50/80 transition-all cursor-pointer border-none bg-transparent"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="User Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xxs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black border border-blue-100 uppercase font-mono shadow-xxs">
                      {currentUser.firstName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-slate-700 text-xs font-extrabold hidden lg:inline">{currentUser.firstName}</span>
                  <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl py-2 border border-slate-100/80 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-extrabold text-slate-800 text-xs leading-none">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {currentUser.role === 'STAFF' ? 'Staff Desk' : currentUser.role === 'PARTNER' ? 'Partner Space' : currentUser.role === 'ADMIN' ? 'Admin Portal' : 'Member'}
                      </p>
                    </div>
                    
                    {currentUser.role === 'PARTNER' && (
                      <button
                        onClick={() => {
                          navigate('/partner');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-xs font-bold text-[#2563EB] flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Briefcase size={13} className="text-[#2563EB]" />
                        <span>Partner Cockpit</span>
                      </button>
                    )}
                    {currentUser.role === 'STAFF' && (
                      <button
                        onClick={() => {
                          navigate('/staff');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-xs font-bold text-[#2563EB] flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Calendar size={13} className="text-[#2563EB]" />
                        <span>Operations Desk</span>
                      </button>
                    )}
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-55 text-xs font-bold text-[#2563EB] flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                      >
                        <Shield size={13} className="text-[#2563EB]" />
                        <span>Admin Console</span>
                      </button>
                    )}
                    
                    {/* User Profile Links */}
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <User size={13} className="text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/bookings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <Calendar size={13} className="text-slate-400" />
                      <span>My Bookings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/wishlist');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <Heart size={13} className="text-slate-400" />
                      <span>Wishlist</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard', { state: { activeTab: 'settings' } });
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-bold text-slate-650 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <Settings size={13} className="text-slate-400" />
                      <span>Settings</span>
                    </button>
                    
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2 transition-all bg-transparent border-none cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/10 shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Icon */}
          <div className="flex items-center md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 focus:outline-none border-none bg-transparent cursor-pointer animate-fade-in"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {centerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  handleNavLinkClick(e, link.href, link.label);
                  setMobileMenuOpen(false);
                }}
                className="block px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-all text-left"
              >
                {link.label}
              </a>
            ))}
            
            {/* ✨ Mobile AI Concierge */}
            <Link
              to="/ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-750 hover:bg-blue-50 hover:text-[#2563EB] transition-all text-left"
            >
              ✨ AI Concierge
            </Link>
          </div>

          {/* User profile controls on Mobile */}
          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated && currentUser ? (
              <>
                <div className="flex items-center gap-3 px-3 py-1">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Mobile Profile"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center text-sm font-black border border-slate-200 uppercase font-mono">
                      {currentUser.firstName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-extrabold text-slate-800 text-sm">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {currentUser.role === 'STAFF' ? 'Staff Desk' : currentUser.role === 'PARTNER' ? 'Partner Space' : currentUser.role === 'ADMIN' ? 'Admin Portal' : 'Member'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  {currentUser.role === 'PARTNER' && (
                    <Link
                      to="/partner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-all"
                    >
                      <Briefcase size={14} />
                      <span>Partner Cockpit</span>
                    </Link>
                  )}
                  {currentUser.role === 'STAFF' && (
                    <Link
                      to="/staff"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-all"
                    >
                      <Calendar size={14} />
                      <span>Operations Desk</span>
                    </Link>
                  )}
                  {currentUser.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-all"
                    >
                      <Shield size={14} />
                      <span>Admin Console</span>
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    <User size={14} className="text-slate-450" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    <Calendar size={14} className="text-slate-450" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart size={14} className={favorites.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-450'} />
                      <span>Wishlist</span>
                    </div>
                    {favorites.length > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-650 hover:bg-red-50 transition-all bg-transparent border-none text-left cursor-pointer"
                  >
                    <LogOut size={14} className="text-slate-450" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3.5 py-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 text-center"
                >
                  Sign In to StaySphere
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

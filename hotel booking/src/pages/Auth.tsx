import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../services/api';
import { Logo } from '../components/common/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Mail, Lock, Phone } from 'lucide-react';
import { useToast } from '../components/common/Toast';

interface AuthProps {
  mode: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ mode: initialMode }) => {
  const navigate = useNavigate();
  const { login, signUp, isAuthenticated, currentUser } = useApp();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot/Reset password states
  const [authSubMode, setAuthSubMode] = useState<'login' | 'forgot' | 'reset' | 'verify'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Sign up fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [stats, setStats] = useState({ hotels: 200, cities: 20, rooms: 2000 });

  useEffect(() => {
    fetch('http://localhost:8080/api/public/stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.hotels) {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sync mode with route path change
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (currentUser.role === 'PARTNER') {
        navigate('/partner/dashboard');
      } else if (currentUser.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Luxury Background Images for left side
  const authImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', // Udaipur
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', // Taj Falaknuma
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', // Goa
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80', // Munnar Kerala
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80'  // Agra
  ];
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % authImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in credentials.');
      return;
    }

    try {
      const profile = await login(email, 'CUSTOMER', password);
      toast.success('Signed in successfully!');
      
      // Dynamic Role based redirection targets
      if (profile.role === 'ADMIN') {
        navigate('/admin');
      } else if (profile.role === 'PARTNER') {
        navigate('/partner/dashboard');
      } else if (profile.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const isUnverified = err.message && err.message.toLowerCase().includes('verify your email');
      if (isUnverified) {
        setVerifyEmailAddress(email);
        setAuthSubMode('verify');
        toast.info('Please verify your email address to continue.');
      } else {
        toast.error(err.message || 'Login failed. Please check credentials.');
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !signupPassword || !confirmPassword) {
      toast.error('Please fill out all mandatory fields.');
      return;
    }

    // Validate Full Name components (First Name & Last Name)
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      toast.error('First and Last names must be at least 2 characters.');
      return;
    }

    // Validate Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Validate Phone format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    // Validate Password length
    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    // Validate Password strength
    const hasUppercase = /[A-Z]/.test(signupPassword);
    const hasLowercase = /[a-z]/.test(signupPassword);
    const hasDigit = /\d/.test(signupPassword);
    if (!hasUppercase || !hasLowercase || !hasDigit) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await signUp({
        firstName,
        lastName,
        email,
        phone,
        role: 'CUSTOMER' // Public registration creates CUSTOMER accounts only
      }, signupPassword);
      
      toast.success('Registration Successful! Logging you in...');
      
      // Auto login the newly registered user
      await login(email, 'CUSTOMER', signupPassword);
      
      setSignupPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email.');
      return;
    }
    try {
      await api.auth.forgotPassword(forgotEmail);
      toast.success('Reset code sent to your email!');
      setAuthSubMode('reset');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request reset token.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      toast.error('Please enter the token and new password.');
      return;
    }
    try {
      await api.auth.resetPassword(resetToken, newPassword);
      toast.success('Password reset successfully! Please sign in.');
      setAuthSubMode('login');
      setEmail(forgotEmail);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password.');
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmailAddress || !verificationCode) {
      toast.error('Please enter the verification code.');
      return;
    }
    try {
      await api.auth.verifyEmail(verifyEmailAddress, verificationCode);
      toast.success('Email verified successfully! You can now log in.');
      setAuthSubMode('login');
      setEmail(verifyEmailAddress);
      setVerificationCode('');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please check the code.');
    }
  };

  const handleResendVerificationCode = async () => {
    if (!verifyEmailAddress) {
      toast.error('Email address is missing.');
      return;
    }
    try {
      await api.auth.sendVerification(verifyEmailAddress);
      toast.success('Verification code resent successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex text-left font-jakarta bg-[#F8FAFC]">
      {/* LEFT SIDE (45% Desktop Split Screen) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={authImages[imgIdx]}
              alt="Luxury Escapes Background"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Opaque dark slate overlay */}
          <div className="absolute inset-0 bg-slate-950/65" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-xl p-1.5 shadow-md">
              <Logo size={24} showText={false} />
            </div>
            <span className="font-extrabold text-xl tracking-tight font-jakarta text-white">StaySphere</span>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[#2563EB] text-xxs font-extrabold tracking-widest uppercase">
              <Sparkles size={12} className="text-[#D4A017] animate-pulse" />
              <span>Elite Escapes Travel</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight m-0 text-white">
              Find Your Next <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
                Indian Escape
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-sm leading-relaxed font-semibold">
              Book premium resorts, luxury hotels, and unique heritage palace stays across Indian cities and towns.
            </p>

            {/* Statistics indicators */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-sm">
              <div>
                <p className="text-2xl font-black text-white leading-none">{stats.hotels}+</p>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1.5 block">Hotels</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none">{stats.cities}+</p>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1.5 block">Cities</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none">{stats.rooms}+</p>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1.5 block">Rooms</span>
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-xxs font-bold uppercase tracking-wider">
            © 2026 StaySphere Hospitality Group Ltd.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (55% Auth Forms) */}
      <div className="flex-grow lg:w-[55%] flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100/50">
          
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {authSubMode === 'login' ? (
                  <>
                    <div className="space-y-2 text-center sm:text-left">
                      <h2 className="text-2xl font-black text-slate-900 m-0">Welcome Back</h2>
                      <p className="text-slate-450 text-xs font-bold leading-none">Sign in to continue your travel journey.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 text-slate-400" size={14} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@domain.com"
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-slate-500 uppercase tracking-wider">Password</label>
                          <button
                            type="button"
                            onClick={() => { setAuthSubMode('forgot'); setForgotEmail(email); }}
                            className="text-[#2563EB] hover:underline text-[10px] bg-transparent border-none cursor-pointer font-bold"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 text-slate-400" size={14} />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center gap-2 cursor-pointer py-1">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 accent-[#2563EB] cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="text-slate-550 select-none cursor-pointer">Keep me signed in on this device</label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-2"
                      >
                        <span>Sign In to Journey</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  </>
                ) : authSubMode === 'forgot' ? (
                  <>
                    <div className="space-y-2 text-center sm:text-left">
                      <h2 className="text-2xl font-black text-slate-900 m-0">Reset Password</h2>
                      <p className="text-slate-450 text-xs font-bold leading-none">Enter your email and we will send you a 6-digit verification code.</p>
                    </div>

                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="block text-slate-550 uppercase tracking-wider">Email Address</label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 text-slate-400" size={14} />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="yourname@domain.com"
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-2"
                      >
                        <span>Send Reset Code</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthSubMode('login')}
                        className="w-full text-slate-400 hover:text-slate-600 py-2 text-xs font-bold bg-transparent border-none cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    </form>
                  </>
                ) : authSubMode === 'reset' ? (
                  <>
                    <div className="space-y-2 text-center sm:text-left">
                      <h2 className="text-2xl font-black text-slate-900 m-0">Enter Reset Code</h2>
                      <p className="text-slate-450 text-xs font-bold leading-none">A 6-digit code has been logged to the console. Enter it below to update your password.</p>
                    </div>

                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase tracking-wider">6-Digit Verification Code</label>
                        <input
                          type="text"
                          required
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors text-center font-mono tracking-widest text-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase tracking-wider">New Password</label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 text-slate-400" size={14} />
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-2"
                      >
                        <span>Update Password</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-center sm:text-left">
                      <h2 className="text-2xl font-black text-slate-900 m-0">Verify Your Email</h2>
                      <p className="text-slate-450 text-xs font-bold leading-none">
                        A 6-digit verification code was sent to <span className="text-[#2563EB]">{verifyEmailAddress}</span>.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyEmailSubmit} className="space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="block text-slate-500 uppercase tracking-wider">6-Digit OTP</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500 transition-colors text-center font-mono tracking-widest text-lg text-slate-900"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-2"
                      >
                        <span>Verify & Activate Account</span>
                        <ArrowRight size={14} />
                      </button>

                      <div className="flex flex-col gap-2 pt-2 items-center">
                        <button
                          type="button"
                          onClick={handleResendVerificationCode}
                          className="text-[#2563EB] hover:underline text-xs font-extrabold bg-transparent border-none cursor-pointer"
                        >
                          Resend Verification Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthSubMode('login')}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-transparent border-none cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* OAuth Dividers */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-x-0 h-px bg-slate-100" />
                  <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider z-10">Or Connect With</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-extrabold text-slate-700">
                  <button className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl bg-white transition-all cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.45 7.5l3.85 2.99C6.22 7.04 8.89 5.04 12 5.04z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.35 3.55l3.65 2.83c2.14-1.98 3.37-4.89 3.37-8.48z"/>
                      <path fill="#FBBC05" d="M5.3 10.49c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.45 2.92C.53 4.75 0 6.81 0 9s.53 4.25 1.45 6.08l3.85-2.99s-.24-.73-.38-1.59z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.65-2.83c-1.01.68-2.31 1.09-3.9 1.12-3.11 0-5.78-2-6.7-5.04l-3.85 2.99C3.37 20.35 7.35 23 12 23z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl bg-white transition-all cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.63.73-1.18 1.87-1.03 2.98 1.11.09 2.25-.56 2.96-1.43z"/>
                    </svg>
                    <span>Apple ID</span>
                  </button>
                </div>

                <div className="text-center pt-2 text-slate-500 font-bold text-xs">
                  Don't have a travel account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setMode('signup'); setPassword(''); }}
                    className="text-[#2563EB] hover:underline font-extrabold border-none bg-transparent cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-5"
              >
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-2xl font-black text-slate-900 m-0">Create Account</h2>
                  <p className="text-slate-450 text-xs font-bold leading-none">Register as a guest traveler to begin your journey.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs font-bold text-left">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-500 uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                      />
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

                  <div className="space-y-1">
                    <label className="block text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-550 uppercase tracking-wider">Phone Number</label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3.5 text-slate-400" size={13} />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765-43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 text-xs border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all mt-2.5"
                  >
                    <span>Register Account</span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                <div className="text-center pt-2 text-slate-500 font-bold text-xs">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setMode('login'); setSignupPassword(''); }}
                    className="text-[#2563EB] hover:underline font-extrabold border-none bg-transparent cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
export default Auth;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSymbol from '../../assets/staysphere_logo.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing StaySphere core...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    if (!isMobile && !isTablet) {
      // Desktop: 0ms duration - bypass loading screen instantly
      onComplete();
      setIsComplete(true);
      return;
    }

    const duration = isMobile ? 2000 : 1500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setStatusText('Welcome to StaySphere!');
        const finishTimeout = setTimeout(() => {
          setIsFadingOut(true);
          const completeTimeout = setTimeout(() => {
            onComplete();
            setIsComplete(true);
          }, 400);
          return () => clearTimeout(completeTimeout);
        }, 200);
        return () => clearTimeout(finishTimeout);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 25) {
      setStatusText('Initializing StaySphere core...');
    } else if (progress < 50) {
      setStatusText('Loading premium Indian resorts & palaces...');
    } else if (progress < 75) {
      setStatusText('Establishing secure database connection pool...');
    } else if (progress < 100) {
      setStatusText('Optimizing interface rendering layouts...');
    }
  }, [progress]);

  // If complete (desktop check), render nothing to prevent flash
  if (isComplete) return null;

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F172A] select-none"
        >
          <div className="max-w-md w-full px-6 flex flex-col items-center text-center space-y-10">
            
            {/* Logo Container with gold rotating swoosh ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Gold swoosh ring animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute w-28 h-28 border border-dashed border-[#D4A017]/50 rounded-full"
              />
              
              {/* Premium brand icon S */}
              <motion.img
                src={logoSymbol}
                alt="StaySphere Symbol"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-16 h-16 object-contain z-10"
              />
            </div>

            {/* Brand Title & Tagline */}
            <div className="space-y-2.5">
              <h2 className="font-jakarta font-extrabold tracking-[-1px] text-3xl text-white m-0">
                <span>Stay</span><span className="text-[#2563EB]">Sphere</span>
              </h2>
              <p className="text-[#D4A017] text-xs font-black uppercase tracking-widest leading-none">
                Find Your Next Indian Escape
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-64 space-y-3 pt-4">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#D4A017] rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-slate-500 font-mono text-[9px] font-bold uppercase tracking-widest">
                <span>Loading Platform</span>
                <span className="text-slate-350">{progress}%</span>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <p className="text-xs font-semibold text-slate-400 min-h-[16px] tracking-wide">
              {statusText}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React from 'react';
import staysphereLogo from '../../assets/staysphere_logo.png';

interface LogoProps {
  className?: string;
  size?: number; // width of the container (default 32)
  showText?: boolean;
  textColorClass?: string; // Text color class
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textColorClass = 'text-[#0F172A]',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Image */}
      <img
        src={staysphereLogo}
        alt="StaySphere Symbol"
        style={{ width: size * 1.25, height: size * 1.25 }}
        className="shrink-0 object-contain"
      />

      {/* Wordmark Text: Visible on Desktop and Tablet (md:flex, sm:flex), hidden only on Mobile */}
      {showText && (
        <span className={`font-jakarta font-extrabold tracking-[-1px] leading-none select-none text-[26px] md:text-[32px] hidden sm:inline-block ${textColorClass}`}>
          <span>Stay</span>
          <span className="text-[#2563EB]">Sphere</span>
        </span>
      )}
    </div>
  );
};

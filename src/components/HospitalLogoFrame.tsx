import React, { useState } from 'react';

interface HospitalLogoFrameProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  withGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const HospitalLogoFrame: React.FC<HospitalLogoFrameProps> = ({
  size = 'md',
  showSubtitle = false,
  withGlow = true,
  className = '',
  onClick,
}) => {
  const [imgSrc, setImgSrc] = useState<string>('/logo/hospital-logo.svg');
  const [hasError, setHasError] = useState<boolean>(false);

  // Size mappings for outer frame
  const sizeClasses = {
    xs: 'w-8 h-8 rounded-lg border',
    sm: 'w-10 h-10 rounded-xl border-2',
    md: 'w-13 h-13 rounded-2xl border-2',
    lg: 'w-18 h-18 rounded-3xl border-2',
    xl: 'w-24 h-24 rounded-3xl border-3',
  };

  const imageSizes = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-13 h-13',
    xl: 'w-18 h-18',
  };

  // Fallback chain if user added hospital-logo.png
  const handleImageError = () => {
    if (imgSrc === '/logo/hospital-logo.svg') {
      setImgSrc('/logo/hospital-logo.png');
    } else if (imgSrc === '/logo/hospital-logo.png') {
      setImgSrc('/logo/logo.png');
    } else {
      setHasError(true);
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Neon Framed Badge */}
      <div className="relative group">
        {/* Animated Neon Red Halo behind Frame */}
        {withGlow && (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 to-red-900 opacity-70 blur-md group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none" />
        )}

        {/* Outer Frame with Red & White Metallic Chamfer */}
        <div 
          className={`relative ${sizeClasses[size]} bg-black border-red-600/90 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-300 group-hover:border-white group-hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]`}
        >
          {/* Inner Corner Accent Accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/80" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/80" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/80" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/80" />

          {/* Logo Content */}
          {!hasError ? (
            <img
              src={imgSrc}
              alt="Hospital Management Official Logo"
              className={`${imageSizes[size]} object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-transform duration-300 group-hover:scale-105`}
              onError={handleImageError}
            />
          ) : (
            /* Vector Fallback if files aren't reachable */
            <div className="flex items-center justify-center text-red-500">
              <svg className={`${imageSizes[size]} animate-pulse`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          )}

          {/* Scanning Sheen Highlight on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        </div>
      </div>

      {/* Optional Brand Title Next to Frame */}
      {showSubtitle && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg sm:text-xl text-white tracking-tight">
              Hospital <span className="text-red-500">Management</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-red-950 text-red-400 border border-red-800 uppercase font-mono">
              Sindh
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-semibold tracking-wide">
            River City Hospital Sukkur
          </span>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';

interface DoctorAvatarProps {
  src?: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  src,
  name,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-xs',
    md: 'w-12 h-12 rounded-xl text-sm',
    lg: 'w-14 h-14 rounded-2xl text-base',
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.replace(/Dr\.?\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'DR').toUpperCase();
  };

  if (!src || hasError) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-zinc-900 border-2 border-red-500/80 text-white font-black flex items-center justify-center shadow-md select-none shrink-0 ${className}`}
        title={name}
      >
        <span>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`${sizeClasses[size]} object-cover border-2 border-red-500/80 shadow-md shrink-0 ${className}`}
      loading="lazy"
    />
  );
};

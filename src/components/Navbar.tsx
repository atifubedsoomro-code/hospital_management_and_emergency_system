import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { 
  Building2, 
  Ambulance, 
  Stethoscope, 
  User, 
  Volume2, 
  VolumeX, 
  LogOut, 
  ShieldCheck,
  Menu
} from 'lucide-react';

interface NavbarProps {
  multiRoleMode?: boolean;
  setMultiRoleMode?: (mode: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { 
    userRole, 
    logout,
    isMuted,
    toggleMute,
    playClickTone,
    isFirestoreConnected,
    setIsGoogleAuthModalOpen,
    toggleSidebar
  } = useHospital();

  const handleToggleAudio = () => {
    playClickTone();
    toggleMute();
  };

  const handleSignOut = () => {
    logout();
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'customer':
        return {
          title: 'Citizen Portal',
          icon: User,
          color: 'text-zinc-200 border-zinc-700 bg-zinc-900',
        };
      case 'ambulance':
        return {
          title: 'Ambulance Cockpit (Unit 04)',
          icon: Ambulance,
          color: 'text-red-400 border-red-800 bg-red-950',
        };
      case 'doctor':
        return {
          title: 'Doctor Station',
          icon: Stethoscope,
          color: 'text-white border-zinc-700 bg-zinc-900',
        };
      case 'management':
        return {
          title: 'Executive Management',
          icon: Building2,
          color: 'text-red-400 border-red-800 bg-red-950',
        };
      default:
        return {
          title: 'Hospital Portal',
          icon: ShieldCheck,
          color: 'text-white border-zinc-700 bg-zinc-900',
        };
    }
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <header className="bg-black/90 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Sidebar Hamburger + Hospital Logo Frame & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 select-none">
            {/* Hamburger button for Sidebar (Visible on Mobile / Tablet) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="lg:hidden text-zinc-300 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer active:scale-95 transition-all"
              aria-label="Open Sidebar Navigation"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-red-500" />
            </button>

            <HospitalLogoFrame size="sm" withGlow={true} />
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-white tracking-tight">
                  Hospital <span className="text-red-500">Management</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 rounded">
                  Sukkur
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="hidden md:inline">River City Emergency Network</span>
                <span className="hidden md:inline text-zinc-600">·</span>
                <span 
                  className="inline-flex items-center gap-1 font-mono text-zinc-400"
                  title="Persistent synchronization via Firebase Firestore"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isFirestoreConnected ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`} />
                  <span className="hidden lg:inline">{isFirestoreConnected ? 'Firestore Active' : 'Connecting'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Current Authenticated Role Badge (ONLY shows current role - NO other role buttons) */}
          <div className="flex items-center">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${badge.color}`}>
              <BadgeIcon className="w-4 h-4 text-red-500 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">{badge.title}</span>
            </div>
          </div>

          {/* Right Hand Actions: Audio Toggle, Firebase Profile, and Sign Out */}
          <div className="flex items-center gap-2">
            {/* Audio Mute/Unmute Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className="text-zinc-300 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-red-500 cursor-pointer transition-all active:scale-95"
              aria-label={isMuted ? 'Audio Muted - Click to Unmute' : 'Audio Active - Click to Mute'}
              title={isMuted ? 'Audio Muted (Click to Unmute)' : 'Audio Active (Click to Mute)'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
              )}
            </button>

            {/* Firebase Account Profile Trigger */}
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setIsGoogleAuthModalOpen(true);
              }}
              className="hidden sm:flex text-zinc-300 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-red-500 cursor-pointer transition-all active:scale-95"
              title="Firebase Profile & Project Details"
              aria-label="Firebase Profile & Project Details"
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:border-white active:scale-95 btn-neon-red"
              title="Sign Out to Role Selection"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { 
  Building2, 
  Ambulance, 
  Stethoscope, 
  User, 
  LayoutGrid, 
  Volume2, 
  VolumeX, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';

interface NavbarProps {
  multiRoleMode: boolean;
  setMultiRoleMode: (mode: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ multiRoleMode, setMultiRoleMode }) => {
  const { 
    userRole, 
    setUserRole, 
    logout,
    dispatches,
    isMuted,
    toggleMute,
    playClickTone,
    isFirestoreConnected,
    setIsGoogleAuthModalOpen
  } = useHospital();

  const activeDispatchesCount = dispatches.filter((d) => d.status !== 'handover_completed').length;

  const handleRoleSelect = (role: 'management' | 'ambulance' | 'doctor' | 'customer') => {
    playClickTone();
    setUserRole(role);
  };

  const handleToggleAudio = () => {
    playClickTone();
    toggleMute();
  };

  const handleToggleMultiRole = () => {
    playClickTone();
    setMultiRoleMode(!multiRoleMode);
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <header className="bg-black/90 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Framed Hospital Logo & Brand Title */}
          <div className="flex items-center gap-3 select-none">
            <HospitalLogoFrame size="sm" withGlow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-white tracking-tight">
                  Hospital <span className="text-red-500">Management</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 rounded">
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

          {/* Desktop Role Perspective Switcher */}
          {!multiRoleMode && (
            <nav className="hidden lg:flex items-center bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => handleRoleSelect('management')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'management'
                    ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.6)] font-black border border-red-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Management</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ambulance')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'ambulance'
                    ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.6)] font-black border border-red-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>Ambulance</span>
                {activeDispatchesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('doctor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'doctor'
                    ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.6)] font-black border border-red-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Station</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'customer'
                    ? 'bg-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.6)] font-black border border-red-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Citizen Portal</span>
              </button>
            </nav>
          )}

          {/* Right Hand Actions */}
          <div className="flex items-center gap-2">
            {/* Multi-role tri-view toggle */}
            <button
              type="button"
              onClick={handleToggleMultiRole}
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                multiRoleMode
                  ? 'bg-white text-black border-white shadow-[0_0_14px_rgba(255,255,255,0.7)] font-black'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-red-500'
              }`}
              title="View all 3 operational perspectives side-by-side"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-red-500" />
              <span>{multiRoleMode ? 'Single View' : 'Tri-View'}</span>
            </button>

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
              title="Firebase Profile & Cloud Details"
              aria-label="Firebase Profile & Cloud Details"
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:border-white active:scale-95 btn-neon-red"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {!multiRoleMode && (
          <nav className="flex lg:hidden py-2 border-t border-zinc-800 gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleRoleSelect('management')}
              className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'management' ? 'bg-red-600 text-white font-black shadow-md border border-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('ambulance')}
              className={`flex-1 min-w-[95px] py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'ambulance' ? 'bg-red-600 text-white font-black shadow-md border border-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>Ambulance {activeDispatchesCount > 0 ? `(${activeDispatchesCount})` : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('doctor')}
              className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'doctor' ? 'bg-red-600 text-white font-black shadow-md border border-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('customer')}
              className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userRole === 'customer' ? 'bg-red-600 text-white font-black shadow-md border border-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { UserRole } from '../types';

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
    toggleMute 
  } = useHospital();

  const activeDispatchesCount = dispatches.filter((d) => d.status !== 'handover_completed').length;

  return (
    <header className="bg-black/95 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950/80 border border-red-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">
                  Pulse<span className="text-red-500">Sync</span> Sukkur
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-black bg-zinc-900 text-red-400 border border-red-800/80 font-mono uppercase">
                  Sindh Network
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block">River City Hospital Sukkur Emergency Network</p>
            </div>
          </div>

          {/* Role Perspective Switcher Tabs */}
          {!multiRoleMode && (
            <div className="hidden lg:flex items-center bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setUserRole('management')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'management'
                    ? 'bg-red-600 text-white shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🏢</span>
                <span>Management Command</span>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('ambulance')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'ambulance'
                    ? 'bg-red-600 text-white shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🚑</span>
                <span>Ambulance Driver</span>
                {activeDispatchesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setUserRole('doctor')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'doctor'
                    ? 'bg-red-600 text-white shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🩺</span>
                <span>Doctor Station</span>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('customer')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userRole === 'customer'
                    ? 'bg-red-600 text-white shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>👤</span>
                <span>Citizen Portal</span>
              </button>
            </div>
          )}

          {/* Right Hand Actions */}
          <div className="flex items-center gap-2">
            {/* Multi-role split screen toggle */}
            <button
              type="button"
              onClick={() => setMultiRoleMode(!multiRoleMode)}
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                multiRoleMode
                  ? 'bg-white text-black border-white shadow-md font-black'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
              }`}
              title="View all roles side-by-side"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>{multiRoleMode ? 'Single View' : 'Tri-View'}</span>
            </button>

            {/* Audio siren toggle */}
            <button
              onClick={toggleMute}
              className="text-zinc-300 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-700 cursor-pointer"
              title={isMuted ? 'Audio Alerts Muted' : 'Audio Alerts Active'}
            >
              {isMuted ? <span className="text-xs">🔇</span> : <span className="text-xs">🔊</span>}
            </button>

            {/* Log Out button */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Sign out and return to role selection login page"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Role Bar */}
        {!multiRoleMode && (
          <div className="flex lg:hidden py-2 border-t border-zinc-800 gap-1.5 overflow-x-auto">
            <button
              onClick={() => setUserRole('management')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                userRole === 'management' ? 'bg-red-600 text-white font-black' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              🏢 Management
            </button>
            <button
              onClick={() => setUserRole('ambulance')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                userRole === 'ambulance' ? 'bg-red-600 text-white font-black' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              🚑 Ambulance
            </button>
            <button
              onClick={() => setUserRole('doctor')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                userRole === 'doctor' ? 'bg-red-600 text-white font-black' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              🩺 Doctor
            </button>
            <button
              onClick={() => setUserRole('customer')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                userRole === 'customer' ? 'bg-red-600 text-white font-black' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              👤 Citizen
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

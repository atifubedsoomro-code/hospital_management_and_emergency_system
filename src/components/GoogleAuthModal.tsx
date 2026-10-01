import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { ShieldCheck, X, LogOut, Check } from 'lucide-react';

export const GoogleAuthModal: React.FC = () => {
  const { 
    currentUser, 
    handleGoogleSignIn, 
    logout, 
    loginAsGuest,
    loginWithCredentials,
    userRole, 
    isGoogleAuthModalOpen, 
    setIsGoogleAuthModalOpen,
    playClickTone 
  } = useHospital();

  if (!isGoogleAuthModalOpen) return null;

  const handleClose = () => {
    playClickTone();
    setIsGoogleAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-950 text-red-500 flex items-center justify-center border border-red-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-black text-base sm:text-lg text-white">Firebase Authentication</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-black p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full border border-red-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-lg">
                  {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Google Authenticated</span>
                <h4 className="font-bold text-white truncate">{currentUser.displayName || currentUser.email}</h4>
                <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              Active Session Role: <strong className="text-red-500 uppercase">{userRole}</strong>
            </div>

            <button
              onClick={() => {
                logout();
                setIsGoogleAuthModalOpen(false);
              }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 font-bold py-2.5 rounded-xl border border-zinc-700 text-xs transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from Firebase</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300">
              Sign in with your Google credentials or choose a quick test role. Secure session tokens provide encrypted real-time synchronization between Sukkur hospitals, ambulances, and doctors.
            </p>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => {
                playClickTone();
                handleGoogleSignIn(userRole);
              }}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-zinc-200 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <span className="absolute inset-x-0 h-px bg-zinc-800" />
              <span className="relative bg-zinc-950 px-3 text-[10px] text-zinc-500 uppercase font-mono font-bold">
                Or Quick Switch Role
              </span>
            </div>

            {/* Quick Demo Role Picker */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  playClickTone();
                  loginWithCredentials('management', 'admin', 'admin');
                  setIsGoogleAuthModalOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-white block">Hospital Management (River City Sukkur)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">admin / admin</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">Select</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickTone();
                  loginAsGuest('ambulance');
                  setIsGoogleAuthModalOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-white block">Sindh Rescue 1122 Ambulance</span>
                  <span className="text-[10px] text-zinc-400 font-mono">1-Tap Rapid Access</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">Select</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickTone();
                  loginWithCredentials('doctor', 'doctor', 'doctor');
                  setIsGoogleAuthModalOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-white block">Dr. Tariq Soomro (Surgeon)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">doctor / doctor</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800">Select</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
          <span>Firebase Project: <strong className="text-white font-mono">hospital-management-3b3f6</strong></span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { loginAsGuest, loginWithCredentials, handleGoogleSignIn } = useHospital();

  // Active view: 'credentials' for Doctor/Management or 'instant' for Ambulance/Citizen
  const [activeTab, setActiveTab] = useState<'credentials' | 'instant'>('credentials');

  // Credentials form state
  const [credentialRole, setCredentialRole] = useState<'doctor' | 'management'>('doctor');
  const [username, setUsername] = useState<string>('doctor');
  const [password, setPassword] = useState<string>('doctor');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectCredentialRole = (role: 'doctor' | 'management') => {
    setCredentialRole(role);
    setErrorMessage('');
    if (role === 'doctor') {
      setUsername('doctor');
      setPassword('doctor');
    } else {
      setUsername('admin');
      setPassword('admin');
    }
  };

  const handleFillDoctor = () => {
    setCredentialRole('doctor');
    setUsername('doctor');
    setPassword('doctor');
    setErrorMessage('');
  };

  const handleFillAdmin = () => {
    setCredentialRole('management');
    setUsername('admin');
    setPassword('admin');
    setErrorMessage('');
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = loginWithCredentials(credentialRole, username, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Red Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white shadow-2xl shadow-red-950/80 mb-1 border border-red-500">
            <svg className="w-9 h-9 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pulse<span className="text-red-500">Sync</span> Sukkur
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase tracking-wider">
              Emergency Network
            </span>
          </div>

          <p className="text-sm font-semibold text-zinc-200">
            River City Hospital Sukkur & Sindh Regional Medical Dispatch Portal
          </p>
          <p className="text-xs text-zinc-400">
            Unified real-time hospitalization synchronization across Doctors, Management, Ambulances, and Citizens
          </p>
        </div>

        {/* Primary Navigation Tabs: Credentials vs Instant Access */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-black rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
              activeTab === 'credentials'
                ? 'bg-red-600 text-white shadow-xl shadow-red-950/60 ring-1 ring-red-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>🔐</span>
            <span>Manual Credentials Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instant')}
            className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
              activeTab === 'instant'
                ? 'bg-white text-black shadow-xl ring-1 ring-zinc-300'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>⚡</span>
            <span>1-Tap Instant Access</span>
          </button>
        </div>

        {/* TAB 1: MANUAL CREDENTIALS LOGIN (DOCTORS & MANAGEMENT) */}
        {activeTab === 'credentials' && (
          <div className="space-y-5">
            {/* Role Switcher between Doctor and Management */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Select Login Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectCredentialRole('doctor')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    credentialRole === 'doctor'
                      ? 'bg-zinc-900 border-red-500 text-white shadow-xl ring-2 ring-red-600'
                      : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🩺</span>
                    <div>
                      <span className="font-black text-sm block text-white">Doctor Station</span>
                      <span className="text-[11px] text-zinc-400 block font-mono">doctor / doctor</span>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${credentialRole === 'doctor' ? 'bg-red-500' : 'bg-zinc-700'}`}></span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCredentialRole('management')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    credentialRole === 'management'
                      ? 'bg-zinc-900 border-red-500 text-white shadow-xl ring-2 ring-red-600'
                      : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <span className="font-black text-sm block text-white">Management</span>
                      <span className="text-[11px] text-zinc-400 block font-mono">admin / admin</span>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${credentialRole === 'management' ? 'bg-red-500' : 'bg-zinc-700'}`}></span>
                </button>
              </div>
            </div>

            {/* Quick-fill helper buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
              <span className="text-zinc-400 font-medium">Quick Credentials:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillDoctor}
                  className="bg-black hover:bg-zinc-800 text-white px-2.5 py-1 rounded-lg border border-zinc-700 font-mono text-[11px] font-bold cursor-pointer transition-all"
                >
                  Fill Doctor (doctor/doctor)
                </button>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="bg-black hover:bg-zinc-800 text-white px-2.5 py-1 rounded-lg border border-zinc-700 font-mono text-[11px] font-bold cursor-pointer transition-all"
                >
                  Fill Admin (admin/admin)
                </button>
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-bold text-center">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Username Field */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    placeholder={credentialRole === 'doctor' ? 'doctor' : 'admin'}
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                    {credentialRole === 'doctor' ? 'Default: doctor' : 'Default: admin'}
                  </span>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    placeholder={credentialRole === 'doctor' ? 'doctor' : 'admin'}
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                    {credentialRole === 'doctor' ? 'Default: doctor' : 'Default: admin'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] uppercase tracking-wider"
              >
                <span>
                  Sign In as {credentialRole === 'doctor' ? 'Doctor (On-Duty Specialist)' : 'Hospital Management'}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: 1-TAP INSTANT ACCESS (AMBULANCES & CITIZENS) */}
        {activeTab === 'instant' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <span className="font-bold text-white block mb-0.5">
                ⚡ No Username or Password Required
              </span>
              Ambulance drivers and emergency patients can bypass credentials for immediate life-saving response in Sukkur.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ambulance Card */}
              <div className="bg-black border border-zinc-800 hover:border-red-600/70 p-5 rounded-2xl flex flex-col justify-between transition-all space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚑</span>
                    <div>
                      <h3 className="font-black text-white text-base">Ambulance Driver</h3>
                      <span className="text-[10px] text-red-400 font-mono">Sindh Rescue 1122 & Edhi</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Rapid patient intake, GPS telemetry streaming, and automated nearest facility routing to River City Hospital Sukkur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loginAsGuest('ambulance')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3 px-3 rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                >
                  <span>Launch Ambulance Cockpit</span>
                  <span>→</span>
                </button>
              </div>

              {/* Citizen Card */}
              <div className="bg-black border border-zinc-800 hover:border-white/70 p-5 rounded-2xl flex flex-col justify-between transition-all space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👤</span>
                    <div>
                      <h3 className="font-black text-white text-base">Citizen / Patient</h3>
                      <span className="text-[10px] text-zinc-400 font-mono">Sukkur Emergency Public</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Live ICU bed counts across Sukkur hospitals, emergency helpline direct dial, and 1-tap rapid ambulance pickup request.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loginAsGuest('customer')}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-black text-xs py-3 px-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                >
                  <span>Enter Citizen Portal</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Authentication Option */}
        <div className="pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => handleGoogleSignIn(credentialRole)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 text-xs transition-all cursor-pointer border border-zinc-700 shadow-md"
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
            <span>Or Authenticate with Google (Firebase)</span>
          </button>
        </div>

        {/* Footer Facility List */}
        <div className="text-center text-[11px] text-zinc-500 pt-1 font-mono">
          River City Hospital Sukkur • Civil Hospital Sukkur • NICVD Sukkur • SIUT Sukkur
        </div>
      </div>
    </div>
  );
};

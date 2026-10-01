import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { 
  KeyRound, 
  Zap, 
  Stethoscope, 
  Building2, 
  Ambulance, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAsGuest, loginWithCredentials, handleGoogleSignIn, isFirestoreConnected, playClickTone } = useHospital();

  // Active view: 'credentials' for Doctor/Management or 'instant' for Ambulance/Citizen
  const [activeTab, setActiveTab] = useState<'credentials' | 'instant'>('credentials');

  // Credentials form state
  const [credentialRole, setCredentialRole] = useState<'doctor' | 'management'>('doctor');
  const [username, setUsername] = useState<string>('doctor');
  const [password, setPassword] = useState<string>('doctor');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectTab = (tab: 'credentials' | 'instant') => {
    playClickTone();
    setActiveTab(tab);
    setErrorMessage('');
  };

  const handleSelectCredentialRole = (role: 'doctor' | 'management') => {
    playClickTone();
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
    playClickTone();
    setCredentialRole('doctor');
    setUsername('doctor');
    setPassword('doctor');
    setErrorMessage('');
  };

  const handleFillAdmin = () => {
    playClickTone();
    setCredentialRole('management');
    setUsername('admin');
    setPassword('admin');
    setErrorMessage('');
  };

  const handleTogglePassword = () => {
    playClickTone();
    setShowPassword(!showPassword);
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickTone();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = loginWithCredentials(credentialRole, username, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials');
    }
    setIsSubmitting(false);
  };

  const handleInstantLogin = (role: 'ambulance' | 'customer') => {
    playClickTone();
    loginAsGuest(role);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Background Animated Neon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[680px] h-[420px] sm:h-[680px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-lg w-full bg-zinc-950/95 border border-red-600/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(239,68,68,0.35)] relative z-10 space-y-6 neon-card-glow backdrop-blur-2xl">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center space-y-3">
          <HospitalLogoFrame size="lg" withGlow={true} />

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hospital <span className="text-red-500">Management</span>
            </h1>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
              <span>River City Sukkur</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Emergency Network</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <span className={`w-1.5 h-1.5 rounded-full ${isFirestoreConnected ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`} />
                <span>{isFirestoreConnected ? 'Firestore Active' : 'Connecting'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Clean Segmented Tab Control */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => handleSelectTab('credentials')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'credentials'
                ? 'bg-red-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.6)] font-black border border-red-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Credentials Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('instant')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.6)] font-black border border-zinc-200'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Zap className="w-4 h-4 text-red-600" />
            <span>1-Tap Instant Entry</span>
          </button>
        </div>

        {/* TAB 1: MANUAL CREDENTIALS LOGIN */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Select Sign-In Portal
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectCredentialRole('doctor')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    credentialRole === 'doctor'
                      ? 'bg-zinc-900 border-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)] ring-1 ring-red-500'
                      : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-red-500 shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-xs sm:text-sm block text-white truncate">Doctor</span>
                      <span className="text-[10px] text-zinc-500 font-mono">doctor / doctor</span>
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${credentialRole === 'doctor' ? 'bg-red-500' : 'bg-zinc-700'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCredentialRole('management')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    credentialRole === 'management'
                      ? 'bg-zinc-900 border-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,0.4)] ring-1 ring-red-500'
                      : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-red-500 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-xs sm:text-sm block text-white truncate">Admin</span>
                      <span className="text-[10px] text-zinc-500 font-mono">admin / admin</span>
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${credentialRole === 'management' ? 'bg-red-500' : 'bg-zinc-700'}`} />
                </button>
              </div>
            </div>

            {/* Quick Helper Autofill */}
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-black border border-zinc-800">
              <span className="text-zinc-400 text-[11px]">Quick Credentials:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFillDoctor}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-2.5 py-1 rounded-lg border border-zinc-700 font-mono text-[10px] font-bold cursor-pointer transition-all hover:border-red-500"
                >
                  doctor
                </button>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-2.5 py-1 rounded-lg border border-zinc-700 font-mono text-[10px] font-bold cursor-pointer transition-all hover:border-red-500"
                >
                  admin
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleCredentialSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 uppercase tracking-wider">
                  Username / ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder={credentialRole === 'doctor' ? 'doctor' : 'admin'}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="text-[11px] text-zinc-400 hover:text-white cursor-pointer font-medium flex items-center gap-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder={credentialRole === 'doctor' ? 'doctor' : 'admin'}
                  required
                />
              </div>

              {/* Submit Button with Hover & Feedback */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-sm py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center justify-center gap-2 cursor-pointer btn-neon-red uppercase tracking-wider border border-red-400"
              >
                <span>Sign In to {credentialRole === 'doctor' ? 'Doctor Station' : 'Hospital Management'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: 1-TAP FAST ACCESS (AMBULANCES & CITIZENS) */}
        {activeTab === 'instant' && (
          <div className="space-y-3.5">
            <p className="text-xs text-zinc-400">
              Immediate access for emergency dispatchers, rescue drivers, and Sukkur residents without credential barriers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ambulance Card */}
              <div className="bg-black border border-zinc-800 hover:border-red-600 p-4 rounded-2xl flex flex-col justify-between transition-all space-y-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-red-500">
                      <Ambulance className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Ambulance Unit</h3>
                      <span className="text-[10px] text-zinc-400 font-mono">Rescue 1122 & Edhi</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Patient triage intake, GPS telemetry, and facility routing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleInstantLogin('ambulance')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-lg btn-neon-red flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <span>Launch Cockpit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Citizen Card */}
              <div className="bg-black border border-zinc-800 hover:border-white p-4 rounded-2xl flex flex-col justify-between transition-all space-y-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Citizen Portal</h3>
                      <span className="text-[10px] text-zinc-400 font-mono">Sukkur Residents</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Live ICU bed counts, hotlines, and 1-tap ambulance request.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleInstantLogin('customer')}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-xs py-2.5 px-3 rounded-xl shadow-lg btn-neon-white flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <span>Open Citizen Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Utility / Firebase Google Sign-In */}
        <div className="pt-2 border-t border-zinc-800 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playClickTone();
              handleGoogleSignIn(credentialRole);
            }}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer border border-zinc-800 hover:border-zinc-600 btn-ghost-zinc"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-zinc-500 font-mono">
            River City Hospital · Civil Hospital · NICVD · SIUT
          </p>
        </div>

      </div>
    </div>
  );
};

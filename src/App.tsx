import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { ManagementView } from './components/ManagementView';
import { AmbulanceView } from './components/AmbulanceView';
import { DoctorView } from './components/DoctorView';
import { CustomerView } from './components/CustomerView';
import { NotificationBanner } from './components/NotificationBanner';
import { GoogleAuthModal } from './components/GoogleAuthModal';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, userRole } = useHospital();
  const [multiRoleMode, setMultiRoleMode] = useState<boolean>(false);

  // If not authenticated, render the dedicated Red & Black Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar multiRoleMode={multiRoleMode} setMultiRoleMode={setMultiRoleMode} />

      {/* Real-time Push Notification Toaster & Drawer */}
      <NotificationBanner />

      {/* Google Authentication Modal */}
      <GoogleAuthModal />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {multiRoleMode ? (
          /* Tri-View Mode: Observe Real-Time Sync Across All Roles Simultaneously */
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-red-600/40 rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Sukkur Region Tri-Perspective Real-Time Sync
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Interact with any column below (update patient status, doctor availability, or hospital assets) to observe instant real-time synchronization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMultiRoleMode(false)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-700 cursor-pointer uppercase"
              >
                Close Tri-View
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Perspective 1: Ambulance Driver */}
              <div className="space-y-3">
                <div className="bg-zinc-950 border border-red-600/60 rounded-2xl px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚑</span>
                    <span className="font-black text-xs text-red-500 uppercase">Ambulance Cockpit</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Sindh Rescue 1122</span>
                </div>
                <div className="bg-black rounded-3xl p-2 border border-zinc-800">
                  <AmbulanceView />
                </div>
              </div>

              {/* Perspective 2: Doctor Station */}
              <div className="space-y-3">
                <div className="bg-zinc-950 border border-red-600/60 rounded-2xl px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🩺</span>
                    <span className="font-black text-xs text-white uppercase">Doctor Console</span>
                  </div>
                  <span className="text-[10px] text-red-400 font-mono">River City Hospital</span>
                </div>
                <div className="bg-black rounded-3xl p-2 border border-zinc-800">
                  <DoctorView />
                </div>
              </div>

              {/* Perspective 3: Hospital Management */}
              <div className="space-y-3">
                <div className="bg-zinc-950 border border-red-600/60 rounded-2xl px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏢</span>
                    <span className="font-black text-xs text-red-500 uppercase">Management Command</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Capacity & Assets</span>
                </div>
                <div className="bg-black rounded-3xl p-2 border border-zinc-800">
                  <ManagementView />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single Dedicated Role View */
          <div>
            {userRole === 'management' && <ManagementView />}
            {userRole === 'ambulance' && <AmbulanceView />}
            {userRole === 'doctor' && <DoctorView />}
            {userRole === 'customer' && <CustomerView />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 py-4 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-white font-bold">River City Hospital Sukkur Network</span>
            </div>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-zinc-300 text-[11px]">DB: hospital-management-3b3f6</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Sukkur, Sindh, Pakistan</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-zinc-400">
              <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted Real-Time Sync
            </span>
            <span className="text-zinc-600">|</span>
            <span>PulseSync Sukkur Emergency Network © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <DashboardContent />
    </HospitalProvider>
  );
}

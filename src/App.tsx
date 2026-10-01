import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ManagementView } from './components/ManagementView';
import { AmbulanceView } from './components/AmbulanceView';
import { DoctorView } from './components/DoctorView';
import { CustomerView } from './components/CustomerView';
import { NotificationBanner } from './components/NotificationBanner';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { HospitalLogoFrame } from './components/HospitalLogoFrame';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, userRole, isFirestoreConnected } = useHospital();

  // If not authenticated, render dedicated Red, Black & White Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row font-sans selection:bg-red-600 selection:text-white">
      {/* Left Sidebar (Fixed on desktop, slide-over drawer on mobile) */}
      <Sidebar />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {/* Top Navbar */}
        <Navbar />

        {/* Real-time Push Notification Toaster & Drawer */}
        <NotificationBanner />

        {/* Google Authentication Modal */}
        <GoogleAuthModal />

        {/* Role Portal Main View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {userRole === 'management' && <ManagementView />}
          {userRole === 'ambulance' && <AmbulanceView />}
          {userRole === 'doctor' && <DoctorView />}
          {userRole === 'customer' && <CustomerView />}
        </main>

        {/* Footer with Framed Logo */}
        <footer className="bg-zinc-950 border-t border-zinc-800 py-4 px-3 sm:px-6 lg:px-8 mt-12 text-xs text-zinc-400">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <HospitalLogoFrame size="xs" withGlow={false} />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-bold">Hospital Management Sukkur Network</span>
              </div>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <span className="font-mono text-zinc-300 text-[11px] hidden sm:inline">River City Hospital Sukkur</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`} />
                <span>Firestore: <strong className="text-white font-mono">hospital-management-3b3f6</strong></span>
              </span>
              <span className="text-zinc-600">|</span>
              <span>Hospital Management © 2026</span>
            </div>
          </div>
        </footer>
      </div>
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

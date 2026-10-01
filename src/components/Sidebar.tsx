import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { 
  LayoutDashboard, 
  Bed, 
  MapPin, 
  Ambulance, 
  Stethoscope, 
  Megaphone, 
  Zap, 
  Navigation, 
  ShieldAlert, 
  Phone, 
  Bell, 
  LogOut, 
  Volume2, 
  VolumeX, 
  X,
  Radio,
  User,
  Building2,
  ShieldCheck
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeAlert?: boolean;
}

export const Sidebar: React.FC = () => {
  const { 
    userRole, 
    activeSection, 
    setActiveSection, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    dispatches, 
    isMuted, 
    toggleMute, 
    logout, 
    playClickTone,
    isFirestoreConnected
  } = useHospital();

  const inboundCount = dispatches.filter((d) => d.status !== 'handover_completed').length;
  const activeTransitDispatch = dispatches.find((d) => d.status === 'transporting' || d.status === 'en_route_scene');

  // Menu items tailored exclusively to each role
  const getMenuItems = (): SidebarItem[] => {
    switch (userRole) {
      case 'management':
        return [
          { id: 'all', label: 'All Dashboard Cards', icon: LayoutDashboard },
          { id: 'assets', label: 'Critical Assets & Beds', icon: Bed },
          { id: 'map', label: 'Emergency Network Map', icon: MapPin },
          { 
            id: 'intakes', 
            label: 'Incoming Ambulance Intakes', 
            icon: Ambulance, 
            badge: inboundCount > 0 ? inboundCount : null,
            badgeAlert: inboundCount > 0
          },
          { id: 'roster', label: 'Staff Schedules & Roster', icon: Stethoscope },
          { id: 'broadcast', label: 'Broadcast Emergency Alert', icon: Megaphone },
        ];

      case 'ambulance':
        return [
          { id: 'intake', label: 'Rapid Patient Intake', icon: Zap },
          { 
            id: 'transit', 
            label: 'Live Transit & Navigation', 
            icon: Navigation, 
            badge: activeTransitDispatch ? `${activeTransitDispatch.etaMinutes}m` : null,
            badgeAlert: Boolean(activeTransitDispatch)
          },
          { id: 'map', label: 'Fast Path Tactical Map', icon: MapPin },
          { id: 'ranking', label: 'Hospital Routing Ranking', icon: ShieldAlert },
          { id: 'all', label: 'All Cockpit Sections', icon: LayoutDashboard },
        ];

      case 'doctor':
        return [
          { id: 'duty', label: 'Duty Station & Shift', icon: Stethoscope },
          { 
            id: 'inbound', 
            label: 'Inbound Emergency Patients', 
            icon: Ambulance, 
            badge: inboundCount > 0 ? inboundCount : null,
            badgeAlert: inboundCount > 0
          },
          { id: 'alerts', label: 'Emergency Alert Feed', icon: Bell },
          { id: 'all', label: 'All Doctor Sections', icon: LayoutDashboard },
        ];

      case 'customer':
        return [
          { id: 'request', label: 'Request Urgent Ambulance', icon: Ambulance },
          { id: 'readiness', label: 'Hospital Readiness & Beds', icon: Bed },
          { id: 'map', label: 'Facilities GIS Map', icon: MapPin },
          { id: 'hotlines', label: 'Emergency Call Hotlines', icon: Phone },
          { id: 'all', label: 'All Citizen Guide Cards', icon: LayoutDashboard },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleItemClick = (id: string) => {
    playClickTone();
    setActiveSection(id);
    setIsSidebarOpen(false); // Close mobile drawer automatically
  };

  const getRoleHeaderInfo = () => {
    switch (userRole) {
      case 'management':
        return { title: 'Executive Management', subtitle: 'River City Sukkur Command', icon: Building2 };
      case 'ambulance':
        return { title: 'Ambulance Cockpit', subtitle: 'Rescue 1122 & Edhi Fleet', icon: Ambulance };
      case 'doctor':
        return { title: 'Doctor Console', subtitle: 'Specialist Duty Station', icon: Stethoscope };
      case 'customer':
        return { title: 'Citizen Emergency Portal', subtitle: 'Sukkur Resident Access', icon: User };
      default:
        return { title: 'Emergency Portal', subtitle: 'Sukkur Network', icon: ShieldCheck };
    }
  };

  const roleInfo = getRoleHeaderInfo();
  const RoleIcon = roleInfo.icon;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-black/95 border-r border-zinc-800 text-white select-none">
      {/* Brand & Framed Logo Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HospitalLogoFrame size="sm" withGlow={true} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white tracking-tight">
                Hospital <span className="text-red-500">Management</span>
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">Sukkur Region</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => {
            playClickTone();
            setIsSidebarOpen(false);
          }}
          className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Authenticated Role Card */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-500 shrink-0">
            <RoleIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">{roleInfo.title}</span>
            <span className="text-[10px] text-zinc-400 block truncate">{roleInfo.subtitle}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 mt-2 border-t border-zinc-900">
          <span className="flex items-center gap-1 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isFirestoreConnected ? 'bg-red-500 animate-ping' : 'bg-zinc-500'}`} />
            <span>{isFirestoreConnected ? 'Firestore Active' : 'Connecting'}</span>
          </span>
          <span className="font-mono text-zinc-500">v4.0</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Portal Views & Cards
        </div>

        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group text-left ${
                isActive
                  ? 'bg-red-950/50 text-white font-bold border-l-4 border-red-500 shadow-md ring-1 ring-red-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-red-500' : 'text-zinc-400 group-hover:text-white'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 ${
                  item.badgeAlert
                    ? 'bg-red-600 text-white animate-pulse shadow-sm'
                    : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Controls: Audio & Sign Out */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/90 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              playClickTone();
              toggleMute();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer transition-all active:scale-95"
            title={isMuted ? 'Audio Muted (Click to Unmute)' : 'Audio Active (Click to Mute)'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px]">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="text-[11px]">Audio On</span>
              </>
            )}
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => {
              logout();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-200 hover:text-white cursor-pointer transition-all active:scale-95 btn-neon-red"
            title="Sign Out to Role Selection"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

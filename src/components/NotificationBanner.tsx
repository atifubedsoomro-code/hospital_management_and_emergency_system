import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Bell, Check, Trash2, Megaphone, X, ShieldAlert } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    broadcastHospitalAlert,
    playClickTone 
  } = useHospital();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentCritical = notifications.find((n) => !n.read && n.urgency === 'critical');

  const handleTestAlert = () => {
    playClickTone();
    broadcastHospitalAlert(
      'CODE STEMI EMERGENCY DISPATCH',
      'Sindh Rescue 1122 transporting critical cardiac patient to NICVD / River City Hospital Sukkur.',
      'critical'
    );
  };

  const handleToggleDrawer = () => {
    playClickTone();
    setIsOpen(!isOpen);
  };

  const handleAcknowledge = (id: string) => {
    playClickTone();
    markNotificationAsRead(id);
  };

  const handleClearAll = () => {
    playClickTone();
    clearAllNotifications();
  };

  return (
    <div className="relative z-50">
      {/* Top Banner Alert if Critical */}
      {recentCritical && (
        <div className="bg-red-700 text-white px-4 py-2 border-b border-red-500 flex items-center justify-between shadow-2xl animate-siren">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            <span className="font-black text-[10px] uppercase tracking-wider bg-black text-red-400 px-2 py-0.5 rounded border border-red-500 shrink-0">
              URGENT ALERT
            </span>
            <span className="text-xs font-bold truncate">
              {recentCritical.title}: {recentCritical.message}
            </span>
            <button
              onClick={() => handleAcknowledge(recentCritical.id)}
              className="ml-auto text-xs bg-black hover:bg-zinc-900 text-white px-3 py-1 rounded-lg border border-red-400 font-bold whitespace-nowrap cursor-pointer uppercase active:scale-95 transition-all"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Floating Notification Button */}
      <div className="fixed bottom-5 right-5 z-[9990] flex items-center gap-2">
        <button
          onClick={handleToggleDrawer}
          className="relative bg-red-600 hover:bg-red-500 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-red-500 btn-neon-red"
          title="Emergency Alerts Dispatch Drawer"
          aria-label="Emergency Alerts Dispatch Drawer"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-[9990] w-96 max-w-[calc(100vw-2.5rem)] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-3.5 bg-black border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                Emergency Dispatch Feed
              </h4>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestAlert}
                className="text-[10px] text-zinc-400 hover:text-white px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                title="Simulate push alert"
              >
                <Megaphone className="w-3 h-3 text-red-400" />
                <span>Simulate</span>
              </button>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[10px] text-zinc-400 hover:text-red-400 p-1 rounded-lg cursor-pointer"
                  title="Clear all alerts"
                  aria-label="Clear all alerts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleDrawer}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer ml-1"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-900 p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                No active hospital notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl mb-1.5 transition-all ${
                    !n.read ? 'bg-zinc-900/80 border border-red-600/40' : 'bg-black/50 text-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      n.urgency === 'critical' ? 'text-red-400' : 'text-zinc-300'
                    }`}>
                      {n.title}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 mb-2 leading-relaxed">
                    {n.message}
                  </p>

                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(n.id)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

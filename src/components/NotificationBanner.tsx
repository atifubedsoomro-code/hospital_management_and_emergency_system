import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';

export const NotificationBanner: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    broadcastHospitalAlert,
    isMuted,
    toggleMute 
  } = useHospital();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentCritical = notifications.find((n) => !n.read && n.urgency === 'critical');

  const handleTestAlert = () => {
    broadcastHospitalAlert(
      'CODE STEMI EMERGENCY DISPATCH',
      'Sindh Rescue 1122 transporting critical cardiac patient to NICVD / River City Hospital Sukkur.',
      'critical'
    );
  };

  return (
    <div className="relative z-50">
      {/* Top Banner Alert if Critical */}
      {recentCritical && (
        <div className="bg-red-700 text-white px-4 py-2 border-b border-red-500 flex items-center justify-between shadow-2xl animate-siren">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <span className="font-black text-xs uppercase tracking-wider bg-black text-red-400 px-2 py-0.5 rounded border border-red-500">
              URGENT ALERT
            </span>
            <span className="text-xs font-bold truncate">
              {recentCritical.title}: {recentCritical.message}
            </span>
            <button
              onClick={() => markNotificationAsRead(recentCritical.id)}
              className="ml-auto text-xs bg-black hover:bg-zinc-900 text-white px-2.5 py-1 rounded-lg border border-red-400 font-bold whitespace-nowrap cursor-pointer uppercase"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Floating Notification Button & Drawer Toggle */}
      <div className="fixed bottom-5 right-5 z-[9990] flex items-center gap-2">
        <button
          onClick={handleTestAlert}
          className="hidden sm:flex items-center gap-1.5 bg-black hover:bg-zinc-900 text-red-400 hover:text-white px-3 py-2 rounded-2xl border border-red-600/50 text-xs font-bold shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          title="Simulate sending a real-time push alert"
        >
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Test Alert
        </button>

        <button
          onClick={toggleMute}
          className="bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white p-2.5 rounded-2xl border border-zinc-700 text-xs font-bold shadow-xl backdrop-blur-md transition-all cursor-pointer"
          title={isMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-red-600 hover:bg-red-500 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-red-500"
          title="Emergency Alerts Dispatch Drawer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
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
          <div className="p-4 bg-black border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h4 className="font-black text-sm text-white uppercase tracking-wider">Emergency Dispatch Log</h4>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-red-400 cursor-pointer uppercase"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                No active notifications in log.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    !n.read ? 'bg-zinc-900 border border-zinc-800' : 'bg-transparent hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      n.urgency === 'critical'
                        ? 'bg-red-950 text-red-300 border border-red-700'
                        : 'bg-zinc-800 text-white border border-zinc-700'
                    }`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

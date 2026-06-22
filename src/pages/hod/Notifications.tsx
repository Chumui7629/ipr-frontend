import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import { FaBell, FaInfoCircle, FaTrash } from 'react-icons/fa';
import { NotificationItem } from '../../types';

const HodNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ipr_hod_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, []);

  const handleClear = () => {
    localStorage.setItem('ipr_hod_notifications', JSON.stringify([]));
    setNotifications([]);
    alert("Notifications cleared.");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Home', link: '/hod/dashboard' }, { label: 'Notifications' }]} />

      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit">
          HOD Notifications
        </h2>
        {notifications.length > 0 && (
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-xl font-semibold text-xs transition-colors"
            onClick={handleClear}
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">System Alerts Inbox</h2>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-outfit">
            <FaBell className="text-5xl text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No notifications found.</p>
            <p className="text-xs text-slate-400 mt-1">System logs and registration reports will appear here when they trigger.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div 
                key={notif.id || idx}
                className="flex gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-outfit"
              >
                <div className="text-gov-primary text-lg mt-0.5">
                  <FaInfoCircle />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-800 leading-tight">{notif.message}</p>
                  <span className="block text-xs text-slate-400 font-medium">{notif.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HodNotifications;

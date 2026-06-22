import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { NotificationItem, User } from '../types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const savedActive = localStorage.getItem('ipr_active_user');
    if (savedActive) {
      try {
        const user: User = JSON.parse(savedActive);
        setUsername(user.username);

        const savedNotifs = localStorage.getItem('ipr_notifications');
        if (savedNotifs) {
          const map = JSON.parse(savedNotifs);
          setNotifications(map[user.username] || []);
        }
      } catch (e) {
        setNotifications([]);
      }
    }
  }, []);

  const handleClear = () => {
    if (username) {
      const savedNotifs = localStorage.getItem('ipr_notifications');
      let map: { [key: string]: NotificationItem[] } = {};
      if (savedNotifs) {
        try { map = JSON.parse(savedNotifs); } catch (e) {}
      }
      map[username] = [];
      localStorage.setItem('ipr_notifications', JSON.stringify(map));
      setNotifications([]);
      alert("Notifications cleared.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-emerald-600 text-sm" />;
      case 'warning':
        return <FaExclamationTriangle className="text-amber-600 text-sm" />;
      case 'danger':
      case 'error':
        return <FaExclamationTriangle className="text-red-650 text-sm" />;
      default:
        return <FaInfoCircle className="text-[#1E4E8C] text-sm" />;
    }
  };

  const getBgAndBorder = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50/40 text-green-700';
      case 'warning': return 'border-amber-200 bg-amber-50/40 text-amber-700';
      case 'danger':
      case 'error': return 'border-red-200 bg-red-50/40 text-red-700';
      default: return 'border-slate-200 bg-slate-50/40 text-slate-850';
    }
  };

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'Home', link: '/employee/dashboard' }, { label: 'Notifications' }]} />

      <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          My Notifications
        </h2>
        {notifications.length > 0 && (
          <button 
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50/50 border border-slate-200 hover:border-red-200 rounded-[6px] transition-colors focus:outline-none bg-white"
            onClick={handleClear}
          >
            <FaTrash className="text-[10px]" /> Clear All
          </button>
        )}
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 border-b border-[#E5E7EB] pb-1.5">Notifications Inbox</h3>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FaBell className="text-3xl text-slate-200 mx-auto mb-2" />
            <p className="font-bold text-xs">No notifications found.</p>
            <p className="text-[11px] text-slate-400 mt-1">System filings and HOD dispatch alerts will show here when sent.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {notifications.map((notif, idx) => (
              <div 
                key={notif.id || idx}
                className={`flex items-start gap-3 p-3 border rounded-[6px] transition-all ${getBgAndBorder(notif.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">{notif.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

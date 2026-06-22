import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { NotificationItem } from '../types';

interface NotificationPanelProps {
  notifications?: NotificationItem[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications = [] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'warning':
        return <FaExclamationCircle className="text-amber-500" />;
      case 'danger':
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-indigo-500" />;
    }
  };

  const getBgAndBorder = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-100 bg-emerald-50/40 text-emerald-800';
      case 'warning': return 'border-amber-100 bg-amber-50/40 text-amber-800';
      case 'danger':
      case 'error': return 'border-red-100 bg-red-50/40 text-red-800';
      default: return 'border-slate-100 bg-slate-50/40 text-slate-800';
    }
  };

  return (
    <div className="flex flex-col gap-3 font-outfit">
      {notifications.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm font-medium">
          No new notifications.
        </div>
      ) : (
        notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`flex items-start gap-3 p-3.5 border rounded-xl transition-all ${getBgAndBorder(notif.type)}`}
          >
            <div className="text-base mt-0.5 flex-shrink-0">
              {getIcon(notif.type)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold leading-relaxed">{notif.message}</p>
              <span className="text-[0.65rem] text-slate-400 font-medium mt-1.5 block">{notif.date}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPanel;

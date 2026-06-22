import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, variant }) => {
  const getIconColor = () => {
    switch (variant) {
      case 'primary': return 'text-[#1E4E8C]';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-amber-600';
      case 'danger': return 'text-red-600';
      case 'info': return 'text-sky-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-[6px] shadow-sm font-sans">
      <div className="flex-1 text-left">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
      </div>
      <div className={`p-2 rounded-[6px] bg-slate-50 border border-[#E5E7EB] flex items-center justify-center ${getIconColor()}`}>
        <span className="text-sm">{icon}</span>
      </div>
    </div>
  );
};

export default DashboardCard;

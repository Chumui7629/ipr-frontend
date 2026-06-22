import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUser, FaBuilding, FaFileAlt, FaFolderOpen, 
  FaHistory, FaChartBar, FaSignOutAlt, FaBars,
  FaCheckCircle, FaBell
} from 'react-icons/fa';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role?: 'employee' | 'hod';
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, role = 'employee' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('activeUserRole');
    localStorage.removeItem('ipr_active_user');
    navigate('/');
  };

  const getLinkClass = (isActive: boolean) => {
    const base = "flex items-center gap-3 px-4 py-2.5 text-xs font-bold border-b border-[#E5E7EB] transition-all ";
    if (isActive) {
      return base + "bg-slate-50 text-[#1E4E8C] border-l-4 border-l-[#1E4E8C]";
    }
    return base + "bg-white text-[#374151] hover:bg-[#F7F8FA] hover:text-[#1E4E8C] border-l-4 border-l-transparent";
  };

  return (
    <aside className={`h-screen bg-white text-[#374151] flex flex-col transition-all duration-300 border-r border-[#E5E7EB] select-none font-sans z-40 relative ${collapsed ? 'w-20' : 'w-[260px]'}`}>
      {/* Header with Government Logo and Portal Title */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB] bg-white">
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-1.5 text-left">
            {/* Government Logo Placeholder */}
            <div className="w-8 h-8 bg-slate-100 border border-[#E5E7EB] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#1E4E8C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">NIC Tripura</span>
              <span className="text-xs font-bold text-[#1E4E8C] leading-none">
                {role === 'hod' ? 'HOD Portal' : 'Employee Portal'}
              </span>
            </div>
          </div>
        )}
        <button 
          className={`p-1.5 rounded-[6px] text-slate-500 hover:text-[#1E4E8C] hover:bg-slate-50 border border-[#E5E7EB] transition-colors focus:outline-none ${collapsed ? 'mx-auto' : ''}`}
          onClick={onToggle} 
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <FaBars className="text-xs" />
        </button>
      </div>

      {/* Menu Options */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
        {role === 'hod' ? (
          <>
            <NavLink to="/hod/dashboard" className={({ isActive }) => getLinkClass(isActive)} end>
              <FaHome className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Home</span>}
            </NavLink>

            <NavLink to="/hod/my-profile" className={({ isActive }) => getLinkClass(isActive)}>
              <FaUser className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">My Profile</span>}
            </NavLink>

            <NavLink to="/hod/employee-list" className={({ isActive }) => getLinkClass(isActive)}>
              <FaUser className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Employee List</span>}
            </NavLink>

            <NavLink to="/hod/send-request" className={({ isActive }) => getLinkClass(isActive)}>
              <FaFileAlt className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Send IPR Request</span>}
            </NavLink>

            <NavLink to="/hod/submission-status" className={({ isActive }) => getLinkClass(isActive)}>
              <FaFolderOpen className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Submission Status</span>}
            </NavLink>

            <NavLink to="/hod/review-approval" className={({ isActive }) => getLinkClass(isActive)}>
              <FaCheckCircle className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Review & Approval</span>}
            </NavLink>

            <NavLink to="/hod/reports" className={({ isActive }) => getLinkClass(isActive)}>
              <FaChartBar className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Reports</span>}
            </NavLink>

            <NavLink to="/hod/notifications" className={({ isActive }) => getLinkClass(isActive)}>
              <FaBell className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Notifications</span>}
            </NavLink>

            <NavLink to="/hod/previous-returns" className={({ isActive }) => getLinkClass(isActive)}>
              <FaHistory className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Previous Returns</span>}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/employee/dashboard" className={({ isActive }) => getLinkClass(isActive)} end>
              <FaHome className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Home</span>}
            </NavLink>

            <NavLink to="/employee/my-profile" className={({ isActive }) => getLinkClass(isActive)}>
              <FaUser className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">My Profile</span>}
            </NavLink>

            <NavLink to="/employee/ipr-property" className={({ isActive }) => getLinkClass(isActive)}>
              <FaBuilding className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">IPR Property</span>}
            </NavLink>

            <NavLink to="/employee/ipr-filing" className={({ isActive }) => getLinkClass(isActive)}>
              <FaFileAlt className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">IPR Filing</span>}
            </NavLink>

            <NavLink to="/employee/my-submissions" className={({ isActive }) => getLinkClass(isActive)}>
              <FaFolderOpen className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">My Submissions</span>}
            </NavLink>

            <NavLink to="/employee/previous-returns" className={({ isActive }) => getLinkClass(isActive)}>
              <FaHistory className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Previous Returns</span>}
            </NavLink>

            <NavLink to="/employee/notifications" className={({ isActive }) => getLinkClass(isActive)}>
              <FaBell className="text-xs flex-shrink-0 text-slate-450" />
              {!collapsed && <span className="truncate">Notifications</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-2 border-t border-[#E5E7EB] bg-white">
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-[6px] text-xs font-bold text-red-650 hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-none ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className="text-xs flex-shrink-0 text-red-500" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

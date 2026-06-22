import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBell, FaChevronDown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { EmployeeProfile, HodProfile } from '../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  employeeInfo: EmployeeProfile | HodProfile | null;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, employeeInfo }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('activeUserRole');
    localStorage.removeItem('ipr_active_user');
    navigate('/');
  };

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const role = localStorage.getItem('activeUserRole');
  const profileLink = role === 'hod' ? '/hod/my-profile' : '/employee/my-profile';

  // Dynamic breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const path = window.location.pathname;
    const isHod = path.includes('/hod');
    
    const homeName = isHod ? 'Home' : 'Home';
    const crumbs = [{ label: homeName, path: isHod ? '/hod/dashboard' : '/employee/dashboard' }];

    if (path.includes('/my-profile')) {
      crumbs.push({ label: 'My Profile', path: '' });
    } else if (path.includes('/ipr-property')) {
      crumbs.push({ label: 'IPR Property', path: '' });
    } else if (path.includes('/ipr-filing')) {
      crumbs.push({ label: 'IPR Filing', path: '' });
    } else if (path.includes('/my-submissions')) {
      crumbs.push({ label: 'My Submissions', path: '' });
    } else if (path.includes('/previous-returns')) {
      crumbs.push({ label: 'Previous Returns', path: '' });
    } else if (path.includes('/notifications')) {
      crumbs.push({ label: 'Notifications', path: '' });
    } else if (path.includes('/employee-list')) {
      crumbs.push({ label: 'Employee List', path: '' });
    } else if (path.includes('/send-request')) {
      crumbs.push({ label: 'Send IPR Request', path: '' });
    } else if (path.includes('/submission-status')) {
      crumbs.push({ label: 'Submission Status', path: '' });
    } else if (path.includes('/review-approval')) {
      crumbs.push({ label: 'Review & Approval', path: '' });
    } else if (path.includes('/reports')) {
      crumbs.push({ label: 'Reports', path: '' });
    } else if (path.includes('/dashboard')) {
      crumbs.push({ label: 'Dashboard', path: '' });
    }
    
    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <nav className="h-16 border-b border-[#E5E7EB] bg-white px-6 flex items-center justify-between font-sans relative z-30 shadow-sm">
      {/* Left Area: Breadcrumbs */}
      <div className="flex items-center text-xs font-semibold text-slate-500 gap-1.5 font-sans" aria-label="Breadcrumb">
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-300 font-bold select-none">&gt;</span>}
            {crumb.path ? (
              <Link to={crumb.path} className="text-[#1E4E8C] hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-bold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Right Area: Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button 
          className="relative p-1.5 text-slate-400 hover:text-[#1E4E8C] transition-colors hover:bg-slate-50 border border-[#E5E7EB] rounded-[6px] focus:outline-none"
          onClick={() => {
            alert("No new actions required. Notifications are available in your panel.");
            setUnreadNotifications(0);
          }}
          title="Notifications"
        >
          <FaBell className="text-sm" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          )}
        </button>
        
        <div className="h-6 w-px bg-[#E5E7EB]"></div>
        
        {/* Profile Dropdown */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none p-1 border border-[#E5E7EB] hover:bg-slate-50 rounded-[6px] transition-all relative" onClick={toggleDropdown}>
          {/* Profile Circle Icon */}
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-[#E5E7EB] text-[#1E4E8C] flex items-center justify-center text-xs font-bold">
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-700 leading-tight">
              {employeeInfo?.name || 'User Profile'}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {employeeInfo?.designation || 'Staff Member'}
            </span>
          </div>
          <FaChevronDown className="text-slate-400 text-[10px] transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-[6px] shadow-md border border-[#E5E7EB] py-1 overflow-hidden z-50">
              <Link to={profileLink} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-[#F7F8FA] transition-colors font-bold">
                <FaUser className="text-slate-400 text-[10px]" /> My Profile
              </Link>
              <button 
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-[#F7F8FA] transition-colors font-bold text-left"
                onClick={() => alert("System managed by NIC Tripura state admin.")}
              >
                <FaCog className="text-slate-400 text-[10px]" /> settings
              </button>
              <div className="border-t border-[#E5E7EB] my-1"></div>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-655 hover:bg-red-50/50 transition-colors font-bold text-left"
              >
                <FaSignOutAlt className="text-red-550 text-[10px]" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import { FaLock, FaSave } from 'react-icons/fa';
import { User } from '../../types';

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    department: '',
    service: '',
    designation: '',
    placeOfPosting: '',
    joiningDate: '',
    permanentAddress: '',
    presentAddress: ''
  });

  const [role, setRole] = useState<'employee' | 'hod'>('employee');
  const [username, setUsername] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Edit profile form state
  const [editForm, setEditForm] = useState<any>({ ...profile });
  // Password form state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Load from localStorage if present
  useEffect(() => {
    const savedActive = localStorage.getItem('ipr_active_user');
    if (savedActive) {
      try {
        const user: User = JSON.parse(savedActive);
        setRole(user.role);
        setUsername(user.username);
        setProfile(user.profile);
        setEditForm(user.profile);
      } catch (e) {
        console.error("Failed to parse saved active user.", e);
      }
    }
  }, []);

  const calculateServiceYears = (joining?: string) => {
    if (!joining) return 0;
    const joinDate = new Date(joining);
    const today = new Date();
    let years = today.getFullYear() - joinDate.getFullYear();
    const m = today.getMonth() - joinDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < joinDate.getDate())) {
      years--;
    }
    return years;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);

    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(err) {}
    }

    const updatedUsers = users.map(u => {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return { ...u, profile: editForm };
      }
      return u;
    });
    localStorage.setItem('ipr_users', JSON.stringify(updatedUsers));

    const active = { role, username, profile: editForm };
    localStorage.setItem('ipr_active_user', JSON.stringify(active));

    setEditModalOpen(false);
    alert("Profile updated successfully!");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(err) {}
    }

    const matchedIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (matchedIndex !== -1) {
      if (users[matchedIndex].password !== passwordForm.oldPassword) {
        alert("Incorrect current password!");
        return;
      }
      users[matchedIndex].password = passwordForm.newPassword;
      localStorage.setItem('ipr_users', JSON.stringify(users));
      alert("Password updated successfully!");
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordModalOpen(false);
    } else {
      alert("User session not found.");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'My Profile' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
        {/* Left Card: Avatar & Summary */}
        <div className="lg:col-span-1 bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-[#E5E7EB] text-[#1E4E8C] flex items-center justify-center text-xl font-bold">
            {getInitials(profile.name)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-snug">{profile.name || 'Official Name'}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{profile.designation}</p>
          </div>
          <div className="w-full space-y-2 pt-2">
            <button 
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold transition-colors focus:outline-none" 
              onClick={() => { setEditForm({ ...profile }); setEditModalOpen(true); }}
            >
              Edit Profile Details
            </button>
            <button 
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] text-xs font-bold transition-colors focus:outline-none" 
              onClick={() => setPasswordModalOpen(true)}
            >
              <FaLock className="text-[10px]" /> Change Password
            </button>
          </div>
        </div>

        {/* Right Details Grid */}
        <div className="lg:col-span-2 space-y-4">

          {/* Section 1: Personal Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs font-sans">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Full Name</span>
                <span className="font-semibold text-slate-700">{profile.name || 'N/A'}</span>
              </div>
              {role === 'employee' && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Employee ID</span>
                  <span className="font-semibold text-slate-700">{profile.employeeId || 'N/A'}</span>
                </div>
              )}
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Email Address</span>
                <span className="font-semibold text-slate-700">{profile.email || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
                <span className="font-semibold text-slate-700">{profile.phone || 'N/A'}</span>
              </div>
              {role === 'employee' && (
                <>
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Date of Birth</span>
                    <span className="font-semibold text-slate-700">{profile.dob || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Gender</span>
                    <span className="font-semibold text-slate-700">{profile.gender}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Service Details */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">{role === 'hod' ? 'Office Information' : 'Service Information'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs font-sans">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Government Department</span>
                <span className="font-semibold text-slate-700">{profile.department || 'N/A'}</span>
              </div>
              {role === 'employee' && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Service Cadre</span>
                  <span className="font-semibold text-slate-700">{profile.service || 'N/A'}</span>
                </div>
              )}
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Designation</span>
                <span className="font-semibold text-slate-700">{profile.designation || 'N/A'}</span>
              </div>
              {role === 'employee' && (
                <>
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Place of Posting</span>
                    <span className="font-semibold text-slate-700">{profile.placeOfPosting || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Joining Date</span>
                    <span className="font-semibold text-slate-700">{profile.joiningDate || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Service Length</span>
                    <span className="font-semibold text-slate-700">{calculateServiceYears(profile.joiningDate)} Years</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Addresses */}
          {role === 'employee' && (
            <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">Address Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Present Address</span>
                  <span className="font-medium text-slate-600 leading-relaxed">{profile.presentAddress || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Permanent Address</span>
                  <span className="font-medium text-slate-600 leading-relaxed">{profile.permanentAddress || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-[6px] shadow-md border border-[#cbd5e1] overflow-hidden my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd5e1] bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Edit Profile Information</h3>
              <button className="text-slate-400 hover:text-slate-600 font-bold text-sm" onClick={() => setEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-4 space-y-3 text-left text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-semibold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                    />
                  </div>
                  {role === 'employee' && (
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-slate-500 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C] font-mono"
                      />
                    </div>
                  )}
                </div>

                {role === 'employee' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-slate-500 mb-1">Place of Posting</label>
                      <input
                        type="text"
                        value={editForm.placeOfPosting}
                        onChange={(e) => setEditForm({ ...editForm, placeOfPosting: e.target.value })}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-slate-500 mb-1">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {role === 'employee' && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-slate-500 mb-1">Present Address</label>
                      <textarea
                        rows={2}
                        value={editForm.presentAddress}
                        onChange={(e) => setEditForm({ ...editForm, presentAddress: e.target.value })}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-semibold text-slate-500 mb-1">Permanent Address</label>
                      <textarea
                        rows={2}
                        value={editForm.permanentAddress}
                        onChange={(e) => setEditForm({ ...editForm, permanentAddress: e.target.value })}
                        required
                        className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-[#cbd5e1]">
                <button type="button" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-[6px] border border-[#cbd5e1] bg-white transition-colors focus:outline-none" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none"><FaSave /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-[6px] shadow-md border border-[#cbd5e1] overflow-hidden my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd5e1] bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Change Password</h3>
              <button className="text-slate-400 hover:text-slate-600 font-bold text-sm" onClick={() => setPasswordModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-4 space-y-3 text-left text-xs font-sans">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-[#cbd5e1]">
                <button type="button" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-[6px] border border-[#cbd5e1] bg-white transition-colors focus:outline-none" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

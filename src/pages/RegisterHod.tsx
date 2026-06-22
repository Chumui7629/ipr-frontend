import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaBuilding, FaBriefcase } from 'react-icons/fa';
import { User } from '../types';

const RegisterHod: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    designation: 'Head of Department (IT)',
    department: 'Information Technology (IT)',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try {
        users = JSON.parse(savedUsers);
      } catch (err) {
        users = [];
      }
    }

    const userExists = users.some(u => u.username.toLowerCase() === formData.username.toLowerCase());
    if (userExists) {
      alert("Username already exists! Please choose another one.");
      return;
    }

    const newUser: User = {
      role: 'hod',
      username: formData.username,
      password: formData.password,
      profile: {
        name: formData.name,
        designation: formData.designation,
        department: formData.department,
        email: formData.email,
        phone: formData.phone
      }
    };

    users.push(newUser);
    localStorage.setItem('ipr_users', JSON.stringify(users));

    alert("HOD Account registered successfully! You can now log in.");
    navigate('/');
  };

  return (
    <div className="w-full font-sans max-w-lg mx-auto text-left">
      <h2 className="text-sm font-bold text-[#1E4E8C] text-center uppercase tracking-wider mb-4 pb-1 border-b border-slate-200">
        Head of Department (HOD) Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Credentials */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-slate-200 pb-1">
            HOD Account Credentials
          </h4>
          
          <div className="space-y-1">
            <label htmlFor="username" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FaUser className="text-xs" />
              </span>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter unique HOD username"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaLock className="text-xs" />
                </span>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaLock className="text-xs" />
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-type password"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="space-y-2 pt-2">
          <h4 className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-slate-200 pb-1">
            Official Designation Info
          </h4>
          
          <div className="space-y-1">
            <label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Officer Name *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FaUser className="text-xs" />
              </span>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Dr. A. K. Debbarma"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="designation" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Designation *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaBriefcase className="text-xs" />
                </span>
                <input
                  type="text"
                  id="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="department" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaBuilding className="text-xs" />
                </span>
                <input
                  type="text"
                  id="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaEnvelope className="text-xs" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="dept-head@tripura.gov.in"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaPhone className="text-xs" />
                </span>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-2 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none mt-4"
        >
          Create HOD Account
        </button>

        <div className="text-center pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
          <span>Already registered? </span>
          <Link to="/" className="text-[#1E4E8C] hover:underline">
            Sign In here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterHod;

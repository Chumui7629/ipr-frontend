import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaCalendarAlt, FaBuilding, FaIdCard, FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa';
import { User } from '../types';

const RegisterEmployee: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    department: 'Information Technology (IT)',
    service: 'Tripura State Civil Services',
    designation: 'Senior Assistant',
    placeOfPosting: 'Civil Secretariat, Agartala',
    joiningDate: '',
    permanentAddress: '',
    presentAddress: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      role: 'employee',
      username: formData.username,
      password: formData.password,
      profile: {
        name: formData.name,
        employeeId: formData.employeeId,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        department: formData.department,
        service: formData.service,
        designation: formData.designation,
        placeOfPosting: formData.placeOfPosting,
        joiningDate: formData.joiningDate,
        permanentAddress: formData.permanentAddress,
        presentAddress: formData.presentAddress
      }
    };

    users.push(newUser);
    localStorage.setItem('ipr_users', JSON.stringify(users));

    alert("Employee Account registered successfully! You can now log in.");
    navigate('/');
  };

  return (
    <div className="w-full font-sans max-w-xl mx-auto text-left">
      <h2 className="text-sm font-bold text-[#1E4E8C] text-center uppercase tracking-wider mb-4 pb-1 border-b border-slate-200">
        Government Employee Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Section 1: Credentials */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-slate-200 pb-1">
            Account Credentials
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  placeholder="Username"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
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
                  placeholder="Confirm password"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: General details */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-slate-200 pb-1">
            Personal Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaUser className="text-xs" />
                </span>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="employeeId" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee ID *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaIdCard className="text-xs" />
                </span>
                <input
                  type="text"
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g. EMP837482"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaEnvelope className="text-xs" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="username@tripura.gov.in"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="dob" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaCalendarAlt className="text-xs" />
                </span>
                <input
                  type="date"
                  id="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="gender" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender *</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-bold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Service Details */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-slate-200 pb-1">
            Service & Posting Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="space-y-1">
              <label htmlFor="service" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service Cadre *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaBriefcase className="text-xs" />
                </span>
                <input
                  type="text"
                  id="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label htmlFor="placeOfPosting" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Place of Posting *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaMapMarkerAlt className="text-xs" />
                </span>
                <input
                  type="text"
                  id="placeOfPosting"
                  value={formData.placeOfPosting}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="joiningDate" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Joining Date *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaCalendarAlt className="text-xs" />
                </span>
                <input
                  type="date"
                  id="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Address */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-slate-200 pb-1">
            Address
          </h4>
          <div className="space-y-1">
            <label htmlFor="presentAddress" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Present Address *</label>
            <textarea
              id="presentAddress"
              rows={2}
              value={formData.presentAddress}
              onChange={handleInputChange}
              placeholder="Enter present address"
              required
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="permanentAddress" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Permanent Address *</label>
            <textarea
              id="permanentAddress"
              rows={2}
              value={formData.permanentAddress}
              onChange={handleInputChange}
              placeholder="Enter permanent address"
              required
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
            />
          </div>
        </div>

        {/* Action button */}
        <button 
          type="submit" 
          className="w-full py-2.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none mt-4"
        >
          Register Account
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

export default RegisterEmployee;

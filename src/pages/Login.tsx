import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaUserShield } from 'react-icons/fa';
import { User } from '../types';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hod' | 'employee'>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try {
        users = JSON.parse(savedUsers);
      } catch (err) {
        users = [];
      }
    }

    const matched = users.find(u =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password &&
      u.role === activeTab
    );

    if (matched) {
      localStorage.setItem('activeUserRole', matched.role);
      localStorage.setItem('ipr_active_user', JSON.stringify(matched));

      if (matched.role === 'hod') {
        navigate('/hod/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } else {
      alert(`Authentication failed: Invalid ${activeTab} username or password.\n\nPlease register a new account if you haven't already.`);
    }
  };

  return (
    <div className="w-full font-sans max-w-sm mx-auto">
      <h2 className="text-sm font-bold text-[#1E4E8C] text-center uppercase tracking-wider mb-4 pb-1 border-b border-slate-200">
        Sign In to Your Account
      </h2>

      {/* Role Selection Tabs */}
      <div className="flex bg-slate-100 p-0.5 rounded-[6px] mb-4 border border-slate-200/50">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[6px] text-xs font-bold transition-all focus:outline-none ${activeTab === 'hod' ? 'bg-white text-[#1E4E8C] shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('hod')}
        >
          <FaUserShield className="text-xs" />
          HOD
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-[6px] text-xs font-bold transition-all focus:outline-none ${activeTab === 'employee' ? 'bg-white text-[#1E4E8C] shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('employee')}
        >
          <FaUser className="text-xs" />
          Employee
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username */}
        <div className="space-y-1 text-left">
          <label htmlFor="username" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FaUser className="text-xs" />
            </span>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={`Enter ${activeTab} username`}
              required
              autoComplete="username"
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1 text-left">
          <label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FaLock className="text-xs" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full pl-8 pr-9 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              onClick={handleTogglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between text-xs font-bold py-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-800">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded-[4px] text-[#1E4E8C] border-slate-200 focus:ring-[#1E4E8C]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[#1E4E8C] hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none"
        >
          Sign In
        </button>

        {/* Footers */}
        <div className="border-t border-slate-150 pt-4 flex flex-col gap-1.5 text-center text-xs font-bold text-slate-500">
          <div>
            <span>New Employee? </span>
            <Link to="/register/employee" className="text-[#1E4E8C] hover:underline">
              Register here
            </Link>
          </div>
          <div>
            <span>New HOD? </span>
            <Link to="/register/hod" className="text-[#1E4E8C] hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;

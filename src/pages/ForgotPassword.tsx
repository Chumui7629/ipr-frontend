import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaKey } from 'react-icons/fa';
import { User } from '../types';

const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: identify user, 2: reset password
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleVerifyUser = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(err) {}
    }

    const matched = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.profile?.email?.toLowerCase() === email.toLowerCase()
    );

    if (matched) {
      setFoundUser(matched);
      setStep(2);
    } else {
      alert("No matching user found with the provided Username and Email.");
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!foundUser) return;

    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(err) {}
    }

    const updatedUsers = users.map(u => {
      if (u.username.toLowerCase() === foundUser.username.toLowerCase()) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    localStorage.setItem('ipr_users', JSON.stringify(updatedUsers));
    alert("Password reset successful! Redirecting to login page...");
    navigate('/');
  };

  return (
    <div className="w-full font-sans max-w-sm mx-auto text-left">
      <h2 className="text-sm font-bold text-[#1E4E8C] text-center uppercase tracking-wider mb-4 pb-1 border-b border-slate-200">
        Account Recovery
      </h2>

      {step === 1 ? (
        <form onSubmit={handleVerifyUser} className="space-y-3.5">
          <p className="text-[11px] font-semibold text-slate-500 text-center leading-relaxed mb-2">
            Enter your username and registered email address to verify your identity.
          </p>

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
                placeholder="Enter username"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Registered Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FaEnvelope className="text-xs" />
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none mt-2"
          >
            Verify Account Details
          </button>

          <div className="text-center pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
            <span>Remembered? </span>
            <Link to="/" className="text-[#1E4E8C] hover:underline">
              Sign In here
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordReset} className="space-y-3.5">
          <div className="flex items-center justify-center gap-2 p-2 bg-green-50 border border-green-200 text-green-700 rounded-[6px] text-[11px] font-bold text-center mb-2">
            <FaKey className="text-green-600 flex-shrink-0" />
            <span>Account Verified: {foundUser?.profile?.name}</span>
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="newPassword" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FaLock className="text-xs" />
              </span>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FaLock className="text-xs" />
              </span>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] transition-all font-sans"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none mt-2"
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

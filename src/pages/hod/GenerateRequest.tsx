import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { FaCalendarAlt, FaBullhorn, FaExclamationTriangle } from 'react-icons/fa';
import { User, IprRequest } from '../../types';

const GenerateRequest: React.FC = () => {
  const navigate = useNavigate();
  const [reportingYear, setReportingYear] = useState('2025-26');
  const [department, setDepartment] = useState('Information Technology (IT)');
  const [deadline, setDeadline] = useState('2026-07-31');
  const [instructions, setInstructions] = useState(
    'Please ensure all acquisition documents, loan approval certificates, and property valuation references are correctly uploaded. Sign details must be drawn clearly on the canvas.'
  );

  const handleGenerateRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportingYear || !department || !deadline) {
      alert("Please fill all mandatory fields.");
      return;
    }

    // Save Request Details to local storage
    const newRequest: IprRequest = {
      reportingYear,
      department,
      deadline,
      instructions,
      generatedDate: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('currentIprRequest', JSON.stringify(newRequest));

    // Fetch all registered employees
    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(e) {}
    }
    const employees = users.filter(u => u.role === 'employee');

    // Send notifications to all employees via ipr_notifications
    const savedNotifs = localStorage.getItem('ipr_notifications') || '{}';
    let notifMap: Record<string, any> = {};
    try { notifMap = JSON.parse(savedNotifs); } catch(e) {}

    const newNotification = {
      id: Date.now(),
      message: `Attention: Annual IPR Filing request generated for FY ${reportingYear} (${department}). Deadline: ${deadline}.`,
      date: new Date().toLocaleDateString(),
      type: 'info'
    };

    employees.forEach(emp => {
      const username = emp.username;
      if (username) {
        const userNotifs = notifMap[username] || [];
        notifMap[username] = [newNotification, ...userNotifs];
      }
    });

    localStorage.setItem('ipr_notifications', JSON.stringify(notifMap));

    alert(`Annual Immovable Property Return filing request for Year ${reportingYear} generated and dispatched to all employees successfully!`);
    navigate('/hod/dashboard');
  };

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'HOD Dashboard', link: '/hod/dashboard' }, { label: 'Send IPR Request' }]} />

      <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Send IPR Request
        </h2>
      </div>

      <div className="bg-white p-5 rounded-[6px] border border-[#E5E7EB] shadow-sm text-left">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5">Filing Parameters & Despatch Settings</h2>
        
        <form onSubmit={handleGenerateRequest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="reportingYear" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Reporting Fiscal Year <span className="text-red-500">*</span>
              </label>
              <select 
                id="reportingYear" 
                value={reportingYear} 
                onChange={(e) => setReportingYear(e.target.value)}
                className="w-full px-2 py-1.5 rounded-[6px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] text-xs font-bold text-slate-700 bg-white"
              >
                <option value="2025-26">2025-26 (Current Period)</option>
                <option value="2026-27">2026-27</option>
                <option value="2024-25">2024-25</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="department" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Target Department <span className="text-red-500">*</span>
              </label>
              <select 
                id="department" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2 py-1.5 rounded-[6px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] text-xs font-bold text-slate-700 bg-white"
              >
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="Finance & Revenue">Finance & Revenue</option>
                <option value="All Departments (Tripura State)">All Departments (Tripura State)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="deadline" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Submission Deadline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaCalendarAlt className="text-xs" />
                </span>
                <input 
                  type="date" 
                  id="deadline" 
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)} 
                  className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] text-xs font-bold text-slate-700 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="instructions" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Official Instructions / Guidelines
            </label>
            <textarea 
              id="instructions" 
              rows={4} 
              value={instructions} 
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide directives for employees regarding property registration uploads and timeline compliance..."
              className="w-full px-2.5 py-1.5 rounded-[6px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] text-xs font-sans text-[#374151]"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-250 rounded-[6px] flex gap-2.5 items-start text-amber-800 text-left">
            <FaExclamationTriangle className="text-xs mt-0.5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider">Important Dispatch Policy Notice</p>
              <p className="text-[11px] text-amber-700/90 mt-0.5">
                Generating this request will lock submission pathways for previous cycles and send out automatic email notifications and portal alerts to all employees listed under the selected target departments.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-[#E5E7EB] text-slate-700 font-bold rounded-[6px] text-xs transition-colors focus:outline-none"
              onClick={() => navigate('/hod/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white font-bold rounded-[6px] text-xs transition-colors shadow-sm focus:outline-none"
            >
              <FaBullhorn /> Generate & Dispatch Alerts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateRequest;

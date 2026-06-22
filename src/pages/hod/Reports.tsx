import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaChartPie, FaMailBulk, FaBell, FaPrint, FaDownload, FaExclamationCircle } from 'react-icons/fa';
import { User, IprSubmission } from '../../types';

interface NonCompliantItem {
  name: string;
  id: string;
  dept: string;
  email: string;
  phone: string;
  username?: string;
}

const Reports: React.FC = () => {
  const [submissions, setSubmissions] = useState<IprSubmission[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    filed: 0,
    approved: 0,
    corrections: 0,
    pending: 0
  });

  const [nonCompliant, setNonCompliant] = useState<NonCompliantItem[]>([]);
  const [remindersSent, setRemindersSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 1. Fetch submissions from ipr_submissions
    const saved = localStorage.getItem('ipr_submissions');
    let subList: IprSubmission[] = [];
    if (saved) {
      try {
        subList = JSON.parse(saved);
      } catch (e) {
        subList = [];
      }
    }
    setSubmissions(subList);

    // 2. Fetch registered employees from ipr_users
    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(e) {}
    }
    const employeesList = users.filter(u => u.role === 'employee');
    const totalEmployees = employeesList.length;

    // Calculate metrics
    const filedCount = subList.length;
    const approvedCount = subList.filter(s => s.status === 'Approved').length;
    const correctionCount = subList.filter(s => s.status === 'Correction Required').length;

    // Find non-compliant: employees who have NOT filed any submission
    const filedUsernames = new Set(
      subList.map(s => s.username?.toLowerCase() || s.employeeDetails?.email?.toLowerCase() || '')
    );
    
    const nonCompliantList = employeesList
      .filter(emp => !filedUsernames.has(emp.username?.toLowerCase()))
      .map(emp => ({
        name: emp.profile && 'name' in emp.profile ? emp.profile.name : emp.username,
        id: emp.profile && 'employeeId' in emp.profile ? emp.profile.employeeId : 'N/A',
        dept: emp.profile && 'department' in emp.profile ? emp.profile.department : 'N/A',
        email: emp.profile && 'email' in emp.profile ? emp.profile.email : 'N/A',
        phone: emp.profile && 'phone' in emp.profile ? emp.profile.phone : 'N/A',
        username: emp.username
      }));

    setNonCompliant(nonCompliantList);

    setStats({
      total: totalEmployees,
      filed: filedCount,
      approved: approvedCount,
      corrections: correctionCount,
      pending: nonCompliantList.length
    });
  }, []);

  const complianceRate = stats.total > 0 ? Math.round((stats.filed / stats.total) * 100) : 0;

  const handleSendReminder = (emp: NonCompliantItem) => {
    setRemindersSent(prev => ({ ...prev, [emp.name]: true }));

    // Save reminder notification in ipr_notifications
    if (emp.username) {
      const savedNotifs = localStorage.getItem('ipr_notifications') || '{}';
      let notifMap: Record<string, any> = {};
      try { notifMap = JSON.parse(savedNotifs); } catch(e) {}
      const userNotifs = notifMap[emp.username] || [];

      const newNotification = {
        id: Date.now(),
        message: `Official Reminder: Please file your Immovable Property Return (IPR) for the current fiscal year immediately. Awaiting submission.`,
        date: new Date().toLocaleDateString(),
        type: 'warning'
      };
      notifMap[emp.username] = [newNotification, ...userNotifs];
      localStorage.setItem('ipr_notifications', JSON.stringify(notifMap));
    }

    alert(`NIC Gateway Dispatch: Warning alert SMS and official email notification dispatched to ${emp.name} successfully.`);
  };

  const handleSendBulkReminders = () => {
    const savedNotifs = localStorage.getItem('ipr_notifications') || '{}';
    let notifMap: Record<string, any> = {};
    try { notifMap = JSON.parse(savedNotifs); } catch(e) {}

    nonCompliant.forEach(emp => {
      setRemindersSent(prev => ({ ...prev, [emp.name]: true }));
      if (emp.username) {
        const userNotifs = notifMap[emp.username] || [];
        const newNotification = {
          id: Date.now(),
          message: `Official Reminder: Please file your Immovable Property Return (IPR) for the current fiscal year immediately. Awaiting submission.`,
          date: new Date().toLocaleDateString(),
          type: 'warning'
        };
        notifMap[emp.username] = [newNotification, ...userNotifs];
      }
    });

    localStorage.setItem('ipr_notifications', JSON.stringify(notifMap));
    alert("NIC Gateway Dispatch: Dispatched bulk filing reminders to all non-compliant department employees.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'HOD Dashboard', link: '/hod/dashboard' }, { label: 'Reports & Analytics' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit">
          IPR Compliance & Statistical Reports
        </h2>
        <div className="flex gap-2">
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
            onClick={() => window.print()}
          >
            <FaPrint /> Print Report
          </button>
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
            onClick={() => alert("Downloading PDF compiled return register.")}
          >
            <FaDownload /> Download Register
          </button>
        </div>
      </div>

      {/* Two Column Layout: Compliance Gauge vs Status Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Compliance Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-800 font-outfit border-b border-slate-100 pb-3 w-full mb-6 flex items-center gap-2">
            <FaChartPie className="text-gov-primary text-base" /> Overall Compliance Rate
          </h3>

          <div className="relative w-44 h-44">
            <svg width="100%" height="100%" viewBox="0 0 36 36" className="-rotate-90">
              {/* Background Circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              {/* Foreground Animated Gauge */}
              <circle 
                cx="18" 
                cy="18" 
                r="15.915" 
                fill="none" 
                stroke="#1e3a8a" 
                strokeWidth="3.2" 
                strokeDasharray={`${complianceRate} ${100 - complianceRate}`} 
                strokeDashoffset="0"
                className="transition-[stroke-dasharray] duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-outfit">
              <span className="text-3xl font-black text-gov-primary leading-none">{complianceRate}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Filed Returns</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 w-full text-center divide-x divide-slate-100">
            <div>
              <div className="text-xl font-extrabold text-gov-primary">{stats.filed}</div>
              <div className="text-xs font-semibold text-slate-400">Filings Received</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-red-600">{stats.pending}</div>
              <div className="text-xs font-semibold text-slate-400">Awaiting Filings</div>
            </div>
          </div>
        </div>

        {/* Right Column: filing statistics breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[340px]">
          <h3 className="text-sm font-bold text-slate-800 font-outfit border-b border-slate-100 pb-3 w-full mb-4">
            Submission Statistics Breakdown
          </h3>
          
          <div className="flex-1 flex flex-col justify-around py-2 space-y-4">
            {/* Approved returns */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Approved Statements</span>
                <span>{stats.approved} / {stats.total}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-[width] duration-1000" 
                  style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Awaiting HOD actions */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Pending Verification Review</span>
                <span>{submissions.filter(s => s.status === 'Submitted').length} / {stats.total}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-[width] duration-1000" 
                  style={{ width: `${stats.total > 0 ? (submissions.filter(s => s.status === 'Submitted').length / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Returned correction */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Sent Back / Correction Loop</span>
                <span>{stats.corrections} / {stats.total}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-[width] duration-1000" 
                  style={{ width: `${stats.total > 0 ? (stats.corrections / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Non Compliant */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Non-Compliant (Not Started)</span>
                <span>{stats.pending} / {stats.total}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-[width] duration-1000" 
                  style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Non-Compliant Employee list */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-outfit">
            <FaExclamationCircle className="text-red-500" /> Non-Compliant Employees (Awaiting Returns)
          </h2>
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-xl font-semibold text-xs transition-colors"
            onClick={handleSendBulkReminders}
          >
            <FaMailBulk /> Dispatch Bulk Reminders
          </button>
        </div>

        <DataTable
          headers={['Employee ID', 'Employee Name', 'Department', 'Email Address', 'Phone Number', 'Filing Status', 'Action']}
          data={nonCompliant}
          emptyMessage="No non-compliant employees found."
          renderRow={(emp, idx) => (
            <tr key={emp.id || idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3.5 text-sm font-semibold text-slate-500">{emp.id}</td>
              <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{emp.name}</td>
              <td className="px-4 py-3.5 text-sm text-slate-600">{emp.dept}</td>
              <td className="px-4 py-3.5 text-sm text-slate-600">{emp.email}</td>
              <td className="px-4 py-3.5 text-sm text-slate-600">{emp.phone}</td>
              <td className="px-4 py-3.5 text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
                  Pending filing
                </span>
              </td>
              <td className="px-4 py-3.5 text-sm">
                <button 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                    remindersSent[emp.name] 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                  }`}
                  onClick={() => handleSendReminder(emp)}
                  disabled={remindersSent[emp.name]}
                >
                  <FaBell /> {remindersSent[emp.name] ? 'Reminder Dispatched' : 'Send Reminder'}
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default Reports;

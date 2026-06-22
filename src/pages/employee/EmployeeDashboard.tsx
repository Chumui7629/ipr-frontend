import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import DashboardCard from '../../components/DashboardCard';
import NotificationPanel from '../../components/NotificationPanel';
import DataTable from '../../components/DataTable';
import {
  FaClipboardList, FaHourglassHalf, FaFileContract,
  FaCheckDouble, FaTimesCircle, FaPlusSquare,
  FaFolderOpen, FaHistory, FaDownload,
  FaBell, FaTasks
} from 'react-icons/fa';
import { EmployeeProfile, IprSubmission, NotificationItem, User } from '../../types';

interface ActivityLog {
  id: string;
  date: string;
  activity: string;
  status: string;
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployeeProfile>({
    name: 'Employee',
    employeeId: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    service: '',
    placeOfPosting: '',
    joiningDate: '',
    dob: '',
    gender: 'Male',
    permanentAddress: '',
    presentAddress: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const savedActive = localStorage.getItem('ipr_active_user');
    if (!savedActive) {
      navigate('/');
      return;
    }

    let activeUser: User | null = null;
    try {
      activeUser = JSON.parse(savedActive);
      if (activeUser) {
        setProfile(activeUser.profile as EmployeeProfile);
      }
    } catch (e) {
      navigate('/');
      return;
    }

    if (!activeUser) return;

    const savedSubmissions = localStorage.getItem('ipr_submissions');
    let subList: IprSubmission[] = [];
    if (savedSubmissions) {
      try { subList = JSON.parse(savedSubmissions); } catch (e) { }
    }

    const mySubmissions = subList.filter(s => s.username === activeUser?.username);

    const savedDraft = localStorage.getItem(`employeeDraftReturn_${activeUser.username}`);
    const draftCount = savedDraft ? 1 : 0;
    const submittedCount = mySubmissions.filter(s => s.status === 'Submitted').length;
    const approvedCount = mySubmissions.filter(s => s.status === 'Approved').length;
    const rejectedCount = mySubmissions.filter(s => s.status === 'Rejected').length;
    const correctionCount = mySubmissions.filter(s => s.status === 'Correction Required').length;

    const activeRequest = localStorage.getItem('currentIprRequest');

    let pendingCount = 0;
    if (activeRequest) {
      try {
        const req = JSON.parse(activeRequest);
        const alreadySubmitted = mySubmissions.some(s => s.reportingYear === req.reportingYear && (s.status === 'Submitted' || s.status === 'Approved'));
        if (!alreadySubmitted) {
          pendingCount = 1;
        }
      } catch (e) { }
    }

    const totalRequests = pendingCount + mySubmissions.length;

    setStats({
      total: totalRequests,
      pending: pendingCount,
      draft: draftCount,
      submitted: submittedCount,
      approved: approvedCount,
      rejected: rejectedCount + correctionCount
    });

    const freshActivities: ActivityLog[] = [];
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        freshActivities.push({
          id: 'draft-act',
          date: new Date().toISOString().split('T')[0],
          activity: `Saved IPR filing draft for FY ${d.employee?.reportingYear || '2025-26'}`,
          status: 'Draft'
        });
      } catch (e) { }
    }

    mySubmissions.forEach((sub, idx) => {
      freshActivities.push({
        id: 'sub-' + idx,
        date: sub.submissionDate,
        activity: `Submitted IPR return form for FY ${sub.reportingYear}`,
        status: sub.status
      });
      if (sub.status === 'Approved') {
        freshActivities.push({
          id: 'app-' + idx,
          date: sub.lastUpdated || sub.submissionDate,
          activity: `HOD approved IPR statement for FY ${sub.reportingYear}`,
          status: 'Approved'
        });
      } else if (sub.status === 'Correction Required') {
        freshActivities.push({
          id: 'corr-' + idx,
          date: sub.lastUpdated || sub.submissionDate,
          activity: `HOD sent back statement for FY ${sub.reportingYear} for correction`,
          status: 'Correction Required'
        });
      }
    });

    setActivities(freshActivities.reverse());

    const savedNotifications = localStorage.getItem('ipr_notifications');
    let map = {};
    if (savedNotifications) {
      try { map = JSON.parse(savedNotifications); } catch (e) { }
    }
    setNotifications((map as any)[activeUser.username] || []);
  }, [navigate]);

  const handleDownloadPDF = () => {
    alert("Downloading official TRIPURA IPR Return guidelines and handbook as PDF.");
  };

  const getInitials = (name?: string) => {
    if (!name) return 'EMP';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[]} />

      {/* Welcome Card Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#374151]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-[#E5E7EB] text-[#1E4E8C] flex items-center justify-center text-lg font-bold">
            {getInitials(profile.name)}
          </div>
          <div className="text-left space-y-1">
            <h2 className="text-base font-bold text-[#1E4E8C]">Welcome back, {profile.name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{profile.designation}</p>
            <p className="text-xs text-slate-500 font-medium">{profile.department} | ID: {profile.employeeId}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-slate-50 border border-[#E5E7EB] rounded-[6px] text-[10px] font-bold text-slate-655 uppercase tracking-wider">{profile.service}</span>
          <span className="px-2.5 py-1 bg-slate-50 border border-[#E5E7EB] rounded-[6px] text-[10px] font-bold text-slate-655 uppercase tracking-wider">{profile.placeOfPosting}</span>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <DashboardCard title="Total IPR Requests" value={stats.total} icon={<FaClipboardList />} variant="default" />
        <DashboardCard title="Pending Filings" value={stats.pending} icon={<FaHourglassHalf />} variant="warning" />
        <DashboardCard title="Submissions" value={stats.submitted} icon={<FaFileContract />} variant="info" />
        <DashboardCard title="Approved Returns" value={stats.approved} icon={<FaCheckDouble />} variant="success" />
        <DashboardCard title="Draft Returns" value={stats.draft} icon={<FaTasks />} variant="default" />
        <DashboardCard title="Rejected Returns" value={stats.rejected} icon={<FaTimesCircle />} variant="danger" />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5 font-sans">Quick Dashboard Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            className="flex items-center justify-center gap-1.5 py-2 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none"
            onClick={() => navigate('/employee/ipr-filing')}
          >
            <FaPlusSquare /> File New Annual IPR
          </button>
          <button
            className="flex items-center justify-center gap-1.5 py-2 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
            onClick={() => navigate('/employee/my-submissions')}
          >
            <FaFolderOpen /> View My Submissions
          </button>
          <button
            className="flex items-center justify-center gap-1.5 py-2 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
            onClick={() => navigate('/employee/previous-returns')}
          >
            <FaHistory /> Archived Returns
          </button>
          <button
            className="flex items-center justify-center gap-1.5 py-2 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
            onClick={handleDownloadPDF}
          >
            <FaDownload /> Download Manual Guide (PDF)
          </button>
        </div>
      </div>

      {/* Two Column Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Activities */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm flex flex-col justify-between">
          <div className="text-left w-full">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5">Recent Activity History</h2>
            <DataTable
              headers={['Date', 'Activity & Action', 'Filing Status']}
              data={activities.slice(0, 5)}
              emptyMessage="No filings registered in your account."
              renderRow={(act, idx) => (
                <tr key={act.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-500 text-xs">{act.date}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-750 text-xs">{act.activity}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider border ${act.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      act.status === 'Submitted' ? 'bg-blue-50 text-[#1E4E8C] border-blue-200' :
                        act.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          act.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              )}
            />
          </div>
        </div>

        {/* Right: Notifications */}
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5 flex items-center gap-2">
            <FaBell className="text-[#1E4E8C] text-xs" /> Notifications & Alerts
          </h2>
          <NotificationPanel notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import DashboardCard from '../../components/DashboardCard';
import DataTable from '../../components/DataTable';
import { 
  FaClipboardList, FaHourglassHalf, FaFileContract, 
  FaCheckDouble, FaTimesCircle, FaPlusSquare, 
  FaFolderOpen, FaDownload, 
  FaTasks, FaSearch, FaEye, FaCheck, FaTimes, FaUndo
} from 'react-icons/fa';
import { IprSubmission, HodProfile, User } from '../../types';

interface Stats {
  totalEmployees: number;
  requestsSent: number;
  formsSubmitted: number;
  formsPending: number;
  approvedForms: number;
  rejectedForms: number;
  employeesNotFilled: number;
}

const HodDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<IprSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Stats
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    requestsSent: 0,
    formsSubmitted: 0,
    formsPending: 0,
    approvedForms: 0,
    rejectedForms: 0,
    employeesNotFilled: 0
  });

  // Modal State
  const [selectedSub, setSelectedSub] = useState<IprSubmission | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState<'Approved' | 'Rejected' | 'Correction Required'>('Approved');

  // HOD Profile loaded dynamically
  const [hodProfile, setHodProfile] = useState<HodProfile>({
    name: 'Dr. A. K. Debbarma',
    designation: 'Head of Office / Departmental Registrar',
    department: 'Information Technology (IT) Department | Government of Tripura',
    email: '',
    phone: ''
  });

  const getInitials = (name: string) => {
    if (!name) return 'HOD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch Submissions
  const loadSubmissions = () => {
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

    // Load registered employees
    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch(e) {}
    }
    const employeesList = users.filter(u => u.role === 'employee');
    const totalEmployees = employeesList.length;

    // Check active request
    const activeRequest = localStorage.getItem('currentIprRequest');
    const requestsSent = activeRequest ? totalEmployees : 0;

    // Forms Submitted (any status)
    const formsSubmitted = subList.length;

    // Forms Pending
    const formsPending = subList.filter(s => s.status === 'Submitted').length;

    // Approved Forms
    const approvedForms = subList.filter(s => s.status === 'Approved').length;

    // Rejected Forms (Rejected or Correction Required)
    const rejectedForms = subList.filter(s => s.status === 'Rejected' || s.status === 'Correction Required').length;

    // Employees Not Filled
    const filedUsernames = new Set(
      subList.map(s => s.username?.toLowerCase() || s.employeeDetails?.email?.toLowerCase() || '')
    );
    const employeesNotFilled = employeesList.filter(emp => !filedUsernames.has(emp.username?.toLowerCase())).length;

    setStats({
      totalEmployees,
      requestsSent,
      formsSubmitted,
      formsPending,
      approvedForms,
      rejectedForms,
      employeesNotFilled
    });
  };

  useEffect(() => {
    loadSubmissions();
    window.addEventListener('storage', loadSubmissions);

    const savedActive = localStorage.getItem('ipr_active_user');
    if (savedActive) {
      try {
        const user = JSON.parse(savedActive);
        if (user.role === 'hod' && user.profile) {
          setHodProfile({
            name: user.profile.name || 'HOD Officer',
            designation: user.profile.designation || 'Head of Office / Departmental Registrar',
            department: user.profile.department || 'Government of Tripura',
            email: user.profile.email || '',
            phone: user.profile.phone || ''
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    return () => window.removeEventListener('storage', loadSubmissions);
  }, []);

  const handleOpenReview = (sub: IprSubmission) => {
    setSelectedSub(sub);
    setRemarks(sub.hodRemarks && sub.hodRemarks !== 'Pending Verification by HOD' ? sub.hodRemarks : '');
    setAssessmentStatus(sub.status === 'Submitted' ? 'Approved' : (sub.status as any));
    setModalOpen(true);
  };

  const handleSaveAssessment = () => {
    if (!remarks.trim() && assessmentStatus !== 'Approved') {
      alert("Please provide feedback remarks for returned or rejected submissions.");
      return;
    }

    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === selectedSub?.id) {
        return {
          ...sub,
          status: assessmentStatus,
          hodRemarks: remarks || 'Property acquisition details verified.',
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return sub;
    });

    localStorage.setItem('ipr_submissions', JSON.stringify(updatedSubmissions));
    setSubmissions(updatedSubmissions);

    // Save in target employee's notification log
    const targetUser = selectedSub?.username || selectedSub?.employeeDetails?.email;
    if (targetUser && selectedSub) {
      const savedNotifs = localStorage.getItem('ipr_notifications') || '{}';
      let notifMap: Record<string, any> = {};
      try { notifMap = JSON.parse(savedNotifs); } catch(e) {}
      const userNotifs = notifMap[targetUser] || [];

      let type = 'info';
      let message = '';
      if (assessmentStatus === 'Approved') {
        type = 'success';
        message = `Your Immovable Property Return for FY ${selectedSub.reportingYear} has been APPROVED by HOD. Remarks: ${remarks || 'Verified and certified.'}`;
      } else if (assessmentStatus === 'Correction Required') {
        type = 'warning';
        message = `Attention Required: Your IPR filing for FY ${selectedSub.reportingYear} has been returned for CORRECTION. Remarks: ${remarks}`;
      } else {
        type = 'danger';
        message = `Alert: Your IPR filing for FY ${selectedSub.reportingYear} has been REJECTED. Remarks: ${remarks}`;
      }

      const newNotification = {
        id: Date.now(),
        message,
        date: new Date().toLocaleDateString(),
        type
      };
      notifMap[targetUser] = [newNotification, ...userNotifs];
      localStorage.setItem('ipr_notifications', JSON.stringify(notifMap));
    }

    setModalOpen(false);
    loadSubmissions();
    alert(`Filing submission ${selectedSub?.id} has been marked as '${assessmentStatus}' successfully!`);
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    const nameMatch = sub.employeeDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      sub.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return nameMatch;
    return nameMatch && sub.status === statusFilter;
  });

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'HOD Dashboard' }]} />

      {/* Welcome Banner Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#374151]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-[#E5E7EB] text-[#1E4E8C] flex items-center justify-center text-lg font-bold flex-shrink-0">
            {getInitials(hodProfile.name)}
          </div>
          <div className="text-left space-y-1">
            <h2 className="text-base font-bold text-[#1E4E8C]">Welcome, {hodProfile.name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{hodProfile.designation}</p>
            <p className="text-xs text-slate-500 font-medium">{hodProfile.department}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-slate-50 border border-[#E5E7EB] rounded-[6px] text-[10px] font-bold text-slate-655 uppercase tracking-wider">
            Filing Cycle FY 2025-26 Active
          </span>
          <span className="px-2.5 py-1 bg-slate-50 border border-[#E5E7EB] rounded-[6px] text-[10px] font-bold text-slate-655 uppercase tracking-wider">
            Posting: Secretariat, Agartala
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          icon={<FaClipboardList />} 
          variant="default"
        />
        <DashboardCard 
          title="Requests Sent" 
          value={stats.requestsSent} 
          icon={<FaHourglassHalf />} 
          variant="info"
        />
        <DashboardCard 
          title="Forms Submitted" 
          value={stats.formsSubmitted} 
          icon={<FaFileContract />} 
          variant="info"
        />
        <DashboardCard 
          title="Forms Pending" 
          value={stats.formsPending} 
          icon={<FaHourglassHalf />} 
          variant="warning"
        />
        <DashboardCard 
          title="Approved Forms" 
          value={stats.approvedForms} 
          icon={<FaCheckDouble />} 
          variant="success"
        />
        <DashboardCard 
          title="Rejected Forms" 
          value={stats.rejectedForms} 
          icon={<FaTimesCircle />} 
          variant="danger"
        />
        <DashboardCard 
          title="Employees Not Filed" 
          value={stats.employeesNotFilled} 
          icon={<FaTasks />} 
          variant="default"
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5">Quick HOD Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none"
            onClick={() => navigate('/hod/send-request')}
          >
            <FaPlusSquare /> Generate New Filing Request
          </button>
          <button 
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
            onClick={() => navigate('/hod/reports')}
          >
            <FaFolderOpen /> View Compliance Reports
          </button>
          <button 
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
            onClick={() => alert("Downloading collective Excel statements of IT department submissions.")}
          >
            <FaDownload /> Download Consolidated Data
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5">Employee Submissions Listing</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-2 mb-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FaSearch className="text-xs" />
            </span>
            <input 
              type="text" 
              placeholder="Search by Employee or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#E5E7EB] rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] font-sans"
            />
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-slate-550 uppercase tracking-wider whitespace-nowrap">Status:</span>
            <select 
              className="px-2 py-1.5 border border-[#E5E7EB] rounded-[6px] text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Submissions</option>
              <option value="Submitted">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Correction Required">Correction Required</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <DataTable
          headers={['Submission ID', 'Employee Name', 'Reporting Year', 'Date Filed', 'Filing Status', 'HOD Remarks', 'Action']}
          data={filteredSubmissions}
          emptyMessage="No submissions matched the filters."
          renderRow={(sub, index) => (
            <tr key={sub.id || index} className="hover:bg-slate-50/50 transition-colors border-b border-[#E5E7EB] last:border-b-0">
              <td className="px-4 py-3 text-xs font-bold text-[#1E4E8C]">{sub.id}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-800">{sub.employeeDetails?.name}</td>
              <td className="px-4 py-3 text-xs text-slate-550">{sub.reportingYear}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{sub.submissionDate}</td>
              <td className="px-4 py-3 text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold border uppercase tracking-wider ${
                  sub.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  sub.status === 'Submitted' ? 'bg-blue-50 text-[#1E4E8C] border-blue-200' :
                  sub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                {sub.hodRemarks || 'Pending review'}
              </td>
              <td className="px-4 py-3 text-xs">
                <button 
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] font-bold text-[10px] transition-colors focus:outline-none"
                  onClick={() => handleOpenReview(sub)}
                  title="Assess Submission"
                >
                  <FaEye /> Review
                </button>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Review Assessment Modal */}
      {modalOpen && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] shadow-sm w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#E5E7EB]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-slate-50">
              <h3 className="text-xs font-bold text-[#1E4E8C] uppercase tracking-wider font-sans">IPR Assessment & Verification Panel</h3>
              <button 
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-lg font-bold focus:outline-none"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-[#374151] font-sans text-xs">
              {/* Employee Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-[6px] border border-[#E5E7EB] text-xs">
                <div><strong>Employee Name:</strong> {selectedSub.employeeDetails.name}</div>
                <div><strong>Service Cadre:</strong> {selectedSub.employeeDetails.service}</div>
                <div><strong>Department:</strong> {selectedSub.employeeDetails.department}</div>
                <div><strong>Designation:</strong> {selectedSub.employeeDetails.designation}</div>
                <div><strong>Current Posting:</strong> {selectedSub.employeeDetails.placeOfPosting}</div>
                <div><strong>Annual Basic Pay:</strong> ₹{Number(selectedSub.employeeDetails.annualIncome || 0).toLocaleString('en-IN')}</div>
                <div><strong>Reporting Period:</strong> FY {selectedSub.reportingYear}</div>
                <div><strong>Submission Date:</strong> {selectedSub.submissionDate}</div>
              </div>

              {/* Property Details Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#1E4E8C] text-xs tracking-wider uppercase">Immovable Properties Declared</h4>
                <div className="overflow-x-auto border border-[#E5E7EB] rounded-[6px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#E5E7EB]">
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">District Location</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property Name / Description</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acquisition Cost</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Present Value</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ownership Details</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acquisition Mode</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Annual Income</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {selectedSub.properties.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 text-xs">
                          <td className="px-3 py-2 font-semibold text-slate-700">{p.district}</td>
                          <td className="px-3 py-2 text-slate-600">{p.propertyName || p.address || 'N/A'}</td>
                          <td className="px-3 py-2 text-slate-600">{p.propertyType}</td>
                          <td className="px-3 py-2 text-slate-600 font-semibold">₹{Number(p.acquisitionCost || 0).toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 text-slate-600 font-semibold">₹{Number(p.presentValue || 0).toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 text-slate-600">{p.ownerName || p.ownership || 'Self'}</td>
                          <td className="px-3 py-2 text-slate-600">{p.acquisitionDetails || 'N/A'}</td>
                          <td className="px-3 py-2 text-slate-600 font-semibold">₹{Number(p.annualIncome || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signature Check */}
              <div className="space-y-1">
                <strong className="block text-xs text-slate-700">Digital E-Signature:</strong>
                {selectedSub.signature ? (
                  <div className="border border-[#E5E7EB] border-dashed p-2 w-[180px] h-[60px] rounded-[6px] bg-slate-50 flex items-center justify-center">
                    <img src={selectedSub.signature} alt="E-Signature" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="px-3 py-1 w-[180px] rounded-[6px] bg-red-50 border border-red-200 text-[10px] text-red-655 font-bold flex items-center gap-1.5">
                    ⚠️ NO SIGNATURE FOUND
                  </div>
                )}
              </div>

              {/* HOD Assessment Panel */}
              <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                <h4 className="font-bold text-[#1E4E8C] text-xs tracking-wider uppercase">Assessment Decision</h4>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-[#E5E7EB] hover:bg-slate-50 px-3 py-1.5 rounded-[6px] transition-colors bg-white">
                    <input 
                      type="radio" 
                      name="assessment" 
                      value="Approved"
                      checked={assessmentStatus === 'Approved'}
                      onChange={() => setAssessmentStatus('Approved')}
                      className="text-[#1E4E8C] focus:ring-[#1E4E8C]"
                    />
                    <span className="text-green-700 flex items-center gap-1"><FaCheck /> Approve Return</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-[#E5E7EB] hover:bg-slate-50 px-3 py-1.5 rounded-[6px] transition-colors bg-white">
                    <input 
                      type="radio" 
                      name="assessment" 
                      value="Correction Required"
                      checked={assessmentStatus === 'Correction Required'}
                      onChange={() => setAssessmentStatus('Correction Required')}
                      className="text-[#1E4E8C] focus:ring-[#1E4E8C]"
                    />
                    <span className="text-amber-700 flex items-center gap-1"><FaUndo /> Send for Correction</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-[#E5E7EB] hover:bg-slate-50 px-3 py-1.5 rounded-[6px] transition-colors bg-white">
                    <input 
                      type="radio" 
                      name="assessment" 
                      value="Rejected"
                      checked={assessmentStatus === 'Rejected'}
                      onChange={() => setAssessmentStatus('Rejected')}
                      className="text-[#1E4E8C] focus:ring-[#1E4E8C]"
                    />
                    <span className="text-red-750 flex items-center gap-1"><FaTimes /> Reject Filing</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label htmlFor="hodRemarks" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Assessment Remarks / Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="hodRemarks" 
                    rows={3} 
                    value={remarks} 
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter official remarks, verification details, or corrections requested..."
                    className="w-full px-3 py-1.5 rounded-[6px] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] text-xs font-sans"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-[#E5E7EB] bg-slate-50 rounded-b-[6px]">
              <button 
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-[#E5E7EB] text-slate-700 font-bold rounded-[6px] text-xs transition-colors"
                onClick={() => setModalOpen(false)}
              >
                Close View
              </button>
              <button 
                className="px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white font-bold rounded-[6px] text-xs transition-colors shadow-sm"
                onClick={handleSaveAssessment}
              >
                Save Assessment Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HodDashboard;

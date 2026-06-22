import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaSearch, FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { User, IprSubmission } from '../../types';

interface FilledItem {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  submissionDate: string;
  status: string;
  username?: string;
}

interface NotFilledItem {
  employeeId: string;
  name: string;
  department: string;
  requestSentDate: string;
  daysRemaining: string;
  status: string;
}

const IprSubmissionStatus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'filled' | 'not_filled'>('filled');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filledList, setFilledList] = useState<FilledItem[]>([]);
  const [notFilledList, setNotFilledList] = useState<NotFilledItem[]>([]);
  
  const [requestDetails, setRequestDetails] = useState({
    sentDate: 'No Active Request',
    daysRemaining: 'N/A'
  });

  const loadData = () => {
    // 1. Load submissions
    const savedSubs = localStorage.getItem('ipr_submissions');
    let subList: IprSubmission[] = [];
    if (savedSubs) {
      try { subList = JSON.parse(savedSubs); } catch (e) {}
    }

    // 2. Load registered users
    const savedUsers = localStorage.getItem('ipr_users');
    let users: User[] = [];
    if (savedUsers) {
      try { users = JSON.parse(savedUsers); } catch (e) {}
    }
    const employeesList = users.filter(u => u.role === 'employee');

    // 3. Load active request for date/deadline
    const activeRequest = localStorage.getItem('currentIprRequest');
    let reqSentDate = 'No Active Request';
    let reqDaysRemaining = 'N/A';
    if (activeRequest) {
      try {
        const req = JSON.parse(activeRequest);
        reqSentDate = req.generatedDate || 'N/A';
        if (req.deadline) {
          const diffTime = new Date(req.deadline).getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          reqDaysRemaining = diffDays >= 0 ? `${diffDays} days` : 'Lapsed';
        }
      } catch (e) {}
    }
    setRequestDetails({
      sentDate: reqSentDate,
      daysRemaining: reqDaysRemaining
    });

    // 4. Group filled list
    const filled = subList.map(sub => ({
      id: sub.id,
      employeeId: sub.employeeDetails?.employeeId || 'N/A',
      name: sub.employeeDetails?.name || 'N/A',
      department: sub.employeeDetails?.department || 'N/A',
      submissionDate: sub.submissionDate || 'N/A',
      status: sub.status === 'Submitted' ? 'Pending Review' : sub.status,
      username: sub.username
    }));
    setFilledList(filled);

    // 5. Group not filled list
    const filedUsernames = new Set(
      subList.map(s => s.username?.toLowerCase() || s.employeeDetails?.email?.toLowerCase() || '')
    );
    const notFilled = employeesList
      .filter(emp => !filedUsernames.has(emp.username?.toLowerCase()))
      .map(emp => ({
        employeeId: emp.profile && 'employeeId' in emp.profile ? emp.profile.employeeId : 'N/A',
        name: emp.profile && 'name' in emp.profile ? emp.profile.name : emp.username,
        department: emp.profile && 'department' in emp.profile ? emp.profile.department : 'N/A',
        requestSentDate: reqSentDate,
        daysRemaining: reqDaysRemaining,
        status: 'Not Submitted'
      }));
    setNotFilledList(notFilled);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const filteredFilled = filledList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotFilled = notFilledList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Home', link: '/hod/dashboard' }, { label: 'IPR Submission Status' }]} />

      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit">
          IPR Submission Status
        </h2>
      </div>

      {/* Active Request Info Banner */}
      {requestDetails.sentDate !== 'No Active Request' && (
        <div className="bg-indigo-50 border-l-4 border-gov-primary rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-slate-700 font-outfit shadow-sm">
          <div>
            <strong>Active Filing Request:</strong> Sent on <span className="text-gov-primary font-semibold">{requestDetails.sentDate}</span>
          </div>
          <div>
            <strong>Filing Deadline:</strong> <span className={`font-bold ${requestDetails.daysRemaining === 'Lapsed' ? 'text-red-600' : 'text-emerald-600'}`}>{requestDetails.daysRemaining}</span>
          </div>
        </div>
      )}

      {/* Stats Summary Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 text-2xl">
            <FaCheckCircle />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 leading-none">{filledList.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Employees Filed Submissions</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-2xl">
            <FaTimesCircle />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 leading-none">{notFilledList.length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Employees Awaiting Filing</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Toggle tabs */}
        <div className="flex border-b border-slate-200 font-outfit">
          <button 
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'filled' 
                ? 'border-gov-primary text-gov-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => { setActiveTab('filled'); setSearchTerm(''); }}
          >
            Filled List ({filledList.length})
          </button>
          <button 
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'not_filled' 
                ? 'border-gov-primary text-gov-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => { setActiveTab('not_filled'); setSearchTerm(''); }}
          >
            Not Filled List ({notFilledList.length})
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="relative max-w-md pb-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <FaSearch className="text-sm" />
          </span>
          <input 
            type="text" 
            placeholder="Search by Employee, ID, or Department..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-primary/20 focus:border-gov-primary text-sm transition-all placeholder:text-slate-400"
          />
        </div>

        {/* List Tables */}
        {activeTab === 'filled' ? (
          filledList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-outfit">
              <FaClipboardList className="text-5xl text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No employee submissions found.</p>
              <p className="text-xs text-slate-400 mt-1">Once registered employees submit their immovable property returns, they will appear here.</p>
            </div>
          ) : (
            <DataTable
              headers={['Employee ID', 'Employee Name', 'Department', 'Submission Date', 'Status']}
              data={filteredFilled}
              emptyMessage="No matching submissions found."
              renderRow={(item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-500">{item.employeeId}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{item.department}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{item.submissionDate}</td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.status === 'Pending Review' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      item.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )}
            />
          )
        ) : (
          notFilledList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-outfit">
              <FaCheckCircle className="text-5xl text-emerald-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">All registered employees have submitted their returns.</p>
              <p className="text-xs text-slate-400 mt-1">IPR compliance is currently at 100%.</p>
            </div>
          ) : (
            <DataTable
              headers={['Employee ID', 'Employee Name', 'Department', 'Request Sent Date', 'Days Remaining', 'Status']}
              data={filteredNotFilled}
              emptyMessage="No matching employees found."
              renderRow={(item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-500">{item.employeeId}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{item.department}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{item.requestSentDate}</td>
                  <td className={`px-4 py-3.5 text-sm font-semibold ${item.daysRemaining === 'Lapsed' ? 'text-red-600' : 'text-slate-700'}`}>
                    <span className="inline-flex items-center gap-1">
                      <FaClock className="text-xs" /> {item.daysRemaining}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                      {item.status}
                    </span>
                  </td>
                </tr>
              )}
            />
          )
        )}
      </div>
    </div>
  );
};

export default IprSubmissionStatus;

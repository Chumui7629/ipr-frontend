import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaFolderOpen, FaSearch, FaEye, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import { IprSubmission } from '../../types';

interface ActionModalState {
  type: 'approve' | 'reject' | 'return' | '';
  open: boolean;
}

const ReviewApproval: React.FC = () => {
  const [submissions, setSubmissions] = useState<IprSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [selectedSub, setSelectedSub] = useState<IprSubmission | null>(null);
  
  // Modals visibility
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModalState>({
    type: '',
    open: false
  });
  
  const [remarks, setRemarks] = useState('');

  const loadSubmissions = () => {
    const saved = localStorage.getItem('ipr_submissions');
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (e) {
        setSubmissions([]);
      }
    }
  };

  useEffect(() => {
    loadSubmissions();
    window.addEventListener('storage', loadSubmissions);
    return () => window.removeEventListener('storage', loadSubmissions);
  }, []);

  const openActionModal = (sub: IprSubmission, type: 'approve' | 'reject' | 'return') => {
    setSelectedSub(sub);
    setRemarks('');
    setActionModal({ type, open: true });
  };

  const handleProcessAction = () => {
    if (!selectedSub) return;
    if ((actionModal.type === 'reject' || actionModal.type === 'return') && !remarks.trim()) {
      alert("Please enter feedback remarks for rejection or returned corrections.");
      return;
    }

    let statusResult: IprSubmission['status'] = 'Approved';
    let remarksResult = remarks.trim() || 'Verified and approved by HOD.';
    
    if (actionModal.type === 'reject') {
      statusResult = 'Rejected';
    } else if (actionModal.type === 'return') {
      statusResult = 'Correction Required';
    }

    const updated = submissions.map(sub => {
      if (sub.id === selectedSub.id) {
        return {
          ...sub,
          status: statusResult,
          hodRemarks: remarksResult,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return sub;
    });

    localStorage.setItem('ipr_submissions', JSON.stringify(updated));
    setSubmissions(updated);

    // Dynamic notification trigger
    const targetUser = selectedSub.username || selectedSub.employeeDetails?.email;
    if (targetUser) {
      const savedNotifs = localStorage.getItem('ipr_notifications') || '{}';
      let notifMap: Record<string, any> = {};
      try { notifMap = JSON.parse(savedNotifs); } catch (e) {}
      const userNotifs = notifMap[targetUser] || [];

      let type = 'info';
      let message = '';
      if (statusResult === 'Approved') {
        type = 'success';
        message = `Your Immovable Property Return for FY ${selectedSub.reportingYear} has been APPROVED by HOD. Remarks: ${remarksResult}`;
      } else if (statusResult === 'Correction Required') {
        type = 'warning';
        message = `Attention Required: Your IPR filing for FY ${selectedSub.reportingYear} has been returned for CORRECTION. Remarks: ${remarksResult}`;
      } else {
        type = 'danger';
        message = `Alert: Your IPR filing for FY ${selectedSub.reportingYear} has been REJECTED. Remarks: ${remarksResult}`;
      }

      userNotifs.unshift({
        id: Date.now(),
        message,
        date: new Date().toLocaleDateString(),
        type
      });
      notifMap[targetUser] = userNotifs;
      localStorage.setItem('ipr_notifications', JSON.stringify(notifMap));
    }

    setActionModal({ type: '', open: false });
    setViewModalOpen(false);
    alert(`Filing submission ${selectedSub.id} has been marked as '${statusResult}' successfully!`);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const nameMatch = sub.employeeDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      sub.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return nameMatch;
    return nameMatch && sub.status === statusFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Home', link: '/hod/dashboard' }, { label: 'Review & Approval' }]} />

      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit">
          Review & Approval Center
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Submitted Return Forms</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-2">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <FaSearch className="text-sm" />
            </span>
            <input 
              type="text" 
              placeholder="Search by Employee name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-primary/20 focus:border-gov-primary text-sm transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <select 
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gov-primary/20 focus:border-gov-primary"
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

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-outfit">
            <FaFolderOpen className="text-5xl text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No employee submissions found.</p>
            <p className="text-xs text-slate-400 mt-1">IPR returns submitted by employees will appear here for verification and assessment decisions.</p>
          </div>
        ) : (
          <DataTable
            headers={['Submission ID', 'Employee Name', 'Reporting Year', 'Date Filed', 'Filing Status', 'Actions']}
            data={filteredSubmissions}
            emptyMessage="No submissions matched filters."
            renderRow={(sub, idx) => (
              <tr key={sub.id || idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-semibold text-gov-primary">{sub.id}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{sub.employeeDetails?.name}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{sub.reportingYear}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{sub.submissionDate}</td>
                <td className="px-4 py-3.5 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    sub.status === 'Submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    sub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {sub.status === 'Submitted' ? 'Pending Review' : sub.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                      onClick={() => { setSelectedSub(sub); setViewModalOpen(true); }}
                      title="View Full Form"
                    >
                      <FaEye /> View Form
                    </button>
                    {sub.status === 'Submitted' && (
                      <>
                        <button 
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                          onClick={() => openActionModal(sub, 'approve')}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button 
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs transition-colors"
                          onClick={() => openActionModal(sub, 'return')}
                        >
                          <FaUndo /> Return
                        </button>
                        <button 
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors"
                          onClick={() => openActionModal(sub, 'reject')}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </div>

      {/* View Form Modal */}
      {viewModalOpen && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-800 font-outfit">IPR Filing Form Verification</h3>
              <button 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold"
                onClick={() => setViewModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 font-outfit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 text-sm">
                <div><strong>Employee ID:</strong> {selectedSub.employeeDetails?.employeeId}</div>
                <div><strong>Employee Name:</strong> {selectedSub.employeeDetails?.name}</div>
                <div><strong>Service Cadre:</strong> {selectedSub.employeeDetails?.service}</div>
                <div><strong>Department:</strong> {selectedSub.employeeDetails?.department}</div>
                <div><strong>Designation:</strong> {selectedSub.employeeDetails?.designation}</div>
                <div><strong>Current Posting:</strong> {selectedSub.employeeDetails?.placeOfPosting}</div>
                <div><strong>Annual Basic Pay:</strong> ₹{Number(selectedSub.employeeDetails?.annualIncome || 0).toLocaleString('en-IN')}</div>
                <div><strong>Reporting Period:</strong> FY {selectedSub.reportingYear}</div>
                <div><strong>Submission Date:</strong> {selectedSub.submissionDate}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-gov-primary text-sm tracking-wide uppercase">Immovable Properties Declared</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">District Location</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Property Description</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Acquisition Cost</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Present Value</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ownership Details</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Acquisition Mode</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Income</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {selectedSub.properties.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">No properties declared (Nil Return).</td>
                        </tr>
                      ) : (
                        selectedSub.properties.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30">
                            <td className="px-4 py-3 font-semibold text-slate-700">{p.district}</td>
                            <td className="px-4 py-3 text-slate-600">{p.propertyName || p.address || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-600">{p.propertyType}</td>
                            <td className="px-4 py-3 text-slate-600 font-semibold">₹{Number(p.acquisitionCost || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-slate-600 font-semibold">₹{Number(p.presentValue || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-slate-600">{p.ownerName || p.ownership || 'Self'}</td>
                            <td className="px-4 py-3 text-slate-600">{p.acquisitionDetails || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-600 font-semibold">₹{Number(p.annualIncome || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <strong className="block text-sm text-slate-700">Digital E-Signature:</strong>
                {selectedSub.signature ? (
                  <div className="border border-slate-200 border-dashed p-3 w-[220px] h-[80px] rounded-lg bg-slate-50/50 flex items-center justify-center">
                    <img src={selectedSub.signature} alt="E-Signature" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="px-4 py-2 w-[220px] rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-1.5">
                    ⚠️ NO SIGNATURE FOUND
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button 
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                onClick={() => setViewModalOpen(false)}
              >
                Close View
              </button>
              
              {selectedSub.status === 'Submitted' && (
                <div className="flex gap-2">
                  <button 
                    className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-emerald-900/10"
                    onClick={() => openActionModal(selectedSub, 'approve')}
                  >
                    <FaCheck /> Approve Return
                  </button>
                  <button 
                    className="inline-flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-amber-900/10"
                    onClick={() => openActionModal(selectedSub, 'return')}
                  >
                    <FaUndo /> Return for Correction
                  </button>
                  <button 
                    className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-red-900/10"
                    onClick={() => openActionModal(selectedSub, 'reject')}
                  >
                    <FaTimes /> Reject Filing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal.open && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800 font-outfit">
                {actionModal.type === 'approve' && 'Confirm IPR Approval'}
                {actionModal.type === 'reject' && 'Confirm IPR Rejection'}
                {actionModal.type === 'return' && 'Return for Correction'}
              </h3>
              <button 
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold"
                onClick={() => setActionModal({ type: '', open: false })}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm text-slate-700 font-outfit">
              <p>
                Are you sure you want to {actionModal.type === 'approve' && 'approve'} {actionModal.type === 'reject' && 'reject'} {actionModal.type === 'return' && 'send back'} the filing statement?
              </p>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <div><strong>Employee:</strong> {selectedSub.employeeDetails?.name}</div>
                <div><strong>Submission ID:</strong> {selectedSub.id}</div>
                <div><strong>Reporting Period:</strong> FY {selectedSub.reportingYear}</div>
              </div>

              {(actionModal.type === 'reject' || actionModal.type === 'return') && (
                <div className="space-y-1.5">
                  <label htmlFor="modalRemarks" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Remarks / Directives <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="modalRemarks"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Provide detailed feedback instructions for the employee..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-primary/20 focus:border-gov-primary text-sm transition-all"
                    required
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button 
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                onClick={() => setActionModal({ type: '', open: false })}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-white font-semibold rounded-xl text-sm transition-colors ${
                  actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal.type === 'return' ? 'bg-amber-500 hover:bg-amber-600' :
                  'bg-red-600 hover:bg-red-700'
                }`}
                onClick={handleProcessAction}
              >
                {actionModal.type === 'approve' && 'Confirm Approve'}
                {actionModal.type === 'reject' && 'Confirm Reject'}
                {actionModal.type === 'return' && 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewApproval;

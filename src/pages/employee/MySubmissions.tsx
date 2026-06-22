import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaFilePdf, FaPrint, FaSearch, FaEye, FaPen } from 'react-icons/fa';
import { IprSubmission, User } from '../../types';

const MySubmissions: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<IprSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState<IprSubmission | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const activeUserSaved = localStorage.getItem('ipr_active_user');
    let activeUsername = '';
    if (activeUserSaved) {
      try {
        const active: User = JSON.parse(activeUserSaved);
        activeUsername = active.username;
      } catch (e) {
        console.error(e);
      }
    }

    const saved = localStorage.getItem('ipr_submissions');
    if (saved && activeUsername) {
      try {
        const parsed: IprSubmission[] = JSON.parse(saved);
        const mySubs = parsed.filter(s => 
          s.username?.toLowerCase() === activeUsername.toLowerCase() ||
          s.employeeDetails?.name?.toLowerCase() === activeUsername.toLowerCase()
        );
        setSubmissions(mySubs);
      } catch (e) {
        setSubmissions([]);
      }
    } else {
      setSubmissions([]);
    }
  }, []);

  const handleDownloadPDF = (sub: IprSubmission) => {
    alert(`Downloading statement of Immovable Property Return for Year ${sub.reportingYear} (ID: ${sub.id}) as PDF.`);
  };

  const handlePrint = (sub: IprSubmission) => {
    alert(`Opening print dialogue for IPR Submission Statement ${sub.id}.`);
  };

  const viewDetails = (sub: IprSubmission) => {
    setSelectedSub(sub);
    setModalOpen(true);
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.reportingYear?.includes(searchTerm) ||
    sub.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'My Submissions' }]} />

      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">My Submission History</h2>

        <div className="flex bg-slate-50 p-3 border border-[#E5E7EB] rounded-[6px]">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
              <FaSearch className="text-[10px]" />
            </span>
            <input 
              type="text" 
              placeholder="Search by ID, Year or Status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] text-slate-800"
            />
          </div>
        </div>

        <DataTable
          headers={['Submission ID', 'Reporting Year', 'Submission Date', 'Filing Status', 'HOD Remarks', 'Last Updated', 'Actions']}
          data={filteredSubmissions}
          emptyMessage="No returns submitted yet."
          renderRow={(sub, index) => (
            <tr key={sub.id || index} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 font-bold text-[#1E4E8C] whitespace-nowrap">{sub.id}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium">{sub.reportingYear}</td>
              <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-500">{sub.submissionDate}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs">
                <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider border ${
                  sub.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  sub.status === 'Submitted' ? 'bg-blue-50 text-[#1E4E8C] border-blue-200' :
                  sub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  sub.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs font-semibold max-w-[200px] truncate" title={sub.hodRemarks}>
                {sub.hodRemarks || 'Pending Review'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-medium">{sub.lastUpdated || sub.submissionDate}</td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="inline-flex items-center gap-1.5">
                  <button 
                    className="p-1 text-[#1E4E8C] hover:bg-slate-50 border border-[#cbd5e1] rounded-[6px] transition-colors focus:outline-none" 
                    onClick={() => viewDetails(sub)}
                    title="View details"
                  >
                    <FaEye className="text-xs" />
                  </button>
                  {sub.status === 'Correction Required' && (
                    <button 
                      className="p-1 text-amber-600 hover:bg-slate-50 border border-amber-200 rounded-[6px] transition-colors focus:outline-none" 
                      onClick={() => navigate(`/employee/ipr-filing?resubmitId=${sub.id}`)}
                      title="Correct & Resubmit Return"
                    >
                      <FaPen className="text-xs" />
                    </button>
                  )}
                  <button 
                    className="p-1 text-red-600 hover:bg-slate-50 border border-red-200 rounded-[6px] transition-colors focus:outline-none" 
                    onClick={() => handleDownloadPDF(sub)}
                    title="Download PDF statement"
                  >
                    <FaFilePdf className="text-xs" />
                  </button>
                  <button 
                    className="p-1 text-[#1E4E8C] hover:bg-slate-50 border border-blue-200 rounded-[6px] transition-colors focus:outline-none" 
                    onClick={() => handlePrint(sub)}
                    title="Print Return"
                  >
                    <FaPrint className="text-xs" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Details View Modal */}
      {modalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-[6px] border border-[#cbd5e1] shadow-lg overflow-hidden my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd5e1] bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Submission Statement Details</h3>
              <button className="text-slate-400 hover:text-slate-600 font-bold text-sm" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="p-4 space-y-3.5 text-left font-sans text-xs text-slate-700">
              
              <div className="grid grid-cols-2 gap-2 border-b border-[#E5E7EB] pb-3 text-xs">
                <div><strong>Submission ID:</strong> <span className="text-[#1E4E8C] font-bold">{selectedSub.id}</span></div>
                <div><strong>Reporting Year:</strong> {selectedSub.reportingYear}</div>
                <div><strong>Filing Date:</strong> {selectedSub.submissionDate}</div>
                <div className="flex items-center gap-1.5">
                  <strong>Filing Status:</strong>
                  <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase border ${
                    selectedSub.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    selectedSub.status === 'Submitted' ? 'bg-blue-50 text-[#1E4E8C] border-blue-200' :
                    selectedSub.status === 'Correction Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    selectedSub.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {selectedSub.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <strong className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">HOD Assessment Remarks:</strong>
                <p className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-[6px] text-xs font-semibold leading-relaxed text-slate-600">
                  {selectedSub.hodRemarks || 'Form received. Pending physical verification of land records by office head.'}
                </p>
              </div>

              {selectedSub.properties && selectedSub.properties.length > 0 && (
                <div className="flex flex-col">
                  <strong className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Properties Included:</strong>
                  <ul className="list-disc pl-5 text-xs space-y-1 font-sans text-slate-600">
                    {selectedSub.properties.map((p, i) => (
                      <li key={i} className="font-semibold">
                        {p.propertyType} in {p.district} (Value: ₹{Number(p.presentValue).toLocaleString('en-IN')})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSub.signature && (
                <div className="flex flex-col">
                  <strong className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Digital Signature Authenticated:</strong>
                  <div className="border border-[#cbd5e1] bg-slate-50 p-2 w-44 h-16 rounded-[6px] flex items-center justify-center">
                    <img src={selectedSub.signature} alt="E-Signature" className="max-h-full max-w-full bg-white" />
                  </div>
                </div>
              )}

            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-[#cbd5e1]">
              {selectedSub.status === 'Correction Required' && (
                <button 
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-[6px] text-xs font-bold focus:outline-none" 
                  onClick={() => { setModalOpen(false); navigate(`/employee/ipr-filing?resubmitId=${selectedSub.id}`); }}
                >
                  Correct & Resubmit
                </button>
              )}
              <button className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:bg-slate-100 bg-white border border-[#cbd5e1] rounded-[6px] text-xs font-bold transition-colors focus:outline-none" onClick={() => handleDownloadPDF(selectedSub)}><FaFilePdf className="text-red-500" /> Export Statement</button>
              <button className="px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold focus:outline-none" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;

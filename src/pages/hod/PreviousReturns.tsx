import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaHistory, FaSearch, FaFilePdf } from 'react-icons/fa';
import { IprSubmission } from '../../types';

const HodPreviousReturns: React.FC = () => {
  const [archivedSubmissions, setArchivedSubmissions] = useState<IprSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ipr_submissions');
    if (saved) {
      try {
        const parsed: IprSubmission[] = JSON.parse(saved);
        // Previous returns are submissions where year is older than current 2025-26, e.g. 2024-25, 2023-24
        const filtered = parsed.filter(s => s.reportingYear !== '2025-26');
        setArchivedSubmissions(filtered);
      } catch (e) {
        setArchivedSubmissions([]);
      }
    }
  }, []);

  const handleDownloadPDF = (sub: IprSubmission) => {
    alert(`Downloading historical return statement of ${sub.employeeDetails?.name} for Year ${sub.reportingYear} as PDF.`);
  };

  const filtered = archivedSubmissions.filter(sub => 
    sub.employeeDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.reportingYear?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: 'Home', link: '/hod/dashboard' }, { label: 'Previous Returns' }]} />

      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit">
          Archived Previous Returns
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Past Filing Registers</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-2">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <FaSearch className="text-sm" />
            </span>
            <input 
              type="text" 
              placeholder="Search by Employee, ID, or Year..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gov-primary/20 focus:border-gov-primary text-sm transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {archivedSubmissions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-outfit">
            <FaHistory className="text-5xl text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No archived returns found.</p>
            <p className="text-xs text-slate-400 mt-1">Historical records from previous annual filing periods are empty.</p>
          </div>
        ) : (
          <DataTable
            headers={['Submission ID', 'Employee Name', 'Reporting Year', 'Filing Date', 'Status', 'HOD Remarks', 'Action']}
            data={filtered}
            emptyMessage="No archived returns match filters."
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
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[200px] truncate">
                  {sub.hodRemarks}
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <button 
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                    onClick={() => handleDownloadPDF(sub)}
                    title="Export Return Register"
                  >
                    <FaFilePdf className="text-red-500" /> PDF
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default HodPreviousReturns;

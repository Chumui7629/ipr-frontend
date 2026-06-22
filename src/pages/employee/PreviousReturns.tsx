import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaFilePdf, FaEye, FaSearch } from 'react-icons/fa';
import { IprSubmission, User } from '../../types';

interface MappedReturn {
  year: string;
  submissionDate: string;
  totalProperties: number;
  totalValue: number;
  status: string;
  rawSubmission: IprSubmission;
}

const PreviousReturns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [returns, setReturns] = useState<MappedReturn[]>([]);

  useEffect(() => {
    const savedActive = localStorage.getItem('ipr_active_user');
    let activeUsername = '';
    if (savedActive) {
      try {
        const active: User = JSON.parse(savedActive);
        activeUsername = active.username;
      } catch (e) {}
    }

    if (activeUsername) {
      const savedSubmissions = localStorage.getItem('ipr_submissions');
      if (savedSubmissions) {
        try {
          const list: IprSubmission[] = JSON.parse(savedSubmissions);
          const approvedSubs = list.filter(s => 
            (s.username?.toLowerCase() === activeUsername.toLowerCase() ||
             s.employeeDetails?.name?.toLowerCase() === activeUsername.toLowerCase()) && 
            s.status === 'Approved'
          );

          const mappedReturns = approvedSubs.map(s => {
            const totalVal = s.properties?.reduce((sum, p) => sum + Number(p.presentValue || 0), 0) || 0;
            return {
              year: s.reportingYear,
              submissionDate: s.submissionDate,
              totalProperties: s.properties?.length || 0,
              totalValue: totalVal,
              status: s.status,
              rawSubmission: s
            };
          });

          setReturns(mappedReturns);
        } catch (e) {
          setReturns([]);
        }
      }
    }
  }, []);

  const handleDownloadPDF = (ret: MappedReturn) => {
    alert(`Downloading statement of Immovable Property Return for Fiscal Year ${ret.year} as PDF.`);
  };

  const handleView = (ret: MappedReturn) => {
    alert(`Displaying property records archive for Return Year ${ret.year}:\nProperties Filed: ${ret.totalProperties}\nTotal Declared Value: ₹${ret.totalValue.toLocaleString('en-IN')}`);
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.year.includes(searchTerm) || ret.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = yearFilter === 'All' || ret.year === yearFilter;
    return matchesSearch && matchesFilter;
  });  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'IPR / Property' }, { label: 'Previous Returns' }]} />

      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5">
          Archived Annual Returns
        </h2>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 border border-[#E5E7EB] rounded-[6px] mb-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FaSearch className="text-xs" />
            </span>
            <input 
              type="text" 
              placeholder="Search by year..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#E5E7EB] rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] font-sans"
            />
          </div>
          
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-550 uppercase tracking-wider whitespace-nowrap">Filter Year:</span>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full sm:w-auto px-2 py-1.5 border border-[#E5E7EB] rounded-[6px] text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
            >
              <option value="All">All Years</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
              <option value="2021-22">2021-22</option>
            </select>
          </div>
        </div>

        <DataTable
          headers={['Fiscal Year', 'Filing Date', 'Total Properties Declared', 'Total Combined Value (₹)', 'Filing Status', 'Actions']}
          data={filteredReturns}
          emptyMessage="No archived returns found matching search criteria."
          renderRow={(ret, index) => (
            <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-[#E5E7EB] last:border-b-0">
              <td className="px-4 py-3 font-bold text-[#374151] whitespace-nowrap text-xs">{ret.year}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{ret.submissionDate}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{ret.totalProperties} Property Record(s)</td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-700 text-xs">₹{ret.totalValue.toLocaleString('en-IN')}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs">
                <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-[6px] font-bold uppercase tracking-wider">
                  {ret.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-left text-xs">
                <div className="inline-flex items-center gap-1.5">
                  <button 
                    className="p-1 text-[#1E4E8C] hover:text-white hover:bg-[#1E4E8C] border border-[#E5E7EB] hover:border-[#1E4E8C] rounded-[6px] transition-colors bg-white" 
                    onClick={() => handleView(ret)}
                    title="View details"
                  >
                    <FaEye className="text-xs" />
                  </button>
                  <button 
                    className="p-1 text-red-600 hover:text-white hover:bg-red-650 border border-[#E5E7EB] hover:border-red-600 rounded-[6px] transition-colors bg-white" 
                    onClick={() => handleDownloadPDF(ret)}
                    title="Download PDF"
                  >
                    <FaFilePdf className="text-xs" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default PreviousReturns;

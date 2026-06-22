import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

import { IprProperty } from '../types';

interface PropertyTableProps {
  properties?: IprProperty[];
  onEdit: (property: IprProperty) => void;
  onDelete: (property: IprProperty) => void;
}

const PropertyTable: React.FC<PropertyTableProps> = ({ properties = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter properties
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      prop.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.propertyType?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = typeFilter === 'All' || prop.propertyType === typeFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="font-outfit space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50 p-4 border border-slate-200/60 rounded-xl">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <FaSearch className="text-xs" />
          </span>
          <input
            type="text"
            placeholder="Search by district, type or address..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
          />
        </div>
        
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <FaFilter className="text-[0.65rem] text-slate-400" /> Type:
          </span>
          <select 
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="All">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Agricultural Land">Agricultural Land</option>
            <option value="Commercial">Commercial</option>
            <option value="Non-Agricultural Land">Non-Agricultural Land</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto w-full border border-slate-200/80 rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm font-sans">
          <thead className="bg-slate-50/75 text-slate-500 font-bold uppercase text-[0.7rem] tracking-wider font-outfit border-b border-slate-200/50">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">District & Location</th>
              <th className="px-6 py-4 whitespace-nowrap">Property Type</th>
              <th className="px-6 py-4 whitespace-nowrap">Specific Address</th>
              <th className="px-6 py-4 whitespace-nowrap">Acquisition Year</th>
              <th className="px-6 py-4 whitespace-nowrap">Acquisition Cost (₹)</th>
              <th className="px-6 py-4 whitespace-nowrap">Present Value (₹)</th>
              <th className="px-6 py-4 whitespace-nowrap">Ownership Details</th>
              <th className="px-6 py-4 whitespace-nowrap">Annual Income (₹)</th>
              <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium font-outfit">
                  No property records found matching filters.
                </td>
              </tr>
            ) : (
              currentItems.map((prop, idx) => (
                <tr key={prop.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">{prop.district}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{prop.propertyType}</td>
                  <td className="px-6 py-4 text-xs font-medium max-w-[200px] truncate" title={prop.address}>{prop.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">{prop.acquisitionYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">₹{Number(prop.acquisitionCost).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">₹{Number(prop.presentValue).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-xs max-w-[150px] truncate" title={prop.ownership}>{prop.ownership}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">₹{Number(prop.annualIncome || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button 
                        className="p-1.5 text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-all" 
                        onClick={() => onEdit(prop)}
                        title="Edit Property"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button 
                        className="p-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all" 
                        onClick={() => onDelete(prop)}
                        title="Delete Property"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-500">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProperties.length)} of {filteredProperties.length} properties
          </span>
          <div className="flex items-center gap-1">
            <button 
              className={`px-3 py-1.5 border border-slate-200 rounded-lg bg-white transition-all focus:outline-none ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all focus:outline-none ${currentPage === num ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'}`}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            ))}
            
            <button 
              className={`px-3 py-1.5 border border-slate-200 rounded-lg bg-white transition-all focus:outline-none ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyTable;

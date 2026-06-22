import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/DataTable';
import { FaUser, FaSearch, FaEnvelope, FaEye } from 'react-icons/fa';
import { User, EmployeeProfile } from '../../types';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<EmployeeProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ipr_users');
    if (saved) {
      try {
        const users: User[] = JSON.parse(saved);
        const filtered = users.filter(u => u.role === 'employee');
        setEmployees(filtered);
      } catch (e) {
        setEmployees([]);
      }
    }
  }, []);

  const handleAlertEmployee = (emp: User) => {
    if (emp.username) {
      const savedNotifs = localStorage.getItem('ipr_notifications') || '{}';
      let notifMap: Record<string, any> = {};
      try { notifMap = JSON.parse(savedNotifs); } catch(e) {}
      const userNotifs = notifMap[emp.username] || [];

      const newNotification = {
        id: Date.now(),
        message: `Official Alert: Please file your pending Annual Immovable Property Return (IPR) statement immediately.`,
        date: new Date().toLocaleDateString(),
        type: 'warning'
      };
      notifMap[emp.username] = [newNotification, ...userNotifs];
      localStorage.setItem('ipr_notifications', JSON.stringify(notifMap));
    }
    const empName = emp.profile && 'name' in emp.profile ? emp.profile.name : 'Employee';
    alert(`NIC Warning Dispatch: IPR compliance alert SMS and email reminder dispatched to ${empName} successfully.`);
  };

  const filteredEmployees = employees.filter(emp => {
    const profile = emp.profile as EmployeeProfile;
    if (!profile) return false;
    return (
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getInitials = (name: string) => {
    if (!name) return 'EMP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'Home', link: '/hod/dashboard' }, { label: 'Employee List' }]} />

      <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Employee List
        </h2>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 border-b border-[#E5E7EB] pb-1.5">Registered Department Employees</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-2 mb-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FaSearch className="text-xs" />
            </span>
            <input 
              type="text" 
              placeholder="Search by ID, Name, Department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#E5E7EB] rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4E8C] focus:border-[#1E4E8C] font-sans"
            />
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-sans">
            <FaUser className="text-3xl text-slate-200 mx-auto mb-2" />
            <p className="font-bold text-xs">No employees registered yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Register new employees via the portal login page to view them here.</p>
          </div>
        ) : (
          <DataTable
            headers={['Employee ID', 'Name', 'Department', 'Designation', 'Email', 'Actions']}
            data={filteredEmployees}
            emptyMessage="No employees match your search criteria."
            renderRow={(emp, idx) => {
              const profile = emp.profile as EmployeeProfile;
              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-[#E5E7EB] last:border-b-0">
                  <td className="px-4 py-3 text-xs font-bold text-[#1E4E8C]">{profile.employeeId}</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-800">{profile.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-550">{profile.department}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{profile.designation}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{profile.email}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex gap-2">
                      <button 
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] rounded-[6px] font-bold text-[10px] transition-colors focus:outline-none"
                        onClick={() => { setSelectedEmp(profile); setModalOpen(true); }}
                        title="View Profile Details"
                      >
                        <FaEye /> View
                      </button>
                      <button 
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-[6px] font-bold text-[10px] transition-colors focus:outline-none"
                        onClick={() => handleAlertEmployee(emp)}
                        title="Send Filing Reminder"
                      >
                        <FaEnvelope /> Alert
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        )}
      </div>

      {/* Employee Detail Modal */}
      {modalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] shadow-sm w-full max-w-xl max-h-[90vh] flex flex-col border border-[#E5E7EB]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-slate-50">
              <h3 className="text-xs font-bold text-[#1E4E8C] uppercase tracking-wider font-sans">Employee Service Profile</h3>
              <button 
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-lg font-bold focus:outline-none"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-[#374151] font-sans text-xs">
              <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-4">
                <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-[#E5E7EB] text-[#1E4E8C] flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {getInitials(selectedEmp.name)}
                </div>
                <div className="text-left space-y-1">
                  <h3 className="text-base font-bold text-[#1E4E8C]">{selectedEmp.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedEmp.designation}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedEmp.department} | ID: {selectedEmp.employeeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div><strong>Email:</strong> <span className="text-slate-600 block">{selectedEmp.email}</span></div>
                <div><strong>Phone:</strong> <span className="text-slate-600 block">{selectedEmp.phone}</span></div>
                <div><strong>DOB:</strong> <span className="text-slate-600 block">{selectedEmp.dob}</span></div>
                <div><strong>Gender:</strong> <span className="text-slate-600 block">{selectedEmp.gender}</span></div>
                <div><strong>Service Cadre:</strong> <span className="text-slate-600 block">{selectedEmp.service}</span></div>
                <div><strong>Posting Location:</strong> <span className="text-slate-600 block">{selectedEmp.placeOfPosting}</span></div>
                <div><strong>Joining Date:</strong> <span className="text-slate-600 block">{selectedEmp.joiningDate}</span></div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-4 space-y-3 text-left">
                <div>
                  <strong>Present Address:</strong>
                  <p className="text-xs text-slate-550 mt-1 bg-slate-50 p-2.5 rounded-[6px] border border-[#E5E7EB]">{selectedEmp.presentAddress}</p>
                </div>
                <div>
                  <strong>Permanent Address:</strong>
                  <p className="text-xs text-slate-550 mt-1 bg-slate-50 p-2.5 rounded-[6px] border border-[#E5E7EB]">{selectedEmp.permanentAddress}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-4 border-t border-[#E5E7EB] bg-slate-50 rounded-b-[6px]">
              <button 
                className="px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white font-bold rounded-[6px] text-xs transition-colors shadow-sm focus:outline-none"
                onClick={() => setModalOpen(false)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

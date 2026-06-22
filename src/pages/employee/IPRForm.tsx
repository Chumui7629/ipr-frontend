import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import Loader from '../../components/Loader';
import { FaPlus, FaTrash, FaCheckCircle, FaFileSignature, FaEraser, FaEye, FaSave } from 'react-icons/fa';
import { EmployeeProfile, IprSubmission, User } from '../../types';

interface FormPropertyRow {
  id?: number;
  district: string;
  propertyName: string;
  propertyType: string;
  acquisitionCost: number | string;
  presentValue: number | string;
  ownerName: string;
  acquisitionDetails: string;
  annualIncome?: number | string;
  remarks?: string;
}

const IPRForm: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Employee details from profile
  const [employee, setEmployee] = useState({
    name: '',
    service: '',
    department: '',
    designation: '',
    placeOfPosting: '',
    serviceLength: '0',
    annualIncome: '',
    reportingYear: '2025-26',
    filingDate: new Date().toISOString().split('T')[0]
  });

  // Table Property list inside form
  const [formProperties, setFormProperties] = useState<FormPropertyRow[]>([]);

  // Temporary property row state (for adding row in grid)
  const [newPropRow, setNewPropRow] = useState<FormPropertyRow>({
    district: '',
    propertyName: '',
    propertyType: 'Residential',
    acquisitionCost: '',
    presentValue: '',
    ownerName: 'Self',
    acquisitionDetails: '',
    annualIncome: 0,
    remarks: ''
  });

  const [isResubmitting, setIsResubmitting] = useState<string | null>(null);

  // Initialize and load profile/draft/resubmission from localStorage
  useEffect(() => {
    const savedActive = localStorage.getItem('ipr_active_user');
    let activeUsername = '';
    if (savedActive) {
      try {
        const active: User = JSON.parse(savedActive);
        activeUsername = active.username;
        if (active.profile) {
          const prof = active.profile as EmployeeProfile;
          setEmployee(prev => ({
            ...prev,
            name: prof.name || '',
            service: prof.service || '',
            department: prof.department || '',
            designation: prof.designation || '',
            placeOfPosting: prof.placeOfPosting || '',
            serviceLength: prof.joiningDate ? (new Date().getFullYear() - new Date(prof.joiningDate).getFullYear()).toString() : '0'
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const resubmitId = searchParams.get('resubmitId');
    if (resubmitId) {
      setIsResubmitting(resubmitId);
      const savedSubmissions = localStorage.getItem('ipr_submissions');
      if (savedSubmissions) {
        try {
          const list: IprSubmission[] = JSON.parse(savedSubmissions);
          const found = list.find(s => s.id === resubmitId);
          if (found) {
            setEmployee(found.employeeDetails as any);
            setFormProperties(found.properties as any);
            setDeclared(true);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (activeUsername) {
      const savedDraft = localStorage.getItem(`employeeDraftReturn_${activeUsername}`);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setEmployee(draft.employee);
          setFormProperties(draft.properties);
          setDeclared(draft.declared);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // --- E-Signature Canvas Drawing Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [previewOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (!e.touches || e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleAddRow = () => {
    if (!newPropRow.district || !newPropRow.propertyName || !newPropRow.acquisitionCost || !newPropRow.presentValue) {
      alert("Please fill all mandatory property row details (District, Description, Cost, Value).");
      return;
    }
    const updated = [
      ...formProperties,
      {
        ...newPropRow,
        id: Date.now(),
        acquisitionCost: Number(newPropRow.acquisitionCost),
        presentValue: Number(newPropRow.presentValue),
        annualIncome: Number(newPropRow.annualIncome || 0)
      }
    ];
    setFormProperties(updated);
    setNewPropRow({
      district: '',
      propertyName: '',
      propertyType: 'Residential',
      acquisitionCost: '',
      presentValue: '',
      ownerName: 'Self',
      acquisitionDetails: '',
      annualIncome: 0,
      remarks: ''
    });
  };

  const handleDeleteRow = (id?: number) => {
    if (!id) return;
    const updated = formProperties.filter(row => row.id !== id);
    setFormProperties(updated);
  };

  const saveDraft = () => {
    const savedActive = localStorage.getItem('ipr_active_user');
    let username = 'guest';
    if (savedActive) {
      try {
        const active = JSON.parse(savedActive);
        username = active.username || 'guest';
      } catch (e) {}
    }
    const draftData = {
      employee,
      properties: formProperties,
      declared
    };
    localStorage.setItem(`employeeDraftReturn_${username}`, JSON.stringify(draftData));
    alert("Draft return saved successfully!");
  };

  const handleSubmitReturn = () => {
    if (!declared) {
      alert("Please check the declaration box first.");
      return;
    }

    const canvas = canvasRef.current;
    let signatureDataUrl = '';
    if (canvas) {
      signatureDataUrl = canvas.toDataURL();
    }

    setLoading(true);
    setTimeout(() => {
      const savedActive = localStorage.getItem('ipr_active_user');
      let username = '';
      if (savedActive) {
        try {
          const active = JSON.parse(savedActive);
          username = active.username || '';
        } catch (e) {}
      }

      const savedSubmissions = localStorage.getItem('ipr_submissions');
      let subList: IprSubmission[] = [];
      if (savedSubmissions) {
        try { subList = JSON.parse(savedSubmissions); } catch(e) {}
      }

      if (isResubmitting) {
        subList = subList.map(sub => {
          if (sub.id === isResubmitting) {
            return {
              ...sub,
              status: 'Submitted',
              hodRemarks: 'Pending Verification by HOD (Resubmitted Correction)',
              lastUpdated: new Date().toISOString().split('T')[0],
              employeeDetails: employee as any,
              properties: formProperties as any,
              signature: signatureDataUrl || sub.signature,
              username: username
            };
          }
          return sub;
        });
        localStorage.setItem('ipr_submissions', JSON.stringify(subList));
      } else {
        const submission: IprSubmission = {
          id: 'SUB' + Math.floor(100000 + Math.random() * 900000),
          reportingYear: employee.reportingYear,
          submissionDate: employee.filingDate,
          status: 'Submitted',
          hodRemarks: 'Pending Verification by HOD',
          lastUpdated: new Date().toISOString().split('T')[0],
          employeeDetails: employee as any,
          properties: formProperties as any,
          signature: signatureDataUrl,
          username: username
        };
        subList = [submission, ...subList];
        localStorage.setItem('ipr_submissions', JSON.stringify(subList));
      }

      if (username) {
        localStorage.removeItem(`employeeDraftReturn_${username}`);
      }

      setLoading(false);
      alert(isResubmitting ? "Annual IPR statement corrected and re-submitted successfully!" : "Annual Immovable Property Return submitted and E-Signed successfully!");
      navigate('/employee/my-submissions');
    }, 1500);
  };

  return (
    <div className="font-sans space-y-4">
      <Loader active={loading} />
      <Breadcrumb items={[{ label: 'IPR Filing' }]} />

      {/* Main Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#cbd5e1] pb-3 text-left">
        <div>
          <h2 className="text-lg font-bold text-[#1E4E8C] uppercase tracking-wide">
            Annual Return on Immovable Property (IPR)
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            (As on 31st December {employee.reportingYear || 'YYYY'})
          </p>
          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
            (Rule-18, Tripura Civil Services (Conduct) Rules, 1988)
          </p>
        </div>

        {/* Guidelines Button */}
        <button
          type="button"
          onClick={() => alert(" त्रिपुरा सिविल सेवा (आचरण) नियम, 1988 के नियम-18 के तहत प्रत्येक कर्मचारी को वार्षिक अचल संपत्ति विवरण (IPR) दाखिल करना अनिवार्य है।")}
          className="mt-2 sm:mt-0 px-3 py-1.5 border border-[#1E4E8C] text-[#1E4E8C] hover:bg-[#1E4E8C]/5 text-xs font-bold rounded-[6px] transition-colors focus:outline-none"
        >
          Guidelines
        </button>
      </div>

      {/* Section 1: Employee Details */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">EMPLOYEE DETAILS</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employee Name</label>
            <input type="text" value={employee.name} disabled className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-slate-50 text-slate-500 font-semibold cursor-not-allowed" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Cadre</label>
            <input type="text" value={employee.service} disabled className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-slate-50 text-slate-500 font-semibold cursor-not-allowed" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <input type="text" value={employee.department} disabled className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-slate-50 text-slate-500 font-semibold cursor-not-allowed" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Designation</label>
            <input type="text" value={employee.designation} disabled className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-slate-50 text-slate-500 font-semibold cursor-not-allowed" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Place of Posting</label>
            <input type="text" value={employee.placeOfPosting} disabled className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-slate-50 text-slate-500 font-semibold cursor-not-allowed" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Length of Service</label>
            <input type="text" value={employee.serviceLength} onChange={(e) => setEmployee({ ...employee, serviceLength: e.target.value })} className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white text-slate-800 focus:outline-none focus:border-[#1E4E8C]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Annual Income (₹)</label>
            <input type="number" value={employee.annualIncome} onChange={(e) => setEmployee({ ...employee, annualIncome: e.target.value })} required className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white text-slate-800 focus:outline-none focus:border-[#1E4E8C] font-mono" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reporting Year</label>
            <select value={employee.reportingYear} onChange={(e) => setEmployee({ ...employee, reportingYear: e.target.value })} className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white text-slate-800 focus:outline-none focus:border-[#1E4E8C]">
              <option value="2025-26">2025-26 (Current)</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">As on Date</label>
            <input type="date" value={employee.filingDate} onChange={(e) => setEmployee({ ...employee, filingDate: e.target.value })} className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white text-slate-800 focus:outline-none focus:border-[#1E4E8C] font-mono" />
          </div>
        </div>
      </div>

      {/* Section 2: Property Details */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">DETAILS OF IMMOVABLE PROPERTY</h3>
        
        <div className="overflow-x-auto w-full border border-[#E5E7EB] rounded-[6px]">
          <table className="min-w-full divide-y divide-[#E5E7EB] text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-[#E5E7EB]">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">District/Sub Division/Taluk/Village/City/Postal Address</th>
                <th className="px-3 py-2 whitespace-nowrap">Name & Details of Property</th>
                <th className="px-3 py-2 whitespace-nowrap">Type</th>
                <th className="px-3 py-2 whitespace-nowrap">Cost of Construction/Acquisition</th>
                <th className="px-3 py-2 whitespace-nowrap">Present Value</th>
                <th className="px-3 py-2 whitespace-nowrap">Owner Name</th>
                <th className="px-3 py-2 whitespace-nowrap">Acquisition Details</th>
                <th className="px-3 py-2 whitespace-nowrap">Annual Income from Property</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-slate-700 bg-white">
              {formProperties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-slate-400 font-semibold bg-slate-50/30">
                    No property records available
                  </td>
                </tr>
              ) : (
                formProperties.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 font-medium whitespace-pre-wrap">{row.district}</td>
                    <td className="px-3 py-2 whitespace-pre-wrap">{row.propertyName}</td>
                    <td className="px-3 py-2">{row.propertyType}</td>
                    <td className="px-3 py-2 font-mono">₹{Number(row.acquisitionCost).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 font-mono">₹{Number(row.presentValue).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 font-medium">{row.ownerName}</td>
                    <td className="px-3 py-2 whitespace-pre-wrap">{row.acquisitionDetails}</td>
                    <td className="px-3 py-2 font-mono">₹{Number(row.annualIncome || 0).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-center">
                      <button 
                        className="p-1 text-red-600 hover:bg-slate-50 rounded border border-transparent hover:border-[#cbd5e1] focus:outline-none" 
                        onClick={() => handleDeleteRow(row.id)}
                        title="Delete"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* Add New Entry Row */}
              <tr className="bg-slate-50/35 border-t border-[#E5E7EB]">
                <td className="p-2">
                  <select 
                    value={newPropRow.district}
                    onChange={(e) => setNewPropRow({ ...newPropRow, district: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                  >
                    <option value="">Select Location Address</option>
                    <option value="West Tripura">West Tripura</option>
                    <option value="South Tripura">South Tripura</option>
                    <option value="North Tripura">North Tripura</option>
                    <option value="Dhalai">Dhalai</option>
                    <option value="Unakoti">Unakoti</option>
                    <option value="Khowai">Khowai</option>
                    <option value="Sepahijala">Sepahijala</option>
                    <option value="Gomati">Gomati</option>
                  </select>
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    placeholder="Describe details"
                    value={newPropRow.propertyName}
                    onChange={(e) => setNewPropRow({ ...newPropRow, propertyName: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                  />
                </td>
                <td className="p-2">
                  <select 
                    value={newPropRow.propertyType}
                    onChange={(e) => setNewPropRow({ ...newPropRow, propertyType: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Agricultural Land">Agricultural</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    placeholder="Cost"
                    value={newPropRow.acquisitionCost}
                    onChange={(e) => setNewPropRow({ ...newPropRow, acquisitionCost: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C] font-mono"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    placeholder="Value"
                    value={newPropRow.presentValue}
                    onChange={(e) => setNewPropRow({ ...newPropRow, presentValue: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C] font-mono"
                  />
                </td>
                <td className="p-2">
                  <select 
                    value={newPropRow.ownerName}
                    onChange={(e) => setNewPropRow({ ...newPropRow, ownerName: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Joint">Joint</option>
                    <option value="Family">Family</option>
                  </select>
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    placeholder="Purchase mode"
                    value={newPropRow.acquisitionDetails}
                    onChange={(e) => setNewPropRow({ ...newPropRow, acquisitionDetails: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C]"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    placeholder="Income"
                    value={newPropRow.annualIncome}
                    onChange={(e) => setNewPropRow({ ...newPropRow, annualIncome: e.target.value })}
                    className="w-full px-2 py-1 border border-[#cbd5e1] rounded-[6px] text-xs focus:outline-none focus:border-[#1E4E8C] font-mono"
                  />
                </td>
                <td className="p-2 text-center">
                  <button 
                    className="flex items-center justify-center gap-1 mx-auto px-3 py-1 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold transition-colors focus:outline-none shadow-sm"
                    onClick={handleAddRow}
                  >
                    <FaPlus className="text-[9px]" /> Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Declaration */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">DECLARATION</h3>
        <label className="flex items-start gap-2.5 cursor-pointer p-1">
          <input 
            type="checkbox" 
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)} 
            className="w-4 h-4 rounded border-[#cbd5e1] text-[#1E4E8C] focus:ring-[#1E4E8C] mt-0.5 flex-shrink-0"
          />
          <span className="text-xs font-medium leading-relaxed text-slate-700">
            I hereby declare that the information provided is complete, true and correct.
          </span>
        </label>
      </div>

      {/* Section 4: E-Signature */}
      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#E5E7EB] pb-1.5">Signature (e-Sign area)</h3>
        <p className="text-xs text-slate-400 font-semibold">
          Please draw your official signature inside the canvas panel below to complete e-sign authentication.
        </p>
        
        <div className="w-full sm:w-96 border border-[#cbd5e1] rounded-[6px] overflow-hidden bg-slate-50">
          <canvas
            ref={canvasRef}
            width={384}
            height={130}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-white block w-full touch-none border-b border-[#cbd5e1] cursor-crosshair"
          />
          <div className="flex justify-between items-center px-3 py-1.5 bg-slate-50">
            <button 
              className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-red-655 bg-white hover:bg-slate-100 border border-[#cbd5e1] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
              onClick={clearSignature}
            >
              <FaEraser /> Clear Canvas
            </button>
            <span className="text-[9px] font-bold text-[#1E4E8C] uppercase tracking-wider flex items-center gap-1">
              <FaFileSignature /> Secure E-Signature
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="flex justify-end gap-2 pt-2 pb-6">
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-50 border border-[#cbd5e1] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
          onClick={() => navigate('/employee/dashboard')}
        >
          Back to Dashboard
        </button>
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-50 border border-[#cbd5e1] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
          onClick={saveDraft}
        >
          <FaSave /> Save as Draft
        </button>
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-50 border border-[#cbd5e1] rounded-[6px] text-xs font-bold transition-colors focus:outline-none"
          onClick={() => setPreviewOpen(true)}
        >
          <FaEye /> Preview
        </button>
        <button 
          className={`flex items-center gap-1.5 px-4 py-1.5 text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none ${declared ? 'bg-[#16a34a] hover:bg-[#15803d]' : 'bg-slate-300 cursor-not-allowed'}`}
          onClick={handleSubmitReturn} 
          disabled={!declared}
        >
          <FaCheckCircle /> Submit
        </button>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-[6px] border border-[#cbd5e1] shadow-lg overflow-hidden my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd5e1] bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Preview of Annual Immovable Property Return</h3>
              <button className="text-slate-400 hover:text-slate-655 font-bold" onClick={() => setPreviewOpen(false)}>×</button>
            </div>
            <div className="p-5 space-y-5 text-left text-xs text-[#374151]">
              
              {/* Tripura Gov Header replica */}
              <div className="text-center border-b border-[#cbd5e1] pb-3">
                <h2 className="text-sm font-bold tracking-wide text-slate-800 uppercase">GOVERNMENT OF TRIPURA</h2>
                <h4 className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Immovable Property Return Statement for FY {employee.reportingYear}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Filing Date: {employee.filingDate}</p>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 bg-slate-50 p-3 border border-[#E5E7EB] rounded-[6px]">
                <div><strong>Employee Name:</strong> {employee.name}</div>
                <div><strong>Service/Cadre:</strong> {employee.service}</div>
                <div><strong>Department:</strong> {employee.department}</div>
                <div><strong>Designation:</strong> {employee.designation}</div>
                <div><strong>Current Posting:</strong> {employee.placeOfPosting}</div>
                <div><strong>Annual Basic Pay:</strong> ₹{Number(employee.annualIncome).toLocaleString('en-IN')}</div>
              </div>

              {/* Properties list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1E4E8C] uppercase tracking-wider border-b border-[#E5E7EB] pb-1">Properties Summary</h4>
                <div className="overflow-x-auto w-full border border-[#cbd5e1] rounded-[6px]">
                  <table className="min-w-full divide-y divide-[#cbd5e1] text-xs font-sans text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-[#E5E7EB]">
                        <th className="px-3 py-2">Location Address</th>
                        <th className="px-3 py-2">Description</th>
                        <th className="px-3 py-2">Cost (₹)</th>
                        <th className="px-3 py-2">Value (₹)</th>
                        <th className="px-3 py-2">Ownership</th>
                        <th className="px-3 py-2">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cbd5e1] text-slate-655 bg-white">
                      {formProperties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-center text-slate-400 font-medium">Nil Return (No properties declared)</td>
                        </tr>
                      ) : (
                        formProperties.map(row => (
                          <tr key={row.id}>
                            <td className="px-3 py-2 font-bold text-slate-800">{row.district}</td>
                            <td className="px-3 py-2">{row.propertyName}</td>
                            <td className="px-3 py-2 font-mono">₹{Number(row.acquisitionCost).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 font-mono">₹{Number(row.presentValue).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2">{row.ownerName}</td>
                            <td className="px-3 py-2 whitespace-pre-wrap">{row.acquisitionDetails}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Secure E-Sign confirmation */}
              <div className="flex justify-between items-center border-t border-dashed border-[#cbd5e1] pt-4">
                <div>
                  <p className="text-[10px] italic text-slate-400 font-semibold uppercase tracking-wider">E-Signed Authenticated via NIC Tripura</p>
                  <strong className="text-xs font-bold text-slate-800 mt-0.5 block">{employee.name}</strong>
                </div>
                <div className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-800 rounded-[6px] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  ✔ E-SIGNATURE VERIFIED
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-[#cbd5e1]">
              <button className="px-3 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-200/50 rounded-[6px] transition-colors focus:outline-none" onClick={() => setPreviewOpen(false)}>Close Preview</button>
              <button className={`px-3 py-1.5 rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none ${declared ? 'bg-[#16a34a] hover:bg-[#15803d] text-white' : 'bg-slate-350 text-slate-500 cursor-not-allowed'}`} onClick={() => { setPreviewOpen(false); handleSubmitReturn(); }} disabled={!declared}>E-Sign & Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPRForm;

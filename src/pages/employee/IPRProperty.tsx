import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import PropertyTable from '../../components/PropertyTable';
import ConfirmModal from '../../components/ConfirmModal';
import { FaPlus, FaSave } from 'react-icons/fa';
import { IprProperty, User } from '../../types';

const IPRProperty: React.FC = () => {
  const [properties, setProperties] = useState<IprProperty[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<IprProperty | null>(null);

  // Property Form State
  const [propertyForm, setPropertyForm] = useState<IprProperty>({
    district: '',
    propertyType: 'Residential',
    address: '',
    acquisitionYear: new Date().getFullYear().toString(),
    acquisitionCost: '',
    presentValue: '',
    ownership: 'Self',
    annualIncome: 0,
    status: 'Approved'
  });

  useEffect(() => {
    const savedActive = localStorage.getItem('ipr_active_user');
    let username = '';
    if (savedActive) {
      try {
        const active: User = JSON.parse(savedActive);
        username = active.username;
      } catch (e) {}
    }
    
    if (username) {
      const saved = localStorage.getItem(`employeeProperties_${username}`);
      if (saved) {
        try {
          setProperties(JSON.parse(saved));
        } catch (e) {
          setProperties([]);
        }
      } else {
        setProperties([]);
        localStorage.setItem(`employeeProperties_${username}`, JSON.stringify([]));
      }
    } else {
      setProperties([]);
    }
  }, []);

  const savePropertiesList = (newList: IprProperty[]) => {
    setProperties(newList);
    const savedActive = localStorage.getItem('ipr_active_user');
    let username = '';
    if (savedActive) {
      try {
        const active: User = JSON.parse(savedActive);
        username = active.username;
      } catch (e) {}
    }
    if (username) {
      localStorage.setItem(`employeeProperties_${username}`, JSON.stringify(newList));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: IprProperty = {
      ...propertyForm,
      id: Date.now(),
      acquisitionCost: Number(propertyForm.acquisitionCost),
      presentValue: Number(propertyForm.presentValue),
      annualIncome: Number(propertyForm.annualIncome || 0)
    };
    const updated = [newProp, ...properties];
    savePropertiesList(updated);
    setAddModalOpen(false);
    resetForm();
    alert("New property details added successfully!");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    const updated = properties.map(p => p.id === selectedProperty.id ? {
      ...propertyForm,
      id: selectedProperty.id,
      acquisitionCost: Number(propertyForm.acquisitionCost),
      presentValue: Number(propertyForm.presentValue),
      annualIncome: Number(propertyForm.annualIncome || 0)
    } : p);
    savePropertiesList(updated);
    setEditModalOpen(false);
    setSelectedProperty(null);
    resetForm();
    alert("Property details updated successfully!");
  };

  const handleDeleteConfirm = () => {
    if (!selectedProperty) return;
    const updated = properties.filter(p => p.id !== selectedProperty.id);
    savePropertiesList(updated);
    setDeleteModalOpen(false);
    setSelectedProperty(null);
    alert("Property record deleted successfully!");
  };

  const resetForm = () => {
    setPropertyForm({
      district: '',
      propertyType: 'Residential',
      address: '',
      acquisitionYear: new Date().getFullYear().toString(),
      acquisitionCost: '',
      presentValue: '',
      ownership: 'Self',
      annualIncome: 0,
      status: 'Approved'
    });
  };

  const openEditModal = (prop: IprProperty) => {
    setSelectedProperty(prop);
    setPropertyForm({ ...prop });
    setEditModalOpen(true);
  };

  const openDeleteModal = (prop: IprProperty) => {
    setSelectedProperty(prop);
    setDeleteModalOpen(true);
  };

  return (
    <div className="font-sans space-y-4">
      <Breadcrumb items={[{ label: 'Property List' }]} />

      <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 shadow-sm text-left space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Registered Immovable Properties</h2>
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none" 
            onClick={() => { resetForm(); setAddModalOpen(true); }}
          >
            <FaPlus className="text-[9px]" /> Add Immovable Property
          </button>
        </div>

        <PropertyTable 
          properties={properties} 
          onEdit={openEditModal} 
          onDelete={openDeleteModal} 
        />
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-[6px] shadow-md border border-[#cbd5e1] overflow-hidden my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd5e1] bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Register New Immovable Property</h3>
              <button className="text-slate-400 hover:text-slate-600 font-bold text-sm" onClick={() => setAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="p-4 space-y-3 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">District / Division</label>
                    <select 
                      value={propertyForm.district}
                      onChange={(e) => setPropertyForm({ ...propertyForm, district: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                    >
                      <option value="">Select District</option>
                      <option value="West Tripura">West Tripura</option>
                      <option value="South Tripura">South Tripura</option>
                      <option value="North Tripura">North Tripura</option>
                      <option value="Dhalai">Dhalai</option>
                      <option value="Unakoti">Unakoti</option>
                      <option value="Khowai">Khowai</option>
                      <option value="Sepahijala">Sepahijala</option>
                      <option value="Gomati">Gomati</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Type</label>
                    <select 
                      value={propertyForm.propertyType}
                      onChange={(e) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                    >
                      <option value="Residential">Residential House/Building</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                      <option value="Commercial">Commercial Shop/Offices</option>
                      <option value="Non-Agricultural Land">Non-Agricultural Land</option>
                      <option value="Other">Other Immovable Property</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Specific Location / Address</label>
                  <textarea 
                    rows={2} 
                    placeholder="Enter specific address, ward number, area plot number details"
                    value={propertyForm.address} 
                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })} 
                    required 
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acquisition Cost (₹)</label>
                    <input 
                      type="number" 
                      placeholder="Cost of purchase/construction"
                      value={propertyForm.acquisitionCost} 
                      onChange={(e) => setPropertyForm({ ...propertyForm, acquisitionCost: e.target.value })} 
                      required 
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Present Value (₹) (Approx)</label>
                    <input 
                      type="number" 
                      placeholder="Estimated current value"
                      value={propertyForm.presentValue} 
                      onChange={(e) => setPropertyForm({ ...propertyForm, presentValue: e.target.value })} 
                      required 
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ownership Details</label>
                    <select
                      value={propertyForm.ownership}
                      onChange={(e) => setPropertyForm({ ...propertyForm, ownership: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                    >
                      <option value="Self">Self (Sole ownership)</option>
                      <option value="Spouse">Spouse (Wife/Husband)</option>
                      <option value="Joint (Self & Spouse)">Joint (Self & Spouse)</option>
                      <option value="Inherited (Family)">Inherited (Family joint)</option>
                      <option value="Other">Other relative</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acquisition Year</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2018"
                      value={propertyForm.acquisitionYear} 
                      onChange={(e) => setPropertyForm({ ...propertyForm, acquisitionYear: e.target.value })} 
                      required 
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Annual Income from Property (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. rent income, agricultural lease"
                    value={propertyForm.annualIncome} 
                    onChange={(e) => setPropertyForm({ ...propertyForm, annualIncome: e.target.value })} 
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-[#cbd5e1]">
                <button type="button" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-[6px] border border-[#cbd5e1] bg-white transition-colors focus:outline-none" onClick={() => setAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="flex items-center gap-1 px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none"><FaSave /> Save Property</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-[6px] shadow-md border border-[#cbd5e1] overflow-hidden my-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd5e1] bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Edit Property Details</h3>
              <button className="text-slate-400 hover:text-slate-600 font-bold text-sm" onClick={() => setEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-4 space-y-3 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">District / Division</label>
                    <select 
                      value={propertyForm.district}
                      onChange={(e) => setPropertyForm({ ...propertyForm, district: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                    >
                      <option value="West Tripura">West Tripura</option>
                      <option value="South Tripura">South Tripura</option>
                      <option value="North Tripura">North Tripura</option>
                      <option value="Dhalai">Dhalai</option>
                      <option value="Unakoti">Unakoti</option>
                      <option value="Khowai">Khowai</option>
                      <option value="Sepahijala">Sepahijala</option>
                      <option value="Gomati">Gomati</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Type</label>
                    <select 
                      value={propertyForm.propertyType}
                      onChange={(e) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                    >
                      <option value="Residential">Residential House/Building</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                      <option value="Commercial">Commercial Shop/Offices</option>
                      <option value="Non-Agricultural Land">Non-Agricultural Land</option>
                      <option value="Other">Other Immovable Property</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Specific Location / Address</label>
                  <textarea 
                    rows={2} 
                    value={propertyForm.address} 
                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })} 
                    required 
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acquisition Cost (₹)</label>
                    <input 
                      type="number" 
                      value={propertyForm.acquisitionCost} 
                      onChange={(e) => setPropertyForm({ ...propertyForm, acquisitionCost: e.target.value })} 
                      required 
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Present Value (₹)</label>
                    <input 
                      type="number" 
                      value={propertyForm.presentValue} 
                      onChange={(e) => setPropertyForm({ ...propertyForm, presentValue: e.target.value })} 
                      required 
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ownership Details</label>
                    <select
                      value={propertyForm.ownership}
                      onChange={(e) => setPropertyForm({ ...propertyForm, ownership: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C]"
                    >
                      <option value="Self">Self</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Joint (Self & Spouse)">Joint (Self & Spouse)</option>
                      <option value="Inherited (Family)">Inherited (Family joint)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acquisition Year</label>
                    <input 
                      type="text" 
                      value={propertyForm.acquisitionYear} 
                      onChange={(e) => setPropertyForm({ ...propertyForm, acquisitionYear: e.target.value })} 
                      required 
                      className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Annual Income from Property (₹)</label>
                  <input 
                    type="number" 
                    value={propertyForm.annualIncome} 
                    onChange={(e) => setPropertyForm({ ...propertyForm, annualIncome: e.target.value })} 
                    className="w-full px-2.5 py-1.5 border border-[#cbd5e1] rounded-[6px] text-xs bg-white focus:outline-none focus:border-[#1E4E8C] font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-[#cbd5e1]">
                <button type="button" className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-[6px] border border-[#cbd5e1] bg-white transition-colors focus:outline-none" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="flex items-center gap-1 px-3 py-1.5 bg-[#1E4E8C] hover:bg-[#154694] text-white rounded-[6px] text-xs font-bold shadow-sm transition-colors focus:outline-none"><FaSave /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal 
        show={deleteModalOpen}
        title="Confirm Property Deletion"
        message={`Are you sure you want to delete the property at ${selectedProperty?.address}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        variant="danger"
        confirmText="Delete Record"
      />
    </div>
  );
};

export default IPRProperty;

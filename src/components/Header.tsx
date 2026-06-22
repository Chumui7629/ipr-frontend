import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full text-center pb-4 border-b border-[#E5E7EB] mb-5 font-sans">
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-[#1E4E8C] tracking-wider uppercase">
          Government of Tripura
        </h1>
        <h2 className="text-[10px] font-bold text-slate-500 tracking-wider">
          National Informatics Centre — Tripura State Unit
        </h2>
      </div>

      <div className="w-12 h-0.5 bg-[#ea580c] mx-auto my-2.5"></div>

      <div>
        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
          Immovable Property Return (IPR) Management System
        </h4>
      </div>
    </header>
  );
};

export default Header;

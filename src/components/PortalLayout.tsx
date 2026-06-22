import React from 'react';
import Header from './Header';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#F7F8FA] font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-[6px] border border-[#E5E7EB] shadow-sm overflow-hidden py-8 px-5 md:px-8 flex flex-col items-center">
        {/* Tripura Government Header */}
        <Header />

        <div className="w-full">
          {children}
        </div>

        {/* Secure Portal Footer */}
        <div className="w-full border-t border-[#E5E7EB] mt-8 pt-5 flex flex-col items-center gap-1 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-0.5 border border-[#E5E7EB] rounded-[6px] font-sans text-[9px]">
            <span className="text-[#1E4E8C]">N</span>
            <span className="text-amber-500">I</span>
            <span className="text-emerald-700">C</span>
          </div>
          <p className="normal-case font-bold text-slate-500">Designed, Developed & Hosted by National Informatics Centre (NIC)</p>
          <p className="text-[9px] font-bold text-slate-400 normal-case">&copy; {new Date().getFullYear()} Government of Tripura. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;

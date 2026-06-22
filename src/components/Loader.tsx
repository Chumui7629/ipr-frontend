import React from 'react';

interface LoaderProps {
  active: boolean;
}

const Loader: React.FC<LoaderProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
      <div className="w-12 h-12 border-4 border-gov-secondary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;

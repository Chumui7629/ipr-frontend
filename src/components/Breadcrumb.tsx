import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const role = localStorage.getItem('activeUserRole');
  const homePath = role === 'hod' ? '/hod/dashboard' : '/employee/dashboard';

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-slate-500 mb-6 font-outfit" aria-label="Breadcrumb">
      <div className="flex items-center">
        <Link to={homePath} className="hover:text-gov-secondary transition-colors duration-150">
          Home
        </Link>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-slate-300 select-none">/</span>
          {item.link ? (
            <Link to={item.link} className="hover:text-gov-secondary transition-colors duration-150">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;

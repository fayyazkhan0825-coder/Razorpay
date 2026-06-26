import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/10 font-medium border-b border-slate-200/50 dark:border-slate-800/30">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center hover:text-primary transition-colors text-slate-400 dark:text-slate-500 hover:dark:text-white"
          >
            <FiHome className="w-3.5 h-3.5 mr-1.5" />
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayLabel = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');

          // Skip showing dashboard as a separate breadcrumb if it is the first segment (home covers it)
          if (name === 'dashboard' && index === 0) return null;

          return (
            <li key={name} className="flex items-center">
              <FiChevronRight className="w-3.5 h-3.5 mx-1 text-slate-450 dark:text-slate-650" />
              {isLast ? (
                <span className="text-slate-900 dark:text-white font-bold select-none capitalize">
                  {displayLabel}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-primary transition-colors capitalize"
                >
                  {displayLabel}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

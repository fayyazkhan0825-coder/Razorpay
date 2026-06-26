import React from 'react';
import { FiFolder } from 'react-icons/fi';

const EmptyState = ({ title = 'No data found', description = 'Try adjusting your search or filter values.', actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm fade-in">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4 animate-bounce">
        <FiFolder className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;

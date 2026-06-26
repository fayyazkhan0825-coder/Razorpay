import React from 'react';
import Spinner from './Spinner';

const Loader = ({ message = 'Loading details...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700/50 max-w-xs w-full text-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4 animate-pulse">
          <span className="text-xl font-bold text-primary">R</span>
        </div>
        <Spinner size="lg" className="mb-4 text-primary" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>
      </div>
    </div>
  );
};

export default Loader;

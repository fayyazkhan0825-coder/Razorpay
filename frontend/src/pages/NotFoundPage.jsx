import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center fade-in">
        
        {/* Floating animated icon box */}
        <div className="inline-flex items-center justify-center p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl shadow-lg mb-6 text-rose-500 animate-bounce">
          <FiAlertTriangle className="w-12 h-12" />
        </div>

        <h1 className="text-8xl font-black font-sans text-slate-900 dark:text-white tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-550 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-premium hover:shadow-premium-hover transition-all focus:ring-4 focus:ring-primary/25"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

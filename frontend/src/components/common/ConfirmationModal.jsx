import React from 'react';
import Spinner from './Spinner';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500/20',
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary/20',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500/20',
  };

  const selectedBtnStyle = typeStyles[type] || typeStyles.primary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-premium fade-in">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2.5 rounded-full ${type === 'danger' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-500' : 'bg-primary/10 text-primary'}`}>
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>

        <div className="flex space-x-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm focus:ring-4 flex items-center justify-center disabled:opacity-75 ${selectedBtnStyle}`}
          >
            {isLoading ? <Spinner size="sm" className="mr-2 text-white" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || '').toUpperCase();

  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  };

  const icons = {
    PENDING: <FiClock className="w-3.5 h-3.5 mr-1" />,
    APPROVED: <FiCheckCircle className="w-3.5 h-3.5 mr-1" />,
    REJECTED: <FiXCircle className="w-3.5 h-3.5 mr-1" />,
  };

  const selectedStyle = styles[normalizedStatus] || styles.PENDING;
  const selectedIcon = icons[normalizedStatus] || icons.PENDING;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedStyle}`}>
      {selectedIcon}
      {normalizedStatus}
    </span>
  );
};

export default StatusBadge;

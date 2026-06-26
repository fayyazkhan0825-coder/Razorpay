import React from 'react';

const SkeletonLoader = ({ type = 'table', count = 3 }) => {
  const shimmer = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg';

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-premium">
            <div className="flex justify-between items-center mb-4">
              <div className={`h-4 w-24 ${shimmer}`} />
              <div className={`h-8 w-8 rounded-full ${shimmer}`} />
            </div>
            <div className={`h-8 w-32 ${shimmer} mb-2`} />
            <div className={`h-3.5 w-16 ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-premium">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
          <div className={`h-8 w-48 ${shimmer}`} />
          <div className="flex gap-2">
            <div className={`h-8 w-24 ${shimmer}`} />
            <div className={`h-8 w-24 ${shimmer}`} />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="flex space-x-4 items-center">
              <div className={`h-12 w-12 rounded-full ${shimmer}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-3/4 ${shimmer}`} />
                <div className={`h-3 w-1/2 ${shimmer}`} />
              </div>
              <div className={`h-6 w-20 ${shimmer}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-premium flex flex-col h-[320px] justify-between">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className={`h-5 w-32 ${shimmer}`} />
            <div className={`h-3.5 w-24 ${shimmer}`} />
          </div>
          <div className={`h-8 w-16 ${shimmer}`} />
        </div>
        <div className="flex items-end justify-between h-48 px-4">
          <div className={`w-8 h-24 ${shimmer}`} />
          <div className={`w-8 h-36 ${shimmer}`} />
          <div className={`w-8 h-16 ${shimmer}`} />
          <div className={`w-8 h-44 ${shimmer}`} />
          <div className={`w-8 h-32 ${shimmer}`} />
          <div className={`w-8 h-28 ${shimmer}`} />
        </div>
      </div>
    );
  }

  return <div className={`h-24 w-full ${shimmer}`} />;
};

export default SkeletonLoader;

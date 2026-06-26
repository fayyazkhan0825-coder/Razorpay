import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reimbursementService from '../../services/reimbursementService';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { FiUsers, FiMail, FiMapPin, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EmployeeDirectory = () => {
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        setLoading(true);
        const res = await reimbursementService.getEmployees();
        if (res.status === 'success' && res.data?.employees) {
          setEmployees(res.data.employees);
        }
      } catch (err) {
        toast.error('Failed to load team directory');
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const roleLabels = {
    EMP: 'Employee',
    RM: 'Reporting Manager',
    APE: 'Approval Executive',
    CFO: 'Chief Financial Officer'
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-6xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">
          {user?.role === 'RM' ? 'My Team Subordinates' : 'Organization Directory'}
        </h1>
        <p className="text-sm text-slate-450 dark:text-slate-400">
          {user?.role === 'RM' 
            ? 'Manage and monitor employees assigned directly to your reporting queue' 
            : 'Access user details and corporate permission profiles across the organization'
          }
        </p>
      </div>

      {loading ? (
        <SkeletonLoader type="table" count={4} />
      ) : employees.length === 0 ? (
        <EmptyState 
          title="Directory is empty" 
          description={user?.role === 'RM' 
            ? 'You do not have any subordinates assigned yet. Please contact the CFO to set up relationships.' 
            : 'No organizational user records found.'
          } 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div 
              key={emp.userId} 
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium transition-all hover:shadow-premium-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/5">
                    {emp.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/10 uppercase tracking-wide">
                    {roleLabels[emp.role] || emp.role}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{emp.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <FiMail className="mr-1.5 w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </p>
                <p className="text-[10px] text-slate-450 mt-1 flex items-center">
                  <FiMapPin className="mr-1.5 w-3.5 h-3.5 flex-shrink-0" />
                  <span>HQ Office, Bangalore</span>
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 mt-5 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400">UID: #{emp.userId}</span>
                <span className="flex items-center text-emerald-500 font-semibold">
                  <FiActivity className="mr-1 w-3.5 h-3.5" /> Active in HRIS
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;

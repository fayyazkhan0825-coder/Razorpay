import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reimbursementService from '../../services/reimbursementService';
import { parseDescription } from '../../utils/reimbursementParser';
import StatusBadge from '../../components/common/StatusBadge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiPlusCircle, 
  FiFileText,
  FiTrendingUp,
  FiUserCheck,
  FiUserPlus,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [reimbursements, setReimbursements] = useState([]);
  const [employeesList, setEmployeesList] = useState([]); // Directory for CFO/Manager
  const [loading, setLoading] = useState(true);
  
  // CFO Tab state
  const [cfoTab, setCfoTab] = useState('analytics'); // 'analytics' or 'admin'
  
  // CFO Admin Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignedRole, setAssignedRole] = useState('RM');
  const [linkEmployeeId, setLinkEmployeeId] = useState('');
  const [linkRmId, setLinkRmId] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await reimbursementService.list();
      if (res.status === 'success' && res.data?.reimbursements) {
        setReimbursements(res.data.reimbursements);
      }

      // If user is CFO or RM/APE, fetch directory
      if (['CFO', 'RM', 'APE'].includes(user?.role)) {
        const empRes = await reimbursementService.getEmployees();
        if (empRes.status === 'success' && empRes.data?.employees) {
          setEmployeesList(empRes.data.employees);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // CFO Action: Assign user role
  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    try {
      setAdminLoading(true);
      await reimbursementService.assignRole(Number(selectedUserId), assignedRole);
      toast.success('User role assigned successfully!');
      setSelectedUserId('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role assignment failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  // CFO Action: Map Employee to RM
  const handleAssignRM = async (e) => {
    e.preventDefault();
    if (!linkEmployeeId || !linkRmId) {
      toast.error('Please select both Employee and Manager');
      return;
    }
    if (linkEmployeeId === linkRmId) {
      toast.error('An employee cannot report to themselves.');
      return;
    }
    try {
      setAdminLoading(true);
      await reimbursementService.assignRM(Number(linkEmployeeId), Number(linkRmId));
      toast.success('Manager assigned successfully!');
      setLinkEmployeeId('');
      setLinkRmId('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Manager mapping failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Calculate Employee Metrics
  const getEmployeeMetrics = () => {
    let totalClaimed = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let approvedSum = 0;

    reimbursements.forEach((item) => {
      const amt = Number(item.amount);
      totalClaimed += amt;
      if (item.status === 'PENDING') pendingCount++;
      else if (item.status === 'APPROVED') {
        approvedCount++;
        approvedSum += amt;
      }
      else if (item.status === 'REJECTED') rejectedCount++;
    });

    return { totalClaimed, pendingCount, approvedCount, rejectedCount, approvedSum };
  };

  // Calculate CFO Financial Analytics
  const getCfoAnalytics = () => {
    let totalApprovedSum = 0;
    let categoryMap = {};
    let pendingVerificationSum = 0;

    reimbursements.forEach(item => {
      const amt = Number(item.amount);
      if (item.status === 'APPROVED') {
        totalApprovedSum += amt;
        const parsed = parseDescription(item.description);
        categoryMap[parsed.category] = (categoryMap[parsed.category] || 0) + amt;
      } else if (item.status === 'PENDING') {
        pendingVerificationSum += amt;
      }
    });

    return { totalApprovedSum, categoryMap, pendingVerificationSum };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="chart" />
      </div>
    );
  }

  // ====================
  // EMPLOYEE VIEW (EMP)
  // ====================
  if (user?.role === 'EMP') {
    const metrics = getEmployeeMetrics();
    const recentClaims = reimbursements.slice(0, 5);

    return (
      <div className="p-6 space-y-6 fade-in">
        
        {/* Title greeting */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">Welcome back, {user.name}!</h1>
            <p className="text-sm text-slate-450 dark:text-slate-400">Track claim pipelines and file new expense requests</p>
          </div>
          <Link
            to="/reimbursements/create"
            className="flex items-center px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark shadow-premium hover:shadow-premium-hover transition-all"
          >
            <FiPlusCircle className="mr-2 w-4 h-4" /> File New Claim
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
            <div className="flex justify-between items-center text-slate-400 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Total Claims Filed</span>
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><FiFileText className="w-5 h-5" /></div>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">₹{metrics.totalClaimed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <span className="text-xs text-slate-400">{reimbursements.length} submitted requests</span>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
            <div className="flex justify-between items-center text-slate-400 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Awaiting Approvals</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/20 rounded-lg text-amber-500"><FiClock className="w-5 h-5" /></div>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{metrics.pendingCount} Claims</h3>
            <span className="text-xs text-slate-400">Pending RM or APE reviews</span>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
            <div className="flex justify-between items-center text-slate-400 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Total Approved Sum</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/20 rounded-lg text-emerald-500"><FiCheckCircle className="w-5 h-5" /></div>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">₹{metrics.approvedSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            <span className="text-xs text-slate-400">{metrics.approvedCount} successfully settled</span>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
            <div className="flex justify-between items-center text-slate-400 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Rejected sum</span>
              <div className="p-2 bg-rose-100 dark:bg-rose-950/20 rounded-lg text-rose-500"><FiXCircle className="w-5 h-5" /></div>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{metrics.rejectedCount} Claims</h3>
            <span className="text-xs text-slate-400">Requires review and refiling</span>
          </div>
        </div>

        {/* Dashboard visual block & Recent List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Month progress */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Monthly Expenditure</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400">Spending compared against your monthly organizational cap (₹50,000)</p>
            </div>
            <div className="my-6">
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white mb-2">
                <span>₹{metrics.approvedSum.toLocaleString('en-IN')} / ₹50,000</span>
                <span>{Math.min(Math.round((metrics.approvedSum / 50000) * 100), 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metrics.approvedSum / 50000) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center">
              <FiTrendingUp className="mr-1 text-primary w-4 h-4" />
              <span>Limits refresh automatically on the 1st of next month</span>
            </div>
          </div>

          {/* Recent Claims Table */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Claim Statuses</h3>
              <Link to="/reimbursements" className="text-xs text-primary hover:underline font-semibold">View All Claims</Link>
            </div>

            {recentClaims.length === 0 ? (
              <EmptyState title="No claims found" description="You have not filed any reimbursement requests yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                      <th className="py-2">Title</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2 text-right">Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {recentClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-[150px] truncate">{claim.title}</td>
                        <td className="py-3 text-slate-450">{parseDescription(claim.description).date}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">₹{Number(claim.amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right"><StatusBadge status={claim.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  // ====================
  // MANAGER VIEW (RM / APE)
  // ====================
  if (user?.role === 'RM' || user?.role === 'APE') {
    const pendingClaims = reimbursements; // The API returns role-scoped lists automatically
    const roleLabel = user.role === 'RM' ? 'Reporting Manager' : 'Approval Executive';

    return (
      <div className="p-6 space-y-6 fade-in">
        
        {/* Title greeting */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-slate-905 dark:text-white tracking-tight m-0">{roleLabel} Panel</h1>
          <p className="text-sm text-slate-450 dark:text-slate-400">Review, audit, and approve/reject claims pending in your authorization queue</p>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Awaiting Decision</div>
            <h3 className="text-2xl font-extrabold text-primary">{pendingClaims.length} Claims</h3>
            <p className="text-xs text-slate-400 mt-1">Requires immediate evaluation</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium col-span-2 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Need to check historical decisions?</h4>
              <p className="text-xs text-slate-400 mt-1">Visit the claims tab to view processed or finalized team reimbursements.</p>
            </div>
            <Link 
              to="/reimbursements" 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-all"
            >
              View History Log
            </Link>
          </div>
        </div>

        {/* List of submissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Pending Approvals Queue</h3>
          
          {pendingClaims.length === 0 ? (
            <EmptyState 
              title="All caught up!" 
              description="Your pending queue is empty. There are no reimbursement claims awaiting your signature at this time." 
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                    <th className="py-3">ID</th>
                    <th className="py-3">Employee</th>
                    <th className="py-3">Claim Details</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {pendingClaims.map((claim) => {
                    const parsed = parseDescription(claim.description);
                    const empName = employeesList.find(e => e.userId === claim.employee_id)?.name || `Employee #${claim.employee_id}`;

                    return (
                      <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-4 font-semibold text-slate-400">#{claim.id}</td>
                        <td className="py-4 font-bold text-slate-900 dark:text-white">{empName}</td>
                        <td className="py-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">{claim.title}</span>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[200px]">{parsed.text}</span>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-500 dark:text-slate-400">
                            {parsed.category}
                          </span>
                        </td>
                        <td className="py-4 text-slate-550">{parsed.date}</td>
                        <td className="py-4 font-bold text-slate-900 dark:text-white">₹{Number(claim.amount).toLocaleString('en-IN')}</td>
                        <td className="py-4 text-right">
                          <Link 
                            to="/reimbursements"
                            className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            Review Claim
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    );
  }

  // ====================
  // CFO VIEW (CFO)
  // ====================
  if (user?.role === 'CFO') {
    const analytics = getCfoAnalytics();
    
    // Sort employees to list candidates for RM mapping
    const managers = employeesList.filter(e => e.role === 'RM');
    const allCandidates = employeesList;

    return (
      <div className="p-6 space-y-6 fade-in">
        
        {/* Title greeting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">CFO Audit Command Center</h1>
            <p className="text-sm text-slate-450 dark:text-slate-400">Monitor organizational expenditures, configure access hierarchies, and audit final settlements</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setCfoTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${cfoTab === 'analytics' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Finance Analytics
            </button>
            <button
              onClick={() => setCfoTab('admin')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${cfoTab === 'admin' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Employee Roles & RMs
            </button>
          </div>
        </div>

        {cfoTab === 'analytics' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Settled Expenses</div>
                <h3 className="text-2xl font-black text-emerald-500">₹{analytics.totalApprovedSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-400 mt-1">Successfully approved & audited claims</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Pending Verification</div>
                <h3 className="text-2xl font-black text-amber-500">₹{analytics.pendingVerificationSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-400 mt-1">Currently circulating in approvals pipeline</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Approved Claims</div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {reimbursements.filter(item => item.status === 'APPROVED').length} Claims
                  </h3>
                </div>
                <Link
                  to="/reimbursements"
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white"
                >
                  Audit Claims
                </Link>
              </div>
            </div>

            {/* Category breakdown visual charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category-wise Expenses */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium lg:col-span-1 flex flex-col justify-between h-[340px]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Expenses by Category</h3>
                
                {Object.keys(analytics.categoryMap).length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400">No approved expense data available.</div>
                ) : (
                  <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                    {Object.entries(analytics.categoryMap).map(([cat, val]) => {
                      const percentage = Math.round((val / (analytics.totalApprovedSum || 1)) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-750 dark:text-slate-300">{cat}</span>
                            <span className="font-bold text-slate-900 dark:text-white">₹{val.toLocaleString('en-IN')} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expense Flow bar Chart */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium lg:col-span-2 h-[340px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Settlements Flow (Pure CSS chart)</h3>
                  <p className="text-xs text-slate-400">Total approved expenditures visually mapped by category values</p>
                </div>
                
                {Object.keys(analytics.categoryMap).length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400">No approved claims to display chart.</div>
                ) : (
                  <div className="flex items-end justify-around h-44 px-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    {Object.entries(analytics.categoryMap).map(([cat, val]) => {
                      const maxVal = Math.max(...Object.values(analytics.categoryMap));
                      const percentageHeight = Math.max(Math.round((val / maxVal) * 100), 10);
                      return (
                        <div key={cat} className="flex flex-col items-center group relative w-16">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
                            ₹{val.toLocaleString('en-IN')}
                          </div>
                          <div 
                            className="w-8 bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary-dark cursor-pointer shadow-md"
                            style={{ height: `${percentageHeight * 1.3}px` }}
                          />
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 mt-2 rotate-12">{cat.substring(0,6)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          /* CFO Administration Tab: Assign Roles & Map Managers */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Roles assign Card */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                <FiUserCheck className="w-5 h-5 mr-2 text-primary" /> Assign User Role
              </h3>
              <p className="text-xs text-slate-400 mb-6">Promote or alter user roles to construct organizational hierarchy hierarchies</p>

              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Select User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose User --</option>
                    {allCandidates.map(c => (
                      <option key={c.userId} value={c.userId}>{c.name} ({c.email}) - Current: {c.role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Select New Role</label>
                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="EMP">Employee (EMP)</option>
                    <option value="RM">Reporting Manager (RM)</option>
                    <option value="APE">Approval Executive (APE)</option>
                    <option value="CFO">Chief Financial Officer (CFO)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center"
                >
                  Save Access Permission
                </button>
              </form>
            </div>

            {/* Subordinate assignments mapping card */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                <FiUserPlus className="w-5 h-5 mr-2 text-primary" /> Assign Manager (RM)
              </h3>
              <p className="text-xs text-slate-400 mb-6">Map employees directly to reporting managers. Since submitting claims requires an RM, this step is critical.</p>

              <form onSubmit={handleAssignRM} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Select Employee (EMP)</label>
                  <select
                    value={linkEmployeeId}
                    onChange={(e) => setLinkEmployeeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Employee --</option>
                    {allCandidates.filter(e => e.role === 'EMP').map(c => (
                      <option key={c.userId} value={c.userId}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Assign to Reporting Manager (RM)</label>
                  <select
                    value={linkRmId}
                    onChange={(e) => setLinkRmId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-855 rounded-xl text-xs text-slate-800 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Reporting Manager --</option>
                    {managers.map(c => (
                      <option key={c.userId} value={c.userId}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center"
                >
                  Map Relationship
                </button>
              </form>
            </div>

            {/* List directory of employees */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-premium lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Organizational Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                      <th className="py-2">User ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Corporate Email</th>
                      <th className="py-2">Role Assigned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allCandidates.map(c => (
                      <tr key={c.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 font-semibold text-slate-450">#{c.userId}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="py-3 text-slate-550">{c.email}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/10">
                            {c.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    );
  }

  return null;
};

export default Dashboard;

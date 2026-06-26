import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reimbursementService from '../../services/reimbursementService';
import { parseDescription } from '../../utils/reimbursementParser';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiDownload, 
  FiCheck, 
  FiX, 
  FiFolder,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReimbursementList = () => {
  const { user } = useAuth();
  
  const [reimbursements, setReimbursements] = useState([]);
  const [employees, setEmployees] = useState({}); // To map employee_id -> name
  const [loading, setLoading] = useState(true);
  
  // Search, Sort, Filter, Page states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('id'); // 'id', 'amount', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected item modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Delete / Edit modal states
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await reimbursementService.list();
      if (res.status === 'success' && res.data?.reimbursements) {
        setReimbursements(res.data.reimbursements);
      }
    } catch (error) {
      toast.error('Failed to load reimbursements');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (user?.role === 'EMP') return;
    try {
      const res = await reimbursementService.getEmployees();
      if (res.status === 'success' && res.data?.employees) {
        const empMap = {};
        res.data.employees.forEach(emp => {
          empMap[emp.userId] = emp;
        });
        setEmployees(empMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchEmployees();
  }, [user]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await reimbursementService.delete(deleteId);
      toast.success('Claim deleted successfully');
      setReimbursements(reimbursements.filter(item => item.id !== deleteId));
      setSelectedItem(null);
      setDeleteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit Action
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editAmount || Number(editAmount) <= 0) {
      toast.error('Please enter valid fields');
      return;
    }

    try {
      setActionLoading(true);
      const serializedDescription = JSON.stringify({
        text: editDescription.trim(),
        category: editCategory,
        date: editDate,
        receiptUrl: selectedItem ? parseDescription(selectedItem.description).receiptUrl : null
      });

      const res = await reimbursementService.update(selectedItem.id, editTitle.trim(), serializedDescription, Number(editAmount));
      if (res.status === 'success' && res.data?.reimbursement) {
        toast.success('Claim updated successfully!');
        setReimbursements(reimbursements.map(item => item.id === selectedItem.id ? res.data.reimbursement : item));
        setSelectedItem(res.data.reimbursement);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Approval/Rejection Actions (RM, APE, CFO)
  const handleApprovalAction = async (status) => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      const res = await reimbursementService.updateStatus(selectedItem.id, status);
      if (res.status === 'success' && res.data?.reimbursement) {
        toast.success(`Claim ${status.toLowerCase()} successfully!`);
        // If approval was done by RM/APE, remove it from their pending list or update it
        setReimbursements(reimbursements.map(item => item.id === selectedItem.id ? res.data.reimbursement : item));
        setSelectedItem(res.data.reimbursement);
        setComments('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Report Download (CFO / Manager)
  const downloadCSVReport = () => {
    const headers = 'ID,Employee Name,Title,Amount,Category,Expense Date,Status,RM Approval,APE Approval\n';
    const rows = filteredClaims.map(claim => {
      const parsed = parseDescription(claim.description);
      const empName = employees[claim.employee_id]?.name || claim.employee_id || 'N/A';
      return `${claim.id},"${empName}","${claim.title}",${claim.amount},"${parsed.category}","${parsed.date}",${claim.status},${claim.rm_approval_status},${claim.ape_approval_status}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reimbursement_Report_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    toast.success('Report downloaded!');
  };

  // Filtering Logic
  const filteredClaims = reimbursements.filter(claim => {
    const parsed = parseDescription(claim.description);
    const empName = (employees[claim.employee_id]?.name || '').toLowerCase();
    
    const matchesSearch = 
      claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parsed.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empName.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || parsed.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting Logic
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let fieldA = a[sortBy];
    let fieldB = b[sortBy];

    // Handle string/number sorting
    if (sortBy === 'amount') {
      fieldA = Number(a.amount);
      fieldB = Number(b.amount);
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalItems = sortedClaims.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedClaims = sortedClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startEdit = (item) => {
    const parsed = parseDescription(item.description);
    setEditTitle(item.title);
    setEditAmount(item.amount);
    setEditCategory(parsed.category);
    setEditDate(parsed.date);
    setEditDescription(parsed.text);
    setIsEditing(true);
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-905 dark:text-white tracking-tight m-0">Claims Records</h1>
          <p className="text-sm text-slate-450 dark:text-slate-400">Search, filter, and review reimbursement claims submitted in the pipeline</p>
        </div>
        {user?.role === 'CFO' && reimbursements.length > 0 && (
          <button
            onClick={downloadCSVReport}
            className="flex items-center px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark shadow-sm transition-all"
          >
            <FiDownload className="mr-2 w-4 h-4" /> Download CSV Report
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FiSearch className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, employee name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <FiFilter className="w-4 h-4" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white appearance-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <FiFolder className="w-4 h-4" />
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white appearance-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {['Travel', 'Meals', 'Office Supplies', 'Software', 'Medical', 'Equipment', 'Others'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Grid Table Card */}
      {loading ? (
        <SkeletonLoader type="table" count={5} />
      ) : paginatedClaims.length === 0 ? (
        <EmptyState title="No claims found" description="No reimbursement claim matches the specified search and filters." />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-450 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />)}
                  </th>
                  {user?.role !== 'EMP' && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('title')}>
                    Claim Title {sortBy === 'title' && (sortOrder === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />)}
                  </th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Expense Date</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('amount')}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />)}
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedClaims.map((claim) => {
                  const parsed = parseDescription(claim.description);
                  const empName = employees[claim.employee_id]?.name || `ID: ${claim.employee_id}`;

                  return (
                    <tr 
                      key={claim.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                      onClick={() => { setSelectedItem(claim); setIsEditing(false); }}
                    >
                      <td className="px-6 py-4 font-semibold text-slate-400">#{claim.id}</td>
                      {user?.role !== 'EMP' && (
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{empName}</td>
                      )}
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{claim.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-500 dark:text-slate-400">
                          {parsed.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{parsed.date}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                        ₹{Number(claim.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => { setSelectedItem(claim); setIsEditing(false); }}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl transition-all"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          {user?.role === 'EMP' && claim.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => { setSelectedItem(claim); startEdit(claim); }}
                                className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all"
                                title="Edit claim"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(claim.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-550 hover:text-white dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-600 rounded-xl transition-all"
                                title="Delete claim"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
              <span className="text-xs text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      currentPage === idx + 1 
                        ? 'bg-primary text-white' 
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Side Panel/Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg h-full max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium flex flex-col justify-between overflow-y-auto fade-in">
            <div>
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Claim Details #{selectedItem.id}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {isEditing ? 'Modify Reimbursement Claim' : selectedItem.title}
                  </h3>
                </div>
                <button 
                  onClick={() => { setSelectedItem(null); setIsEditing(false); }} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* View / Edit Modes */}
              {isEditing ? (
                /* Edit claim form */
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Claim Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white"
                      >
                        {['Travel', 'Meals', 'Office Supplies', 'Software', 'Medical', 'Equipment', 'Others'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expense Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      rows="3"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white resize-none"
                    />
                  </div>
                  <div className="flex space-x-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                /* View claim details */
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">Expense Amount</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{Number(selectedItem.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">Current Pipeline Status</span>
                      <div className="mt-1"><StatusBadge status={selectedItem.status} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">Expense Category</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{parseDescription(selectedItem.description).category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">Expense Date</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{parseDescription(selectedItem.description).date}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 my-3" />

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider">Claim Description</span>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mt-1">
                      {parseDescription(selectedItem.description).text}
                    </p>
                  </div>

                  {/* Receipt Link if exists */}
                  {parseDescription(selectedItem.description).receiptUrl && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold tracking-wider mb-2">Claim Receipt</span>
                      <a 
                        href={parseDescription(selectedItem.description).receiptUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-primary"
                      >
                        <FiEye className="mr-2" /> View Invoice Attachment
                      </a>
                    </div>
                  )}

                  {/* Stage Approval Flags */}
                  <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0">Approval Workflow Tracking</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">1. Reporting Manager (RM) Status:</span>
                      <span className={`font-semibold ${
                        selectedItem.rm_approval_status === 'APPROVED' ? 'text-emerald-500' :
                        selectedItem.rm_approval_status === 'REJECTED' ? 'text-rose-500' : 'text-amber-500'
                      }`}>{selectedItem.rm_approval_status}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">2. Approval Executive (APE) Status:</span>
                      <span className={`font-semibold ${
                        selectedItem.ape_approval_status === 'APPROVED' ? 'text-emerald-500' :
                        selectedItem.ape_approval_status === 'REJECTED' ? 'text-rose-500' : 'text-amber-500'
                      }`}>{selectedItem.ape_approval_status}</span>
                    </div>
                  </div>

                  {/* Action Block for RM, APE, or CFO */}
                  {['RM', 'APE', 'CFO'].includes(user?.role) && selectedItem.status === 'PENDING' && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Add Manager Review Comments (Optional)
                        </label>
                        <textarea
                          rows="2"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Provide audit decision reason..."
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white resize-none"
                        />
                      </div>
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={() => handleApprovalAction('REJECTED')}
                          disabled={actionLoading}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-600 font-semibold rounded-xl text-xs transition-all flex items-center"
                        >
                          <FiX className="mr-1 w-4 h-4" /> Reject Expense
                        </button>
                        <button
                          onClick={() => handleApprovalAction('APPROVED')}
                          disabled={actionLoading}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition-all flex items-center shadow-sm"
                        >
                          <FiCheck className="mr-1 w-4 h-4" /> Approve Expense
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions for creator if claim is still pending */}
            {!isEditing && user?.role === 'EMP' && selectedItem.status === 'PENDING' && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex space-x-3 justify-end">
                <button
                  onClick={() => startEdit(selectedItem)}
                  className="flex items-center px-4 py-2 text-xs font-semibold border border-primary/20 rounded-xl text-primary hover:bg-primary/5 transition-all"
                >
                  <FiEdit2 className="mr-2" /> Modify Claim
                </button>
                <button
                  onClick={() => setDeleteId(selectedItem.id)}
                  className="flex items-center px-4 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-650 transition-all rounded-xl"
                >
                  <FiTrash2 className="mr-2" /> Delete Claim
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Reimbursement Claim"
        message="Are you sure you want to permanently delete this reimbursement request? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteLoading}
        type="danger"
      />

    </div>
  );
};

export default ReimbursementList;

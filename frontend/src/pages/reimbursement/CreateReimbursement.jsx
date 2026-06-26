import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reimbursementService from '../../services/reimbursementService';
import { FiDollarSign, FiPlusCircle, FiFile, FiFolder, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Medical', 'Equipment', 'Others'];

const CreateReimbursement = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Mock Receipt Upload
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptFile(file);
    setReceiptLoading(true);

    // Simulate upload delay and generate mock URL
    setTimeout(() => {
      setReceiptUrl('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=1000');
      setReceiptLoading(false);
      toast.success('Receipt uploaded successfully (mocked)');
    }, 1500);
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      // Serialize metadata inside description to fit the backend schema
      const payloadDescription = JSON.stringify({
        text: description.trim(),
        category,
        date,
        receiptUrl: receiptUrl || null
      });

      await reimbursementService.create(title.trim(), payloadDescription, Number(amount));
      toast.success('Reimbursement claim submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to submit reimbursement.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAmount('');
    setCategory('Travel');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setReceiptFile(null);
    setReceiptUrl('');
    setErrors({});
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">Create Reimbursement</h1>
        <p className="text-sm text-slate-450 dark:text-slate-400">File a new business expense claim with receipt verification</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-premium relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                Reimbursement Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Client Dinner at Taj Mahal, Uber Ride to Office, etc."
                disabled={loading}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                  errors.title ? 'border-rose-450 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.title}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiDollarSign className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                    errors.amount ? 'border-rose-450 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <FiFolder className="w-4 h-4" />
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiCalendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                    errors.date ? 'border-rose-450 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.date && <p className="text-xs text-rose-500 mt-1 pl-1 font-medium">{errors.date}</p>}
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                Upload Receipt
              </label>
              <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptChange}
                  disabled={loading || receiptLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pl-2">
                  <FiFile className="w-5 h-5 text-primary" />
                  <span>
                    {receiptLoading 
                      ? 'Uploading file...' 
                      : receiptFile 
                        ? receiptFile.name.substring(0, 18) + (receiptFile.name.length > 18 ? '...' : '') 
                        : 'Choose invoice image/pdf'
                    }
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 pl-1">Supports PNG, JPEG, PDF up to 2MB</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider mb-2">
                Claim Description
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the business purpose of this expense..."
                disabled={loading}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white resize-none"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              Reset Fields
            </button>
            <button
              type="submit"
              disabled={loading || receiptLoading}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-dark text-white shadow-premium transition-all flex items-center justify-center disabled:opacity-75"
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateReimbursement;

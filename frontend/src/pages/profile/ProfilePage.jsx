import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiMail, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile({ name: name.trim() });
    } catch (err) {
      // toast is already handled by AuthContext
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setPasswordLoading(true);
      await updateProfile({ password });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      // toast already handled by AuthContext
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleLabels = {
    EMP: 'Employee',
    RM: 'Reporting Manager',
    APE: 'Approval Executive',
    CFO: 'Chief Financial Officer'
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">My Profile</h1>
          <p className="text-sm text-slate-450 dark:text-slate-400">View and update your personal information and password settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mb-4 shadow-sm border border-primary/5">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/10">
            {roleLabels[user?.role] || user?.role}
          </span>

          <div className="w-full border-t border-slate-100 dark:border-slate-800 my-6" />

          <div className="w-full text-left space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Account ID</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-150">{user?.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Registered Email</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-150 truncate block">{user?.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Default Org Domain</span>
              <span className="text-sm font-medium text-slate-905 dark:text-slate-150">@org.com</span>
            </div>
          </div>
        </div>

        {/* Update Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Update Name Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
              <FiUser className="w-4 h-4 mr-2 text-primary" />
              Update Account Details
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FiUser className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={profileLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Corporate Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FiMail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">Email address cannot be changed. Contact admin for assistance.</p>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all flex items-center disabled:opacity-75"
              >
                {profileLoading ? 'Updating...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Update Password Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
              <FiLock className="w-4 h-4 mr-2 text-primary" />
              Update Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <FiLock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={passwordLoading}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                        errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <FiLock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                        errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all flex items-center disabled:opacity-75"
              >
                {passwordLoading ? 'Saving...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

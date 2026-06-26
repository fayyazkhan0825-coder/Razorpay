import React, { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiSun, FiMoon, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [monthlyDigest, setMonthlyDigest] = useState(false);

  // Apply Theme change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Preferences saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-4xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">Settings</h1>
        <p className="text-sm text-slate-450 dark:text-slate-400">Manage application themes, layouts, and notifications</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Theme Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
            {isDarkMode ? <FiMoon className="w-4 h-4 mr-2 text-primary" /> : <FiSun className="w-4 h-4 mr-2 text-primary" />}
            Theme Preferences
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</h4>
              <p className="text-xs text-slate-400">Toggle dark color system across the dashboard</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                isDarkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
            <FiBell className="w-4 h-4 mr-2 text-primary" />
            Notifications Setup
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Reimbursement Alerts</h4>
                <p className="text-xs text-slate-400">Receive notifications on claim submissions, approvals, or rejections</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4.5 h-4.5 text-primary border-slate-350 dark:border-slate-750 rounded focus:ring-primary/20"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Approval Executive Warnings</h4>
                <p className="text-xs text-slate-400">Receive prompt notifications when claims are pending at APE level</p>
              </div>
              <input
                type="checkbox"
                checked={approvalAlerts}
                onChange={(e) => setApprovalAlerts(e.target.checked)}
                className="w-4.5 h-4.5 text-primary border-slate-350 dark:border-slate-755 rounded focus:ring-primary/20"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Digest Analytics</h4>
                <p className="text-xs text-slate-400">Email digest summarizing claims and monthly finance reports</p>
              </div>
              <input
                type="checkbox"
                checked={monthlyDigest}
                onChange={(e) => setMonthlyDigest(e.target.checked)}
                className="w-4.5 h-4.5 text-primary border-slate-350 dark:border-slate-755 rounded focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-premium">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
            <FiShield className="w-4 h-4 mr-2 text-primary" />
            Security & Authentication
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
            Your credentials and authentication tokens are secured with industry-standard JWT. Cookies are transmitted over secure HTTPS layers with strict anti-cross-site-scripting (httpOnly) parameters set.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all shadow-md"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

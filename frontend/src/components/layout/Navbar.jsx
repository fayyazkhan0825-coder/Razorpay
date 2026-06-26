import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiBell, 
  FiSun, 
  FiMoon, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiChevronDown 
} from 'react-icons/fi';

const Navbar = ({ setIsSidebarOpen, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Apply Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Your reimbursement request was approved by RM', time: '2 hours ago', read: false },
    { id: 2, text: 'New reimbursement request awaiting your approval', time: '1 day ago', read: true },
    { id: 3, text: 'Monthly expense report is ready to download', time: '3 days ago', read: true }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      
      {/* Left side: Hamburger and Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Razorpay Portal</span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white m-0">Dashboard Overview</h2>
        </div>
      </div>

      {/* Right side: Tools and profile */}
      <div className="flex items-center space-x-4">
        
        {/* Dark Mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <FiSun className="w-4 h-4 text-amber-500" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon and dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium py-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="px-4 py-2 font-bold text-slate-900 dark:text-white border-b border-slate-150 dark:border-slate-850 flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-xs font-normal text-primary hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer flex flex-col ${!notif.read ? 'bg-primary/5' : ''}`}
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-xs">{notif.text}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center text-xs text-primary font-medium hover:underline cursor-pointer border-t border-slate-150 dark:border-slate-850">
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block pr-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0 truncate max-w-[100px]">{user?.name}</h4>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <FiChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium py-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="font-bold text-slate-900 dark:text-white truncate text-xs mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                className="flex items-center w-full px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <FiUser className="w-4 h-4 mr-2" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                className="flex items-center w-full px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <FiSettings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                onClick={() => { logout(); setShowProfileMenu(false); }}
                className="flex items-center w-full px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;

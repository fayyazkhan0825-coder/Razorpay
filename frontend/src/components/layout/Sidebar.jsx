import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiFileText, 
  FiPlusCircle, 
  FiUser, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, setIsCollapsed, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  
  const roleName = {
    EMP: 'Employee',
    RM: 'Reporting Manager',
    APE: 'Approval Executive',
    CFO: 'Chief Financial Officer'
  }[user?.role] || 'User';

  const menuItems = {
    EMP: [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
      { path: '/reimbursements', label: 'My Claims', icon: <FiFileText className="w-5 h-5" /> },
      { path: '/reimbursements/create', label: 'New Claim', icon: <FiPlusCircle className="w-5 h-5" /> },
    ],
    RM: [
      { path: '/dashboard', label: 'Approvals Queue', icon: <FiHome className="w-5 h-5" /> },
      { path: '/employees', label: 'My Team', icon: <FiUsers className="w-5 h-5" /> },
      { path: '/reimbursements', label: 'All Team Claims', icon: <FiFileText className="w-5 h-5" /> },
    ],
    APE: [
      { path: '/dashboard', label: 'Pending Queue', icon: <FiHome className="w-5 h-5" /> },
      { path: '/reimbursements', label: 'History Claims', icon: <FiFileText className="w-5 h-5" /> },
    ],
    CFO: [
      { path: '/dashboard', label: 'CFO Analytics', icon: <FiHome className="w-5 h-5" /> },
      { path: '/employees', label: 'User Directory', icon: <FiUsers className="w-5 h-5" /> },
      { path: '/reimbursements', label: 'Approved Claims', icon: <FiFileText className="w-5 h-5" /> },
    ]
  }[user?.role] || [];

  const commonItems = [
    { path: '/profile', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  const handleNavLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false); // Close mobile drawer
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex-shrink-0 w-9 h-9 bg-primary flex items-center justify-center rounded-xl shadow-md">
                <span className="text-white font-bold text-lg leading-none">R</span>
              </div>
              {!isCollapsed && (
                <span className="font-extrabold text-lg text-slate-950 dark:text-white tracking-wide font-sans">
                  Razorpay<span className="text-primary">.reim</span>
                </span>
              )}
            </div>
            {/* Collapse toggle button for Desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* User info card inside sidebar */}
          {!isCollapsed && user && (
            <div className="p-4 mx-3 my-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">{roleName}</p>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate mt-0.5">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          {isCollapsed && user && (
            <div className="flex justify-center my-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavLinkClick}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
              </NavLink>
            ))}

            <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

            {commonItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavLinkClick}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              handleNavLinkClick();
            }}
            className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

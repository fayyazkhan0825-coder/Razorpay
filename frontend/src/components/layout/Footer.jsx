import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center text-xs text-slate-400 dark:text-slate-500">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <span>&copy; {new Date().getFullYear()} Razorpay Reimbursement Portal. All rights reserved.</span>
        <div className="flex space-x-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Help & Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

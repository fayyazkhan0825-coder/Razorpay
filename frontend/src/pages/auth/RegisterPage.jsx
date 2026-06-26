import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const RegisterPage = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    } else if (!email.toLowerCase().endsWith('@org.com')) {
      newErrors.email = 'Corporate email must end with @org.com';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!validate()) return;

    try {
      setLoading(true);
      await register(name, email, password);
      // Automatically redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

      <div className="w-full max-w-md">
        
        {/* Logo/Brand info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl shadow-lg mb-3">
            <span className="text-white font-extrabold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-extrabold font-sans text-slate-900 dark:text-white mb-1 tracking-tight">
            Register Account
          </h1>
          <p className="text-sm text-slate-450 dark:text-slate-400">
            Sign up to start claiming business expenses
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-premium p-8 fade-in relative overflow-hidden">
          
          {registerError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs font-semibold text-rose-600 dark:text-rose-455 text-center">
              {registerError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-405">
                  <FiUser className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                    errors.name 
                      ? 'border-rose-400 focus:ring-rose-500/25 focus:border-rose-500' 
                      : 'border-slate-200 dark:border-slate-850'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Corporate Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-405">
                  <FiMail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@org.com"
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                    errors.email 
                      ? 'border-rose-400 focus:ring-rose-500/25 focus:border-rose-500' 
                      : 'border-slate-200 dark:border-slate-850'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-405">
                  <FiLock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                    errors.password 
                      ? 'border-rose-400 focus:ring-rose-500/25 focus:border-rose-500' 
                      : 'border-slate-200 dark:border-slate-850'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-405">
                  <FiLock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white ${
                    errors.confirmPassword 
                      ? 'border-rose-400 focus:ring-rose-500/25 focus:border-rose-500' 
                      : 'border-slate-200 dark:border-slate-850'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark hover:shadow-lg focus:ring-4 focus:ring-primary/25 transition-all flex items-center justify-center disabled:opacity-75 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterPage;

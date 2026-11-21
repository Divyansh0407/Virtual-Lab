import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  GraduationCap
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { loginWithCredentials, signup, users } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('student');
  const [signupId, setSignupId] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science & Engineering');

  // Error state
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setShowPassword(false);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginWithCredentials(loginEmail, loginPassword);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please verify your email or password.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg('Please fill in your full name, email, and password.');
      return;
    }

    signup({
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      role: signupRole,
      department: signupDept,
      studentId: signupId || (signupRole === 'student' ? `STU-2026-${Math.floor(1000 + Math.random() * 9000)}` : `FAC-2026-${Math.floor(100 + Math.random() * 900)}`)
    });

    onClose();
  };

  const fillCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#e3e6eb] shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-pop-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-[#6b7382] hover:text-[#15171c] hover:bg-[#f4f5f7] transition-all duration-200 hover:rotate-90 btn-tactile"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#15171c] text-white mx-auto shadow-sm animate-pulse-subtle">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2b59ff] ring-2 ring-white"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#15171c] tracking-tight">
            {mode === 'login' ? 'Academic Portal Sign In' : 'Create Academic Account'}
          </h2>
          <p className="text-xs text-[#6b7382]">
            {mode === 'login'
              ? 'Enter your university email or ID and password to access your dashboard'
              : 'Register for your course cohort with isolated container workspaces'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#f4f5f7] p-1 rounded-xl border border-[#e3e6eb] text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 btn-tactile ${
              mode === 'login' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all duration-200 btn-tactile ${
              mode === 'signup' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium animate-shake flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  University Email or Academic ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. divyansh.sharma@university.edu or STU-2026-8841"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#15171c]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#2b59ff] flex items-center gap-1 hover:underline"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter password (e.g. divyansh@123)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Sign In to VirtualLab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Registered Credentials Reference Toggle */}
            <div className="pt-2 border-t border-[#e3e6eb]">
              <button
                type="button"
                onClick={() => setShowCredentialsGuide(!showCredentialsGuide)}
                className="w-full flex items-center justify-between text-xs text-[#6b7382] hover:text-[#15171c] py-1 transition-colors"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-[#2b59ff]" />
                  <span>View Registered IDs & Passwords</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-[#2b59ff]">
                  {showCredentialsGuide ? 'Hide' : 'Show'}
                </span>
              </button>

              {showCredentialsGuide && (
                <div className="mt-2.5 space-y-2 p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs animate-in fade-in duration-150">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6b7382]">
                    Official Academic Credentials:
                  </p>

                  <div className="space-y-1.5">
                    {/* Student 1 */}
                    <div className="p-2 rounded-lg bg-white border border-[#e3e6eb] flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#15171c]">Divyansh Sharma</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">Student</span>
                        </div>
                        <p className="text-[11px] text-[#6b7382] font-mono truncate">divyansh.sharma@university.edu</p>
                        <p className="text-[10px] text-gray-500 font-mono">Password: <span className="text-[#15171c] font-semibold">divyansh@123</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillCredentials('divyansh.sharma@university.edu', 'divyansh@123')}
                        className="ml-2 px-2 py-1 rounded bg-[#f4f5f7] hover:bg-gray-200 text-[10px] font-bold text-[#15171c]"
                      >
                        Autofill
                      </button>
                    </div>

                    {/* Student 2 */}
                    <div className="p-2 rounded-lg bg-white border border-[#e3e6eb] flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#15171c]">Harshvardhan Gupta</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">Student</span>
                        </div>
                        <p className="text-[11px] text-[#6b7382] font-mono truncate">harshvardhan.gupta@university.edu</p>
                        <p className="text-[10px] text-gray-500 font-mono">Password: <span className="text-[#15171c] font-semibold">harsh@123</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillCredentials('harshvardhan.gupta@university.edu', 'harsh@123')}
                        className="ml-2 px-2 py-1 rounded bg-[#f4f5f7] hover:bg-gray-200 text-[10px] font-bold text-[#15171c]"
                      >
                        Autofill
                      </button>
                    </div>

                    {/* Faculty */}
                    <div className="p-2 rounded-lg bg-white border border-[#e3e6eb] flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#15171c]">Garvit Dohare</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">Faculty</span>
                        </div>
                        <p className="text-[11px] text-[#6b7382] font-mono truncate">garvit.dohare@university.edu</p>
                        <p className="text-[10px] text-gray-500 font-mono">Password: <span className="text-[#15171c] font-semibold">garvit@123</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillCredentials('garvit.dohare@university.edu', 'garvit@123')}
                        className="ml-2 px-2 py-1 rounded bg-[#f4f5f7] hover:bg-gray-200 text-[10px] font-bold text-[#15171c]"
                      >
                        Autofill
                      </button>
                    </div>

                    {/* Admin */}
                    <div className="p-2 rounded-lg bg-white border border-[#e3e6eb] flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#15171c]">Akshita</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase">Admin</span>
                        </div>
                        <p className="text-[11px] text-[#6b7382] font-mono truncate">akshita@admin.university.edu</p>
                        <p className="text-[10px] text-gray-500 font-mono">Password: <span className="text-[#15171c] font-semibold">akshita@123</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillCredentials('akshita@admin.university.edu', 'akshita@123')}
                        className="ml-2 px-2 py-1 rounded bg-[#f4f5f7] hover:bg-gray-200 text-[10px] font-bold text-[#15171c]"
                      >
                        Autofill
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SIGNUP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[#15171c] block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#15171c] block mb-1">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="e.g. rahul@university.edu"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  Academic Role
                </label>
                <select
                  value={signupRole}
                  onChange={e => setSignupRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] bg-white focus:outline-none focus:border-[#2b59ff]"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty / Instructor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  {signupRole === 'student' ? 'Student ID' : 'Faculty ID'}
                </label>
                <input
                  type="text"
                  value={signupId}
                  onChange={e => setSignupId(e.target.value)}
                  placeholder={signupRole === 'student' ? 'e.g. STU-2026-1042' : 'e.g. FAC-2026-201'}
                  className="w-full p-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#15171c] block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-[#2b59ff] flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Dedicated non-root container workspace allocation.</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Create Account & Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Footer switch */}
        <div className="text-center pt-2 border-t border-[#e3e6eb] text-xs text-[#6b7382]">
          {mode === 'login' ? (
            <p>
              Don't have an academic account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="font-bold text-[#15171c] hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="font-bold text-[#15171c] hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

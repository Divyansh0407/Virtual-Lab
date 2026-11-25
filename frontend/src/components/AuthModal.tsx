import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Building,
  KeyRound
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
  const { loginWithCredentials, signup, login } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [idNumber, setIdNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setShowPassword(false);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginWithCredentials(email, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }

    signup({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role: selectedRole,
      department: department.trim(),
      studentId: idNumber.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#e3e6eb] shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-pop-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6b7382] hover:text-[#15171c] hover:bg-[#f4f5f7] transition-all"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#15171c] text-white mx-auto shadow-md">
            <div className="w-3 h-3 rounded-full bg-[#2b59ff] ring-4 ring-white/20"></div>
          </div>
          <h2 className="text-2xl font-black text-[#15171c] tracking-tight">
            {mode === 'login' ? 'Sign In to VirtualLab' : 'Join VirtualLab Academic Cloud'}
          </h2>
          <p className="text-xs text-[#6b7382]">
            {mode === 'login'
              ? 'Select your role and enter your academic credentials to continue'
              : 'Create an account to access isolated containers and virtual classrooms'}
          </p>
        </div>

        {/* Mode Toggle: Login vs Sign Up */}
        <div className="flex bg-[#f4f5f7] p-1 rounded-2xl border border-[#e3e6eb] text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white text-[#15171c] shadow-sm'
                : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-white text-[#15171c] shadow-sm'
                : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role Bifurcation Cards: Student vs Teacher */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6b7382] block">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Student Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                selectedRole === 'student'
                  ? 'border-[#2b59ff] bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-[#e3e6eb] bg-white hover:bg-[#fcfdfe]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedRole === 'student' ? 'bg-[#2b59ff] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                {selectedRole === 'student' && (
                  <CheckCircle2 className="w-4 h-4 text-[#2b59ff]" />
                )}
              </div>
              <p className="text-xs font-bold text-[#15171c]">Student</p>
              <p className="text-[11px] text-[#6b7382] mt-0.5 leading-snug">
                Join classrooms, execute real Linux labs, submit assignments
              </p>
            </button>

            {/* Teacher Role */}
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                selectedRole === 'teacher'
                  ? 'border-[#2b59ff] bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-[#e3e6eb] bg-white hover:bg-[#fcfdfe]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedRole === 'teacher' ? 'bg-[#2b59ff] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                {selectedRole === 'teacher' && (
                  <CheckCircle2 className="w-4 h-4 text-[#2b59ff]" />
                )}
              </div>
              <p className="text-xs font-bold text-[#15171c]">Teacher / Faculty</p>
              <p className="text-[11px] text-[#6b7382] mt-0.5 leading-snug">
                Create classrooms, design lab practicals, grade submissions
              </p>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2 animate-shake">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#15171c] block mb-1">
                University Email or Academic ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={selectedRole === 'student' ? 'student@virtuallab.edu' : 'teacher@virtuallab.edu'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff] transition-all"
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
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 btn-tactile hover-lift"
            >
              <span>Sign In as {selectedRole === 'student' ? 'Student' : 'Teacher'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Instant Login & Autofill Pills */}
            <div className="pt-3 border-t border-[#e3e6eb] space-y-2.5">
              <p className="text-[11px] font-bold text-[#6b7382] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#2b59ff]" />
                <span>One-Click Demo Access:</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    login('student-1');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-all"
                >
                  <p className="text-[11px] font-bold text-[#15171c]">Divyansh (Student)</p>
                  <p className="text-[10px] text-[#2b59ff] font-mono truncate">student@virtuallab.edu</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    login('teacher-1');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-all"
                >
                  <p className="text-[11px] font-bold text-[#15171c]">Prof. Garvit (Teacher)</p>
                  <p className="text-[10px] text-[#2b59ff] font-mono truncate">teacher@virtuallab.edu</p>
                </button>
              </div>
              <p className="text-[10px] text-[#6b7382] font-mono text-center">
                Passwords: <span className="font-semibold">student@123</span> / <span className="font-semibold">teacher@123</span>
              </p>
            </div>
          </form>
        ) : (
          /* 2. SIGN UP FORM */
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[#15171c] block mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={selectedRole === 'student' ? 'e.g. Aditi Rao' : 'e.g. Dr. Rajesh Kumar'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#15171c] block mb-1">
                  {selectedRole === 'student' ? 'Student ID (Optional)' : 'Faculty Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  placeholder={selectedRole === 'student' ? 'STU-2026-XXXX' : 'FAC-XXXX'}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 btn-tactile hover-lift"
            >
              <span>Register as {selectedRole === 'student' ? 'Student' : 'Teacher'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

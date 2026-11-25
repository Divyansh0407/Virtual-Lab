import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Terminal,
  Shield,
  Cpu,
  Eye,
  EyeOff,
  Building,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../types';

export const AuthPortal: React.FC = () => {
  const { loginWithCredentials, signup, login, users } = useApp();

  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [idNumber, setIdNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginWithCredentials(email, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid email or password.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
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
      role: activeRole,
      department: department.trim(),
      studentId: idNumber.trim()
    });
  };

  const instantDemoLogin = (role: 'student' | 'teacher') => {
    if (role === 'student') {
      login('student-1');
    } else {
      login('teacher-1');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 animate-fade-in">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-[#e3e6eb] shadow-xl overflow-hidden">
        {/* Left Side: Brand & Visuals */}
        <div className="md:col-span-5 bg-[#15171c] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center p-2">
                <div className="w-4 h-4 bg-[#2b59ff] rotate-45 rounded-[2px] shadow-sm flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block">
                  VirtualLab
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
                  Academic Cloud Platform
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Real Linux Labs in Your Browser.
              </h1>
              <p className="text-xs text-gray-400 leading-relaxed">
                Zero local setup. Isolated Ubuntu 24.04 containers, interactive Bash terminals, and classroom management.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-gray-300">
                <div className="p-1 rounded-lg bg-white/10 text-blue-400 flex-shrink-0 mt-0.5">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <span>Hardened, non-root Linux containers running on AWS EC2</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-gray-300">
                <div className="p-1 rounded-lg bg-white/10 text-emerald-400 flex-shrink-0 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span>Teachers create classrooms; students join with code</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-gray-300">
                <div className="p-1 rounded-lg bg-white/10 text-purple-400 flex-shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span>Persistent DynamoDB command logging & evaluations</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-[11px] text-gray-500 font-mono relative z-10">
            VirtualLab v2.4 · Major Project Prototype
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-white">
          {/* Role Bifurcation Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6b7382]">
                Choose Portal
              </span>
              <button
                type="button"
                onClick={() => { setIsSignup(!isSignup); setErrorMsg(''); }}
                className="text-xs font-bold text-[#2b59ff] hover:underline"
              >
                {isSignup ? 'Already have an account? Sign In' : 'Create an Account'}
              </button>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-[#f4f5f7] border border-[#e3e6eb]">
              <button
                type="button"
                onClick={() => { setActiveRole('student'); setErrorMsg(''); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  activeRole === 'student'
                    ? 'bg-white text-[#15171c] shadow-sm'
                    : 'text-[#6b7382] hover:text-[#15171c]'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeRole === 'student' ? 'text-[#2b59ff]' : ''}`} />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('teacher'); setErrorMsg(''); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  activeRole === 'teacher'
                    ? 'bg-white text-[#15171c] shadow-sm'
                    : 'text-[#6b7382] hover:text-[#15171c]'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeRole === 'teacher' ? 'text-[#2b59ff]' : ''}`} />
                <span>Teacher Portal</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Demo Login Button */}
          {!isSignup && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2b59ff]" />
                  <span>Instant Demo Access</span>
                </span>
                <span className="text-[10px] uppercase font-bold bg-blue-100 text-[#2b59ff] px-2 py-0.5 rounded-full">
                  1-Click
                </span>
              </div>

              <button
                type="button"
                onClick={() => instantDemoLogin(activeRole)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 btn-tactile hover-lift"
              >
                <span>
                  Sign In as Demo {activeRole === 'student' ? 'Student (Divyansh)' : 'Teacher (Prof. Garvit)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#e3e6eb]"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider font-bold text-[#6b7382]">
              {isSignup ? 'Register New Account' : 'Or Sign In with Credentials'}
            </span>
            <div className="flex-grow border-t border-[#e3e6eb]"></div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Credentials Form */}
          {!isSignup ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#15171c] block mb-1">
                  Email or Academic ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={activeRole === 'student' ? 'student@virtuallab.edu' : 'teacher@virtuallab.edu'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#15171c]">
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
                    placeholder="Enter password (e.g. student@123)"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5 btn-tactile"
              >
                <span>Sign In to {activeRole === 'student' ? 'Student' : 'Teacher'} Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#15171c] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={activeRole === 'student' ? 'e.g. Rahul Verma' : 'e.g. Dr. Priya Nair'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#15171c] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#15171c] block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#15171c] block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 btn-tactile"
              >
                <span>Create {activeRole === 'student' ? 'Student' : 'Teacher'} Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

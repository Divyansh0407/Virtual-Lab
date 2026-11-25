import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Terminal,
  BookOpen,
  Award,
  Cpu,
  Plus,
  LogIn,
  LogOut,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  GraduationCap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    activeTab,
    setActiveTab,
    activeSession,
    isAuthenticated,
    logout,
    setAuthModalOpen,
    backendStatus,
    checkBackendHealth
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'faculty';

  const getNavLinks = () => {
    if (!isAuthenticated) return [];

    if (isTeacher) {
      return [
        { id: 'classrooms', label: 'Classrooms & Labs', icon: BookOpen },
        { id: 'authoring', label: 'Create Practical', icon: Plus },
        { id: 'grading', label: 'Submissions', icon: Award },
        { id: 'workspace', label: 'Container Workspace', icon: Terminal, badge: activeSession?.state === 'running' ? 'Active' : undefined }
      ];
    }

    return [
      { id: 'dashboard', label: 'Classrooms & Labs', icon: BookOpen },
      { id: 'workspace', label: 'Lab Workspace', icon: Terminal, badge: activeSession?.state === 'running' ? 'Active' : undefined },
      { id: 'grades', label: 'My Submissions', icon: Award }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center pointer-events-none transition-all duration-300">
      <div className="w-full max-w-7xl liquid-glass-navbar rounded-full px-4 sm:px-6 py-2.5 h-16 flex items-center justify-between pointer-events-auto transition-all duration-300">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer group pl-1"
          onClick={() => setActiveTab(isAuthenticated ? (isTeacher ? 'classrooms' : 'dashboard') : 'landing')}
        >
          <div className="w-8 h-8 rounded-xl liquid-logo-box flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105">
            <div className="w-3.5 h-3.5 bg-[#15171c] rotate-45 rounded-[2px] shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#2b59ff] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm tracking-tight text-[#15171c]">
              VirtualLab
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/95 text-[#15171c] shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] border border-white/80'
                    : 'text-[#6b7382] hover:text-[#15171c] hover:bg-white/40'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Live AWS Backend Status Pill */}
          <button
            onClick={checkBackendHealth}
            title={backendStatus.online ? 'AWS EC2 backend & Docker are online' : 'Click to retry backend connection'}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              backendStatus.online
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              backendStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}></span>
            <span className="font-medium">
              {backendStatus.online ? 'AWS EC2 Online' : 'AWS EC2 Offline'}
            </span>
            {backendStatus.checking && (
              <RefreshCw className="w-2.5 h-2.5 animate-spin ml-0.5 text-gray-400" />
            )}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAuthModalOpen('login')}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#4b5563] hover:text-[#15171c] hover:bg-white/50 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthModalOpen('signup')}
                className="liquid-cta-btn px-4 py-1.5 rounded-full text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white/70 border border-white/80 hover:bg-white transition-all text-left shadow-sm"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200"
                />
                <div className="hidden sm:block text-left">
                  <span className="text-[11px] font-bold text-[#15171c] leading-tight block">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[#2b59ff] leading-none block">
                    {isTeacher ? 'Teacher' : 'Student'}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-[#6b7382] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white/95 backdrop-blur-xl border border-[#e3e6eb] shadow-2xl p-3 z-50 animate-pop-in space-y-2">
                  <div className="px-2 py-1.5 border-b border-[#e3e6eb]">
                    <p className="text-xs font-bold text-[#15171c]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#6b7382] truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#2b59ff] border border-blue-200">
                      Role: {isTeacher ? 'Teacher' : 'Student'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#6b7382] px-2 pt-1">
                      Switch Demo Profile:
                    </p>
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 text-[#2b59ff] font-bold'
                            : 'hover:bg-[#f4f5f7] text-[#15171c]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#6b7382] ml-2">
                          {u.role === 'teacher' || u.role === 'faculty' ? 'Teacher' : 'Student'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#e3e6eb]">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

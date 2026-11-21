import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Terminal,
  Server,
  BookOpen,
  Award,
  Cpu,
  Layers,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Play,
  LogIn,
  UserPlus,
  LogOut,
  Lock,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    activeTab,
    setActiveTab,
    activeSession,
    resetToDefaultData,
    showGuidedTour,
    setShowGuidedTour,
    startLabSession,
    isAuthenticated,
    logout,
    setAuthModalOpen,
    login
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { id: 'landing', label: 'Product Overview', icon: BookOpen },
        { id: 'architecture', label: 'System Architecture', icon: Layers }
      ];
    }

    const common = [
      { id: 'architecture', label: 'Architecture', icon: Layers },
      { id: 'landing', label: 'Overview', icon: BookOpen }
    ];

    if (currentUser.role === 'student') {
      return [
        { id: 'dashboard', label: 'My Practicals', icon: Terminal },
        { id: 'workspace', label: 'Lab Workspace', icon: Cpu, badge: activeSession?.state === 'running' ? 'Active' : undefined },
        { id: 'grades', label: 'My Grades', icon: Award },
        ...common
      ];
    } else if (currentUser.role === 'faculty') {
      return [
        { id: 'grading', label: 'Grading Studio', icon: Award },
        { id: 'authoring', label: 'Lab Authoring', icon: BookOpen },
        { id: 'proctor', label: 'Container Proctor', icon: Server },
        { id: 'workspace', label: 'Student Preview', icon: Terminal },
        ...common
      ];
    } else {
      return [
        { id: 'admin', label: 'Cluster Admin', icon: Server },
        { id: 'proctor', label: 'Live Sessions', icon: Cpu },
        { id: 'grading', label: 'Grading Queue', icon: Award },
        ...common
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e3e6eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand matching Ondrel style */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#15171c] flex items-center justify-center p-1.5 shadow-sm transition-transform group-hover:scale-105">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2b59ff] ring-2 ring-white"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-[#15171c]">
                VirtualLab
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#f4f5f7] border border-[#e3e6eb] text-[#6b7382]">
                v2.4
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                    ? 'bg-[#f4f5f7] text-[#15171c] border border-[#e3e6eb] shadow-sm'
                    : 'text-[#6b7382] hover:text-[#15171c] hover:bg-[#f4f5f7]/60'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2.5">
            {/* UN-AUTHENTICATED CONTROLS */}
            {!isAuthenticated ? (
              <>
                {/* Log In Button */}
                <button
                  onClick={() => setAuthModalOpen('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c] text-xs font-semibold shadow-sm transition-all duration-200 btn-tactile hover:shadow flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>Log In</span>
                </button>

                {/* Sign Up Button */}
                <button
                  onClick={() => setAuthModalOpen('signup')}
                  className="group px-3.5 py-1.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-semibold shadow-sm transition-all duration-200 btn-tactile hover:shadow-md flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                  <ArrowRight className="w-3 h-3 hidden sm:inline transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </>
            ) : (
              /* AUTHENTICATED CONTROLS */
              <>
                {/* Guided Tour Pill */}
                <button
                  onClick={() => setShowGuidedTour(!showGuidedTour)}
                  className={`hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold items-center space-x-1.5 transition-all duration-200 btn-tactile ${showGuidedTour
                    ? 'bg-blue-50 text-[#2b59ff] border border-blue-200 shadow-sm animate-pulse-subtle'
                    : 'bg-white text-[#6b7382] border border-[#e3e6eb] hover:bg-[#f4f5f7]'
                    }`}
                  title="Toggle Proposal Guided Walkthrough"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2b59ff]" />
                  <span className="hidden lg:inline">Tour</span>
                </button>

                {/* Role Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-[#e3e6eb] hover:border-gray-400 transition-all duration-200 btn-tactile text-left shadow-sm hover:shadow"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-lg object-cover ring-1 ring-gray-200 transition-transform duration-200 hover:scale-105"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold text-[#15171c] leading-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-[#2b59ff]">
                        {currentUser.role}
                      </div>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-[#6b7382] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#e3e6eb] shadow-xl p-2 z-50 animate-pop-in">
                      <div className="px-3 py-2 border-b border-[#e3e6eb]">
                        <p className="text-xs font-bold text-[#15171c]">Active Account</p>
                        <p className="text-[11px] text-[#6b7382] truncate">{currentUser.email}</p>
                      </div>

                      <div className="py-1 space-y-1">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-[#6b7382]">
                          Switch Account
                        </div>
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-all ${currentUser.id === u.id
                              ? 'bg-blue-50/80 border border-blue-200 text-[#15171c]'
                              : 'hover:bg-[#f4f5f7] text-[#6b7382]'
                              }`}
                          >
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#15171c] truncate">{u.name}</p>
                              <p className="text-[10px] text-[#6b7382] truncate">{u.department}</p>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${u.role === 'student'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.role === 'faculty'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#e3e6eb] space-y-1">
                        <button
                          onClick={() => {
                            if (confirm('Reset demo state back to default seed data?')) {
                              resetToDefaultData();
                              setUserDropdownOpen(false);
                            }
                          }}
                          className="w-full text-left text-[11px] text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-[#f4f5f7]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                          <span>Reset Demo Seed Data</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                          <span>Sign Out / Return to Landing</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role-based Fast Action Button */}
                {currentUser.role === 'student' ? (
                  <button
                    onClick={() => startLabSession('lab-linux-perm')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Launch Lab</span>
                  </button>
                ) : currentUser.role === 'faculty' ? (
                  <button
                    onClick={() => setActiveTab('authoring')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>New Lab</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Server className="w-3 h-3" />
                    <span>Fleet Admin</span>
                  </button>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-white border border-[#e3e6eb] text-[#15171c]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e3e6eb] bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${isActive
                  ? 'bg-[#f4f5f7] text-[#15171c] border border-[#e3e6eb]'
                  : 'text-[#6b7382] hover:bg-[#f4f5f7]'
                  }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          {!isAuthenticated ? (
            <div className="pt-2 border-t border-[#e3e6eb] flex gap-2">
              <button
                onClick={() => {
                  setAuthModalOpen('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-white border border-[#e3e6eb] text-xs font-semibold text-[#15171c]"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setAuthModalOpen('signup');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#15171c] text-white text-xs font-semibold"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#e3e6eb]">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

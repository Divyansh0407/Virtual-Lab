import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { GuidedDemoTour } from './components/GuidedDemoTour';
import { StudentDashboard } from './components/StudentDashboard';
import { LabWorkspace } from './components/LabWorkspace';
import { StudentGradesView } from './components/StudentGradesView';
import { FacultyGradingQueue } from './components/FacultyGradingQueue';
import { FacultyLabAuthoring } from './components/FacultyLabAuthoring';
import { LiveSessionMonitor } from './components/LiveSessionMonitor';
import { AdminClusterDashboard } from './components/AdminClusterDashboard';
import { ArchitectureExplorer } from './components/ArchitectureExplorer';
import { LandingPage } from './components/LandingPage';
import { Lock, LogIn, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAuthenticated,
    authModalOpen,
    setAuthModalOpen,
    currentUser
  } = useApp();

  // If user is not authenticated and tries to access protected tab, fall back to landing page
  const isProtectedTab = activeTab !== 'landing' && activeTab !== 'architecture';
  const shouldRenderLanding = !isAuthenticated && isProtectedTab;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#15171c]">
      <Navbar />

      {/* Guided Tour only for authenticated exploration */}
      {isAuthenticated && <GuidedDemoTour />}

      {/* Auth Modal for Login & Signup */}
      <AuthModal
        isOpen={Boolean(authModalOpen)}
        onClose={() => setAuthModalOpen(null)}
        initialMode={authModalOpen || 'login'}
      />

      {/* Unauthenticated subtle top prompt when trying to access gated features */}
      {!isAuthenticated && isProtectedTab && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Authentication required: Please log in or create an academic account to access this feature.</span>
            </div>
            <button
              onClick={() => setAuthModalOpen('login')}
              className="font-bold underline text-amber-950 hover:text-black ml-4"
            >
              Sign In Now
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If unauthenticated and on a protected tab, render LandingPage with prompt */}
        {shouldRenderLanding ? (
          <LandingPage />
        ) : (
          <>
            {activeTab === 'landing' && <LandingPage />}
            {activeTab === 'dashboard' && <StudentDashboard />}
            {activeTab === 'workspace' && <LabWorkspace />}
            {activeTab === 'grades' && <StudentGradesView />}
            {activeTab === 'grading' && <FacultyGradingQueue />}
            {activeTab === 'authoring' && <FacultyLabAuthoring />}
            {activeTab === 'proctor' && <LiveSessionMonitor />}
            {activeTab === 'admin' && <AdminClusterDashboard />}
            {activeTab === 'architecture' && <ArchitectureExplorer />}
          </>
        )}
      </main>

      <footer className="border-t border-[#e3e6eb] bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#6b7382]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-md bg-[#15171c] flex items-center justify-center p-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2b59ff]"></div>
            </div>
            <span className="font-bold text-[#15171c]">VirtualLab</span>
            <span>—</span>
            <span>A Cloud-Based Interactive Laboratory Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold">
            <button onClick={() => setActiveTab('landing')} className="hover:text-[#15171c]">
              Product Overview
            </button>
            <button onClick={() => setActiveTab('architecture')} className="hover:text-[#15171c]">
              System Architecture
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-[#6b7382] font-mono">React • Vite • Tailwind • TypeScript</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-[#e3e6eb] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6b7382]">
          <p>© 2026 VirtualLab Platform. Prepared for Major Project Blueprint & Faculty Demonstration.</p>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Connected as {currentUser.name}
              </span>
            ) : (
              <button
                onClick={() => setAuthModalOpen('login')}
                className="text-[#2b59ff] hover:underline flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" /> Academic Portal Login
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

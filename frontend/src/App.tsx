import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherClassroomView } from './components/TeacherClassroomView';
import { FacultyLabAuthoring } from './components/FacultyLabAuthoring';
import { FacultyGradingQueue } from './components/FacultyGradingQueue';
import { LabWorkspace } from './components/LabWorkspace';
import { StudentGradesView } from './components/StudentGradesView';
import { Lock, LogIn } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAuthenticated,
    authModalOpen,
    setAuthModalOpen,
    currentUser
  } = useApp();

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'faculty';

  // If user is unauthenticated or on the 'landing' tab, render the LandingPage
  const isProtectedTab = activeTab !== 'landing';
  const shouldRenderLanding = !isAuthenticated || activeTab === 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#15171c]">
      <Navbar />

      {/* Auth Modal with Student/Teacher Bifurcation & 1-Click Demo Login */}
      <AuthModal
        isOpen={Boolean(authModalOpen)}
        onClose={() => setAuthModalOpen(null)}
        initialMode={authModalOpen || 'login'}
      />

      {/* Unauthenticated top prompt when attempting to view protected tab */}
      {!isAuthenticated && isProtectedTab && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Authentication required: Please sign in as a Student or Teacher to access practicals.</span>
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

      {/* Main Workspace Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {shouldRenderLanding ? (
          <LandingPage />
        ) : isTeacher ? (
          /* TEACHER VIEWS */
          <>
            {activeTab === 'classrooms' && <TeacherClassroomView />}
            {activeTab === 'authoring' && <FacultyLabAuthoring />}
            {activeTab === 'grading' && <FacultyGradingQueue />}
            {activeTab === 'workspace' && <LabWorkspace />}
            {!['classrooms', 'authoring', 'grading', 'workspace'].includes(activeTab) && (
              <TeacherClassroomView />
            )}
          </>
        ) : (
          /* STUDENT VIEWS */
          <>
            {activeTab === 'dashboard' && <StudentDashboard />}
            {activeTab === 'workspace' && <LabWorkspace />}
            {activeTab === 'grades' && <StudentGradesView />}
            {!['dashboard', 'workspace', 'grades'].includes(activeTab) && (
              <StudentDashboard />
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#e3e6eb] bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#6b7382]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-md bg-[#15171c] flex items-center justify-center p-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2b59ff]"></div>
            </div>
            <span className="font-bold text-[#15171c]">VirtualLab</span>
            <span>—</span>
            <span>Cloud-Based Interactive Linux Laboratory</span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:text-[#15171c] transition-colors"
            >
              Product Overview
            </button>
            <span className="text-gray-300">|</span>
            {isAuthenticated ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Logged in as {currentUser.name} ({isTeacher ? 'Teacher' : 'Student'})
              </span>
            ) : (
              <button
                onClick={() => setAuthModalOpen('login')}
                className="text-[#2b59ff] hover:underline flex items-center gap-1 font-bold"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In to Portal
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

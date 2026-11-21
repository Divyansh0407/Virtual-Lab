import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Terminal,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Cpu,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    labs,
    courses,
    submissions,
    activeSession,
    startLabSession,
    setActiveLabId,
    setActiveTab
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);

  const getLabStatus = (labId: string) => {
    const sub = studentSubmissions.find(s => s.labId === labId);
    if (sub) {
      if (sub.grade?.status === 'published') {
        return { label: 'Graded', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', score: `${sub.grade.finalScore}/${sub.grade.maxScore}` };
      }
      return { label: 'Submitted', color: 'bg-blue-50 text-blue-700 border-blue-200', score: 'Under Review' };
    }
    if (activeSession && activeSession.labId === labId && activeSession.state === 'running') {
      return { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', score: null };
    }
    return { label: 'Not Started', color: 'bg-gray-100 text-[#6b7382] border-gray-200', score: null };
  };

  const filteredLabs = labs.filter(lab => {
    const status = getLabStatus(lab.id);
    if (filter === 'pending') return status.label !== 'Graded' && status.label !== 'Submitted';
    if (filter === 'completed') return status.label === 'Graded' || status.label === 'Submitted';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Welcome Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 framer-card">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-md transition-transform duration-200 hover:scale-105"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-[#15171c] tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b59ff] font-mono font-bold animate-pulse-subtle">
                {currentUser.studentId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6b7382] mt-1">
              {currentUser.department} • Fall 2026 Practical Cohort
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-4 bg-[#f4f5f7] p-4 rounded-xl border border-[#e3e6eb]">
          <div className="text-center hover-lift p-1 rounded-lg">
            <p className="text-xs text-[#6b7382]">Assigned</p>
            <p className="text-xl font-black text-[#15171c] mt-0.5">{labs.length}</p>
          </div>
          <div className="text-center border-x border-[#e3e6eb] px-3 hover-lift p-1 rounded-lg">
            <p className="text-xs text-[#6b7382]">Submitted</p>
            <p className="text-xl font-black text-[#2b59ff] mt-0.5">{studentSubmissions.length}</p>
          </div>
          <div className="text-center hover-lift p-1 rounded-lg">
            <p className="text-xs text-[#6b7382]">Average</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              {studentSubmissions.length > 0 ? '100%' : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Running Session Alert Card */}
      {activeSession && activeSession.state === 'running' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pop-in glow-on-hover">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center flex-shrink-0 text-[#2b59ff] shadow-sm animate-pulse-subtle">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow"></span>
                  Active Container Session
                </span>
                <span className="text-[#6b7382]">•</span>
                <span className="text-xs font-mono text-[#15171c] font-semibold">
                  {activeSession.containerRef}
                </span>
              </div>
              <p className="text-sm font-bold text-[#15171c] mt-0.5">
                {labs.find(l => l.id === activeSession.labId)?.title || 'Assigned Lab'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveLabId(activeSession.labId);
              setActiveTab('workspace');
            }}
            className="group px-4 py-2 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all duration-200 btn-tactile hover-lift"
          >
            <span>Resume Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Lab Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#2b59ff]" />
            <h2 className="text-lg font-bold text-[#15171c]">Assigned Laboratory Practicals</h2>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-[#e3e6eb] text-xs font-semibold shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
                }`}
            >
              All Practicals ({labs.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'pending' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
                }`}
            >
              Pending / In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
                }`}
            >
              Submitted & Graded ({studentSubmissions.length})
            </button>
          </div>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLabs.map(lab => {
            const status = getLabStatus(lab.id);
            const isTargetLinuxPerm = lab.id === 'lab-linux-perm';

            return (
              <div
                key={lab.id}
                className={`bg-white rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 framer-card hover-lift ${isTargetLinuxPerm ? 'border-blue-300 ring-1 ring-blue-200' : 'border-[#e3e6eb]'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#2b59ff] border border-blue-200">
                      {lab.courseCode}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#15171c] leading-snug line-clamp-2">
                    {lab.title}
                  </h3>

                  <p className="text-xs text-[#6b7382] mt-2 line-clamp-3 leading-relaxed">
                    {lab.shortDescription}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#e3e6eb] grid grid-cols-2 gap-2 text-[11px] text-[#6b7382] font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Due: Nov 28</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lab.totalPoints} Points</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#e3e6eb] flex items-center justify-between">
                  {status.score ? (
                    <div className="text-xs font-semibold text-emerald-700">
                      Grade: <span className="font-mono text-sm font-bold">{status.score}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#6b7382]">
                      Attempts: 0/{lab.maxAttempts}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveLabId(lab.id);
                      if (!activeSession || activeSession.labId !== lab.id) {
                        startLabSession(lab.id);
                      } else {
                        setActiveTab('workspace');
                      }
                    }}
                    className="group px-3.5 py-1.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all duration-200 btn-tactile hover-lift"
                  >
                    <span>{status.label === 'In Progress' ? 'Resume Lab' : 'Launch Lab'}</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Enrollments Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm">
        <h2 className="text-base font-bold text-[#15171c] mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#2b59ff]" />
          <span>Active Course Enrollments (Fall 2026)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] hover:border-gray-400 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-[#2b59ff]">{course.code}</span>
                <span className="text-[10px] text-[#6b7382] font-semibold">{course.term}</span>
              </div>
              <h4 className="text-sm font-bold text-[#15171c] truncate">{course.title}</h4>
              <p className="text-xs text-[#6b7382] mt-1">Instructor: {course.instructorName}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#6b7382]">
                <span>{course.studentCount} enrolled peers</span>
                <span className="text-emerald-600 font-bold">Enrolled</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

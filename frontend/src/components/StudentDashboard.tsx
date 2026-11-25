import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Terminal,
  BookOpen,
  Plus,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Users,
  Copy,
  Check,
  Search,
  Layers,
  Sparkles
} from 'lucide-react';
import { Classroom, Lab } from '../types';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    classrooms,
    joinClassroom,
    labs,
    submissions,
    activeSession,
    startLabSession,
    setActiveLabId,
    setActiveTab
  } = useApp();

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ text: string; success: boolean } | null>(null);

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Enrolled classrooms for this student
  const enrolledClassrooms = classrooms.filter(
    c => c.studentIds.includes(currentUser.id)
  );

  // Labs in enrolled classrooms
  const enrolledClassroomIds = enrolledClassrooms.map(c => c.id);
  const availableLabs = labs.filter(l =>
    enrolledClassroomIds.includes(l.classroomId) &&
    (selectedClassroomId === 'all' || l.classroomId === selectedClassroomId)
  );

  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);

  const getLabStatus = (labId: string) => {
    const sub = studentSubmissions.find(s => s.labId === labId);
    if (sub) {
      if (sub.status === 'graded' && sub.grade) {
        return {
          label: `Graded (${sub.grade.score}/${sub.grade.maxScore})`,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          completed: true
        };
      }
      return {
        label: 'Submitted (Under Review)',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        completed: true
      };
    }
    if (activeSession && activeSession.labId === labId && activeSession.state === 'running') {
      return {
        label: 'In Progress (Active Container)',
        color: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
        completed: false
      };
    }
    return {
      label: 'Not Started',
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      completed: false
    };
  };

  const filteredLabs = availableLabs.filter(lab => {
    const status = getLabStatus(lab.id);
    if (filter === 'pending') return !status.completed;
    if (filter === 'completed') return status.completed;
    return true;
  });

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const res = joinClassroom(joinCode.trim());
    setJoinMsg({ text: res.message, success: res.success });

    if (res.success) {
      setTimeout(() => {
        setJoinModalOpen(false);
        setJoinCode('');
        setJoinMsg(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-[#15171c] tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2b59ff] font-mono font-bold">
                {currentUser.studentId || 'Student'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6b7382] mt-1">
              {currentUser.department} • Enrolled in {enrolledClassrooms.length} Classrooms
            </p>
          </div>
        </div>

        <button
          onClick={() => { setJoinModalOpen(true); setJoinMsg(null); }}
          className="px-5 py-2.5 rounded-2xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover-lift transition-all btn-tactile"
        >
          <Plus className="w-4 h-4" />
          <span>Join a Classroom</span>
        </button>
      </div>

      {/* Active Running Container Session Alert */}
      {activeSession && activeSession.state === 'running' && (
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pop-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center flex-shrink-0 text-[#2b59ff] shadow-sm">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Live AWS Container Attached
                </span>
                <span className="text-[#6b7382]">•</span>
                <span className="text-xs font-mono text-[#15171c] font-bold">
                  {activeSession.containerRef}
                </span>
              </div>
              <p className="text-sm font-bold text-[#15171c] mt-0.5">
                {labs.find(l => l.id === activeSession.labId)?.title || 'Assigned Practical'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveLabId(activeSession.labId);
              setActiveTab('workspace');
            }}
            className="px-5 py-2 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all btn-tactile hover-lift"
          >
            <span>Resume Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Enrolled Classrooms Carousel / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#15171c] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2b59ff]" />
            <span>My Classrooms ({enrolledClassrooms.length})</span>
          </h2>
        </div>

        {enrolledClassrooms.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#e3e6eb] bg-white">
            <BookOpen className="w-8 h-8 text-[#6b7382] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#15171c]">You haven't joined any classrooms yet</p>
            <p className="text-xs text-[#6b7382] mt-1 max-w-sm mx-auto">
              Ask your instructor for their classroom join code (e.g. <code>OS-303</code>) and enter it below.
            </p>
            <button
              onClick={() => { setJoinModalOpen(true); setJoinMsg(null); }}
              className="mt-3 px-4 py-2 rounded-xl bg-[#2b59ff] text-white text-xs font-bold shadow-sm"
            >
              Enter Classroom Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledClassrooms.map(c => {
              const isSelected = selectedClassroomId === c.id;
              const classroomLabCount = labs.filter(l => l.classroomId === c.id).length;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClassroomId(isSelected ? 'all' : c.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#2b59ff] ring-2 ring-blue-500/10 shadow-md'
                      : 'border-[#e3e6eb] hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2b59ff] border border-blue-200">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-[#6b7382] font-medium">{c.section}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#15171c] line-clamp-1">{c.name}</h3>
                  <p className="text-xs text-[#6b7382] mt-0.5">Instructor: {c.teacherName}</p>

                  <div className="mt-4 pt-3 border-t border-[#f4f5f7] flex items-center justify-between text-xs text-[#6b7382]">
                    <span>{classroomLabCount} Practicals</span>
                    <span className="text-[#2b59ff] font-semibold text-[11px]">
                      {isSelected ? 'Viewing Labs' : 'Filter by Class'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assigned Labs List */}
      <div className="bg-white rounded-3xl border border-[#e3e6eb] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e3e6eb]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-[#2b59ff]" />
            <h2 className="text-lg font-black text-[#15171c]">
              Assigned Lab Practicals
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#f4f5f7] p-1 rounded-xl border border-[#e3e6eb] text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'all' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382]'
                }`}
              >
                All ({availableLabs.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'pending' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382]'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'completed' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {filteredLabs.length === 0 ? (
          <div className="p-10 text-center text-[#6b7382] text-xs">
            No lab practicals found for the selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLabs.map(lab => {
              const status = getLabStatus(lab.id);
              const classroom = classrooms.find(c => c.id === lab.classroomId);

              return (
                <div
                  key={lab.id}
                  className="p-5 rounded-2xl border border-[#e3e6eb] bg-[#fcfdfe] hover:bg-white hover:border-gray-300 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {classroom?.code || lab.classroomCode || 'CLASS'}
                      </span>
                      <h3 className="text-sm font-bold text-[#15171c]">
                        {lab.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <p className="text-xs text-[#6b7382] line-clamp-2">
                      {lab.shortDescription}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-[#6b7382]">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>{lab.totalPoints} Marks</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Due: {new Date(lab.dueAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setActiveLabId(lab.id);
                        startLabSession(lab.id);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs flex items-center space-x-1.5 shadow-md btn-tactile hover-lift"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>{status.completed ? 'Re-open Lab' : 'Launch Lab'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JOIN CLASSROOM MODAL */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-[#e3e6eb] shadow-2xl p-6 sm:p-8 space-y-5 animate-pop-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#15171c] text-white mx-auto shadow-md">
                <BookOpen className="w-6 h-6 text-[#2b59ff]" />
              </div>
              <h2 className="text-2xl font-black text-[#15171c]">Join a Classroom</h2>
              <p className="text-xs text-[#6b7382]">
                Enter the classroom code provided by your teacher
              </p>
            </div>

            {joinMsg && (
              <div className={`p-3 rounded-xl border text-xs font-semibold ${
                joinMsg.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {joinMsg.text}
              </div>
            )}

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#15171c] block mb-1">
                  Classroom Code
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. OS-303 or DSA-201"
                  className="w-full px-4 py-3 rounded-xl border border-[#e3e6eb] text-sm font-mono font-bold text-[#15171c] focus:outline-none focus:border-[#2b59ff] uppercase tracking-wider text-center"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#e3e6eb] text-[11px] text-[#6b7382]">
                <p className="font-bold text-[#15171c] mb-1">Available demo codes:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinCode('OS-303')}
                    className="px-2 py-0.5 rounded bg-white border border-[#e3e6eb] text-[10px] font-mono font-bold text-[#2b59ff]"
                  >
                    OS-303
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinCode('DSA-201')}
                    className="px-2 py-0.5 rounded bg-white border border-[#e3e6eb] text-[10px] font-mono font-bold text-[#2b59ff]"
                  >
                    DSA-201
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinCode('CLOUD-401')}
                    className="px-2 py-0.5 rounded bg-white border border-[#e3e6eb] text-[10px] font-mono font-bold text-[#2b59ff]"
                  >
                    CLOUD-401
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e3e6eb] text-xs font-semibold text-[#6b7382]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white text-xs font-bold shadow-md btn-tactile hover-lift"
                >
                  Join Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

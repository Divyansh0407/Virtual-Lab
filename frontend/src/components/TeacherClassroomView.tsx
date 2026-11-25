import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Users,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  Terminal,
  Award,
  Sparkles,
  ExternalLink,
  Trash2,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Classroom, Lab } from '../types';

export const TeacherClassroomView: React.FC = () => {
  const {
    currentUser,
    classrooms,
    createClassroom,
    labs,
    deleteLab,
    submissions,
    setActiveLabId,
    setActiveTab,
    startLabSession
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New classroom form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected classroom to inspect
  const teacherClassrooms = classrooms.filter(
    c => c.teacherId === currentUser.id || currentUser.role === 'admin'
  );

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    teacherClassrooms[0]?.id || classrooms[0]?.id || ''
  );

  const activeClassroom = classrooms.find(c => c.id === selectedClassroomId) || teacherClassrooms[0] || classrooms[0];

  const classroomLabs = labs.filter(l => l.classroomId === activeClassroom?.id);
  const classroomSubmissions = submissions.filter(s => s.classroomId === activeClassroom?.id);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = createClassroom({
      name,
      code,
      section,
      description
    });

    if (res.success && res.classroom) {
      setSelectedClassroomId(res.classroom.id);
      setName('');
      setCode('');
      setSection('');
      setDescription('');
      setCreateModalOpen(false);
    } else {
      setErrorMsg(res.message);
    }
  };

  const copyJoinCode = (classCode: string) => {
    navigator.clipboard.writeText(classCode);
    setCopiedCode(classCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const generateRandomCode = () => {
    const prefixes = ['CS', 'OS', 'SYS', 'NET', 'DEV'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setCode(`${p}-${num}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#15171c] text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-[#2b59ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#15171c] tracking-tight">
                Teacher Classroom Hub
              </h1>
              <p className="text-xs text-[#6b7382]">
                Create and manage practical classrooms, publish container labs, and monitor student execution
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setCreateModalOpen(true);
            generateRandomCode();
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover-lift transition-all btn-tactile"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Classroom</span>
        </button>
      </div>

      {/* Classroom Selection Pills / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherClassrooms.map(c => {
          const isSelected = activeClassroom?.id === c.id;
          const labCount = labs.filter(l => l.classroomId === c.id).length;
          const subCount = submissions.filter(s => s.classroomId === c.id).length;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedClassroomId(c.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-[#2b59ff] bg-white shadow-md ring-2 ring-blue-500/10'
                  : 'border-[#e3e6eb] bg-white hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-[#2b59ff] border border-blue-200">
                  {c.code}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyJoinCode(c.code);
                  }}
                  className="flex items-center space-x-1 text-[11px] font-semibold text-[#6b7382] hover:text-[#15171c] bg-[#f4f5f7] px-2 py-1 rounded-lg border border-[#e3e6eb] transition-all"
                  title="Copy student join code"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Code</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-[#15171c] group-hover:text-[#2b59ff] transition-colors line-clamp-1">
                {c.name}
              </h3>
              <p className="text-xs text-[#6b7382] mt-0.5">{c.section}</p>

              <div className="mt-4 pt-4 border-t border-[#f4f5f7] flex items-center justify-between text-xs text-[#6b7382]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#2b59ff]" />
                  <span>{c.studentIds.length} Students</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{labCount} Labs</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>{subCount} Subs</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Classroom Workspace & Labs */}
      {activeClassroom && (
        <div className="bg-white rounded-3xl border border-[#e3e6eb] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e3e6eb]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2b59ff] border border-blue-200">
                  Join Code: {activeClassroom.code}
                </span>
                <span className="text-xs text-[#6b7382]">· {activeClassroom.section}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#15171c] mt-1">
                {activeClassroom.name}
              </h2>
              <p className="text-xs text-[#6b7382] mt-1 max-w-2xl">
                {activeClassroom.description}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('authoring')}
                className="px-4 py-2.5 rounded-2xl bg-[#15171c] hover:bg-[#252830] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all btn-tactile hover-lift"
              >
                <Plus className="w-4 h-4 text-[#2b59ff]" />
                <span>Assign New Lab</span>
              </button>

              <button
                onClick={() => setActiveTab('grading')}
                className="px-4 py-2.5 rounded-2xl border border-[#e3e6eb] bg-[#f8f9fa] hover:bg-white text-[#15171c] font-bold text-xs flex items-center space-x-1.5 transition-all"
              >
                <Award className="w-4 h-4 text-purple-600" />
                <span>Grading Queue ({classroomSubmissions.length})</span>
              </button>
            </div>
          </div>

          {/* Assigned Labs in this Classroom */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#15171c] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#2b59ff]" />
                <span>Assigned Lab Practicals ({classroomLabs.length})</span>
              </h3>
            </div>

            {classroomLabs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#e3e6eb] bg-[#fcfdfe]">
                <Terminal className="w-8 h-8 text-[#6b7382] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#15171c]">No Labs Assigned Yet</p>
                <p className="text-xs text-[#6b7382] mt-1 max-w-sm mx-auto">
                  Click "Assign New Lab" to create a Linux container practical with starter files and automated instructions.
                </p>
                <button
                  onClick={() => setActiveTab('authoring')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#2b59ff] text-white text-xs font-bold shadow-sm"
                >
                  Create First Lab
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {classroomLabs.map(lab => {
                  const labSubmissions = submissions.filter(s => s.labId === lab.id);

                  return (
                    <div
                      key={lab.id}
                      className="p-5 rounded-2xl border border-[#e3e6eb] bg-[#fcfdfe] hover:bg-white hover:border-gray-300 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#15171c] hover:text-[#2b59ff] transition-colors cursor-pointer">
                            {lab.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {lab.totalPoints} Points
                          </span>
                          <span className="text-[11px] text-[#6b7382]">
                            Due: {new Date(lab.dueAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7382] line-clamp-1">
                          {lab.shortDescription}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-[#6b7382] font-mono">
                          <span>Starter Files: {lab.starterFiles?.map(f => f.name).join(', ') || 'None'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 flex-shrink-0">
                        {/* Student Preview Button */}
                        <button
                          onClick={() => {
                            setActiveLabId(lab.id);
                            startLabSession(lab.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2b59ff] font-bold text-xs flex items-center space-x-1 transition-all"
                          title="Launch interactive container to test lab as student"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Test Lab</span>
                        </button>

                        {/* View Submissions */}
                        <button
                          onClick={() => setActiveTab('grading')}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center space-x-1 transition-all"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{labSubmissions.length} Submissions</span>
                        </button>

                        {/* Delete Lab */}
                        <button
                          onClick={() => deleteLab(lab.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete Lab"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE CLASSROOM MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#e3e6eb] shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-pop-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#15171c] text-white mx-auto shadow-md">
                <BookOpen className="w-6 h-6 text-[#2b59ff]" />
              </div>
              <h2 className="text-2xl font-black text-[#15171c]">Create New Classroom</h2>
              <p className="text-xs text-[#6b7382]">
                Students can join using the unique classroom code you define
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#15171c] block mb-1">
                  Classroom Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Operating Systems & Linux Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#15171c]">
                      Class Code
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-[10px] text-[#2b59ff] font-bold hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. OS-303"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs font-mono font-bold text-[#15171c] focus:outline-none focus:border-[#2b59ff] uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#15171c] block mb-1">
                    Section / Batch
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    placeholder="e.g. Section A (Fall 2026)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#15171c] block mb-1">
                  Course Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Briefly describe the topics covered in this practical course..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#e3e6eb]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e3e6eb] text-xs font-semibold text-[#6b7382] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white text-xs font-bold shadow-md btn-tactile hover-lift"
                >
                  Create Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

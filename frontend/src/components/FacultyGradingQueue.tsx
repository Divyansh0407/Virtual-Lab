import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  Clock,
  FileCode,
  FileText,
  Terminal,
  Send,
  Eye,
  Check,
  AlertCircle,
  Save,
  UserCheck
} from 'lucide-react';
import { Submission } from '../types';

export const FacultyGradingQueue: React.FC = () => {
  const { submissions, gradeSubmission, currentUser } = useApp();

  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  const selectedSubmission = submissions.find(s => s.id === selectedSubId) || submissions[0];

  const [score, setScore] = useState<number>(selectedSubmission?.grade?.score || 10);
  const [feedback, setFeedback] = useState<string>(
    selectedSubmission?.grade?.feedback || 'Accurate command execution and clear explanation.'
  );
  const [publishedToast, setPublishedToast] = useState(false);

  React.useEffect(() => {
    if (selectedSubmission) {
      setScore(selectedSubmission.grade?.score ?? 10);
      setFeedback(
        selectedSubmission.grade?.feedback ??
          'Accurate command execution and sound technical explanation.'
      );
    }
  }, [selectedSubId]);

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'pending') return sub.status !== 'graded';
    if (filter === 'graded') return sub.status === 'graded';
    return true;
  });

  const handlePublish = () => {
    if (!selectedSubmission) return;
    gradeSubmission(selectedSubmission.id, score, feedback);
    setPublishedToast(true);
    setTimeout(() => setPublishedToast(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Filter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#15171c] text-white flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#15171c] tracking-tight">
                Student Submissions & Evaluation
              </h1>
              <p className="text-xs text-[#6b7382]">
                Inspect student terminal logs, review code files, and submit official grades
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#f4f5f7] p-1 rounded-2xl border border-[#e3e6eb] text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'all' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382]'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'pending' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382]'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'graded' ? 'bg-white text-[#15171c] shadow-sm' : 'text-[#6b7382]'
            }`}
          >
            Graded
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-[#e3e6eb] bg-white">
          <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#15171c]">No Submissions Yet</h3>
          <p className="text-xs text-[#6b7382] mt-1">
            When students complete practicals in their containers, their work will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7382] px-1">
              Submissions ({filteredSubmissions.length})
            </h3>

            <div className="space-y-2">
              {filteredSubmissions.map(sub => {
                const isSelected = selectedSubmission?.id === sub.id;
                const isGraded = sub.status === 'graded';

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-[#2b59ff] ring-2 ring-blue-500/10 shadow-md'
                        : 'border-[#e3e6eb] hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#15171c]">
                        {sub.studentName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isGraded
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {isGraded ? `Graded (${sub.grade?.score}/10)` : 'Pending Review'}
                      </span>
                    </div>

                    <p className="text-xs text-[#6b7382] font-medium line-clamp-1">
                      {sub.labTitle}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#6b7382]">
                      <span className="font-mono text-[10px]">{sub.classroomName}</span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Details & Grading Panel (Right Column) */}
          {selectedSubmission && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e3e6eb] shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e3e6eb]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#2b59ff]">{selectedSubmission.classroomName}</span>
                    <span className="text-xs text-[#6b7382]">•</span>
                    <span className="text-xs text-[#6b7382]">Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                  </div>
                  <h2 className="text-xl font-black text-[#15171c] mt-0.5">
                    {selectedSubmission.labTitle}
                  </h2>
                  <p className="text-xs text-[#6b7382] font-medium">
                    Student: <span className="font-bold text-[#15171c]">{selectedSubmission.studentName}</span>
                  </p>
                </div>

                {publishedToast && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-pop-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Grade Recorded!</span>
                  </div>
                )}
              </div>

              {/* Student Answers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#15171c] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2b59ff]" />
                  <span>Student Written Answers</span>
                </h4>

                <div className="space-y-2">
                  {Object.entries(selectedSubmission.answers || {}).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-[#f8f9fa] border border-[#e3e6eb] text-xs">
                      <p className="text-[10px] uppercase font-bold text-[#6b7382] mb-1">Response ({key})</p>
                      <p className="text-[#15171c] font-medium leading-relaxed whitespace-pre-wrap">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Logs & Output */}
              {selectedSubmission.terminalSnapshot && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#15171c] flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#2b59ff]" />
                    <span>Captured Container Terminal Commands</span>
                  </h4>
                  <pre className="p-4 rounded-2xl bg-[#0d1117] text-[#e6edf3] font-mono text-xs overflow-x-auto max-h-48 border border-gray-800">
                    {selectedSubmission.terminalSnapshot}
                  </pre>
                </div>
              )}

              {/* Code Files Snapshot */}
              {selectedSubmission.filesSnapshot && selectedSubmission.filesSnapshot.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#15171c] flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-[#2b59ff]" />
                    <span>Files Snapshot</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedSubmission.filesSnapshot.map((file, i) => (
                      <div key={i} className="p-3 rounded-xl border border-[#e3e6eb] bg-[#f8f9fa] space-y-1">
                        <span className="text-xs font-mono font-bold text-[#15171c]">{file.name}</span>
                        <pre className="p-2.5 rounded-lg bg-white border border-[#e3e6eb] text-[11px] font-mono text-gray-800 overflow-x-auto max-h-36">
                          {file.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grading Input Form */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>Assign Score & Feedback</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#15171c] block mb-1">
                      Score (out of 10)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={score}
                      onChange={e => setScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs font-bold text-[#15171c] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold text-[#15171c] block mb-1">
                      Faculty Remarks / Feedback
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      placeholder="Feedback for the student..."
                      className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs text-[#15171c] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handlePublish}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all btn-tactile hover-lift flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Publish Grade</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

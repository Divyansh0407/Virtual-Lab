import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCode,
  FileText,
  Terminal,
  Send,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Sliders,
  Save,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Submission } from '../types';

export const FacultyGradingQueue: React.FC = () => {
  const { submissions, publishGrade, currentUser, setGuidedTourStep } = useApp();

  const [selectedSubId, setSelectedSubId] = useState<string>(submissions[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  const selectedSubmission = submissions.find(s => s.id === selectedSubId) || submissions[0];

  const [autoPoints, setAutoPoints] = useState<number>(
    selectedSubmission?.evaluation?.objectiveScore || 6
  );
  const [explanationPoints, setExplanationPoints] = useState<number>(
    selectedSubmission?.evaluation?.aiFeedback?.suggestedExplanationScore || 2
  );
  const [evidencePoints, setEvidencePoints] = useState<number>(2);
  const [facultyFeedback, setFacultyFeedback] = useState<string>(
    selectedSubmission?.grade?.facultyNotes ||
      'Strong demonstration of file permissions and POSIX access control. Explanation of octal notation is accurate and security reasoning is sound.'
  );
  const [publishedToast, setPublishedToast] = useState(false);

  React.useEffect(() => {
    if (selectedSubmission) {
      setAutoPoints(selectedSubmission.evaluation?.objectiveScore || 6);
      setExplanationPoints(
        selectedSubmission.grade?.breakdown.writtenExplanationPoints ??
          (selectedSubmission.evaluation?.aiFeedback?.suggestedExplanationScore || 2)
      );
      setEvidencePoints(selectedSubmission.grade?.breakdown.evidenceCompletenessPoints ?? 2);
      setFacultyFeedback(
        selectedSubmission.grade?.facultyNotes ||
          'Comprehensive work. Accurate permission bits and clear explanation.'
      );
    }
  }, [selectedSubId]);

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'pending') return sub.status !== 'published';
    if (filter === 'graded') return sub.status === 'published';
    return true;
  });

  const totalCalculatedScore = Math.min(10, autoPoints + explanationPoints + evidencePoints);

  const handlePublish = () => {
    if (!selectedSubmission) return;
    publishGrade(
      selectedSubmission.id,
      totalCalculatedScore,
      {
        automatedCheckPoints: autoPoints,
        writtenExplanationPoints: explanationPoints,
        evidenceCompletenessPoints: evidencePoints
      },
      facultyFeedback
    );

    setPublishedToast(true);
    setTimeout(() => setPublishedToast(false), 3000);
    setGuidedTourStep(5);
  };

  const handleApplyAIScore = () => {
    if (selectedSubmission?.evaluation?.aiFeedback) {
      setExplanationPoints(selectedSubmission.evaluation.aiFeedback.suggestedExplanationScore);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Filter Strip */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 framer-card">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#2b59ff]" />
            <h1 className="text-xl font-bold text-[#15171c]">Faculty Grading & Evaluation Studio</h1>
          </div>
          <p className="text-xs text-[#6b7382] mt-1">
            Review student snapshots, inspect automated check outputs, examine AI rubric suggestions, and publish official grades.
          </p>
        </div>

        <div className="flex items-center bg-[#f4f5f7] p-1 rounded-xl border border-[#e3e6eb] text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all btn-tactile ${
              filter === 'all' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all btn-tactile ${
              filter === 'pending' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-3 py-1.5 rounded-lg transition-all btn-tactile ${
              filter === 'graded' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            Published
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Submissions Queue Column (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs uppercase font-bold text-[#6b7382] tracking-wider px-1">
            Submissions Queue
          </h2>

          <div className="space-y-2.5">
            {filteredSubmissions.map(sub => {
              const isSelected = sub.id === selectedSubmission?.id;
              const isGraded = sub.status === 'published';

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all framer-card hover-lift ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                      : 'bg-white border-[#e3e6eb] hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#2b59ff]">
                      {sub.courseCode}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isGraded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isGraded ? `Graded: ${sub.grade?.finalScore}/10` : 'Pending'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#15171c]">{sub.studentName}</h3>
                  <p className="text-xs text-[#6b7382] truncate mt-0.5">{sub.labTitle}</p>

                  <div className="mt-3 pt-2 border-t border-[#e3e6eb] flex items-center justify-between text-[11px] text-[#6b7382] font-mono">
                    <span>Auto: {sub.evaluation?.objectiveScore || 6}/6 pts</span>
                    <span>{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Grading Studio Panel (8 cols) */}
        {selectedSubmission ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Meta Strip */}
            <div className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#15171c] font-bold">{selectedSubmission.studentName}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#6b7382]">{selectedSubmission.courseCode}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#6b7382]">Attempt #{selectedSubmission.attemptNo}</span>
                </div>
                <h2 className="text-lg font-bold text-[#15171c] mt-1">
                  {selectedSubmission.labTitle}
                </h2>
                <p className="text-[11px] font-mono text-[#6b7382] mt-1 truncate">
                  SHA-256 Digest: <span className="text-[#2b59ff]">{selectedSubmission.artifactRef}</span>
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs text-[#6b7382]">Status:</span>
                <p className="text-sm font-bold text-emerald-600">
                  {selectedSubmission.status === 'published' ? 'Published' : 'In Review'}
                </p>
              </div>
            </div>

            {/* Split Inspection View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-[#e3e6eb] shadow-sm space-y-4">
                <h3 className="text-xs uppercase font-bold text-[#15171c] tracking-wider flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#2b59ff]" />
                  <span>Student Written Answers</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb]">
                    <p className="text-xs font-bold text-[#15171c] mb-1">
                      Q1: Explanation of 640 mode & enterprise security
                    </p>
                    <p className="text-xs text-[#6b7382] leading-relaxed">
                      {selectedSubmission.answers['q1'] || 'No written response recorded.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0d1117] text-white">
                    <p className="text-xs font-semibold text-gray-400 mb-1">
                      Q2: Terminal Output Verification
                    </p>
                    <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                      {selectedSubmission.answers['q2'] || selectedSubmission.terminalSnapshot}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e3e6eb] shadow-sm space-y-4">
                <h3 className="text-xs uppercase font-bold text-[#15171c] tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated Checks & AI Suggestion</span>
                </h3>

                <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#15171c]">Automated Suite (Deterministic)</span>
                    <span className="font-mono text-emerald-600">
                      {selectedSubmission.evaluation?.objectiveScore || 6} / 6 Pts
                    </span>
                  </div>
                  {selectedSubmission.evaluation?.testCases.map((tc, idx) => (
                    <div key={idx} className="text-[11px] font-mono text-[#6b7382] pl-2 border-l-2 border-emerald-500">
                      ✓ {tc.title} (+{tc.pointsEarned} pts)
                    </div>
                  ))}
                </div>

                {selectedSubmission.evaluation?.aiFeedback && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2b59ff] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#2b59ff]" />
                        AI Advisory Rubric Score
                      </span>
                      <button
                        onClick={handleApplyAIScore}
                        className="text-[10px] text-[#2b59ff] font-semibold bg-white px-2 py-0.5 rounded border border-blue-200 shadow-sm"
                      >
                        Apply AI Score
                      </button>
                    </div>
                    <p className="text-xs text-[#15171c] leading-relaxed">
                      {selectedSubmission.evaluation.aiFeedback.summary}
                    </p>
                    <p className="text-[11px] text-[#6b7382] font-mono">
                      Suggested: <strong>{selectedSubmission.evaluation.aiFeedback.suggestedExplanationScore} / 2.0 Pts</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Faculty Manual Grading & Publish Form */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#e3e6eb] pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-[#2b59ff]" />
                  <h3 className="text-base font-bold text-[#15171c]">
                    Instructor Override & Final Grade Publication
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#6b7382]">Final Score:</span>
                  <p className="text-xl font-mono font-black text-emerald-600">
                    {totalCalculatedScore} / 10 Points
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <label className="text-[#6b7382]">Automated Checks</label>
                    <span className="font-mono text-[#15171c]">{autoPoints} / 6</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={autoPoints}
                    onChange={e => setAutoPoints(Number(e.target.value))}
                    className="w-full accent-[#2b59ff] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <label className="text-[#6b7382]">Written Explanation</label>
                    <span className="font-mono text-[#15171c]">{explanationPoints} / 2</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.5"
                    value={explanationPoints}
                    onChange={e => setExplanationPoints(Number(e.target.value))}
                    className="w-full accent-[#2b59ff] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <label className="text-[#6b7382]">Terminal Evidence</label>
                    <span className="font-mono text-[#15171c]">{evidencePoints} / 2</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.5"
                    value={evidencePoints}
                    onChange={e => setEvidencePoints(Number(e.target.value))}
                    className="w-full accent-[#2b59ff] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#15171c]">
                  Faculty Feedback & Academic Notes for Student
                </label>
                <textarea
                  rows={3}
                  value={facultyFeedback}
                  onChange={e => setFacultyFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#e3e6eb] text-xs sm:text-sm text-[#15171c] focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="Provide personalized constructive feedback..."
                />
              </div>

              <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                {publishedToast && (
                  <span className="text-xs text-emerald-600 flex items-center space-x-1.5 font-bold animate-pop-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Grade published to student portal and audit trail recorded!</span>
                  </span>
                )}
                <div className="ml-auto flex items-center space-x-3">
                  <button
                    onClick={handlePublish}
                    className="px-6 py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all btn-tactile hover-lift"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Official Grade ({totalCalculatedScore}/10)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-[#6b7382] bg-white rounded-2xl border border-[#e3e6eb]">
            Select a student submission to evaluate.
          </div>
        )}
      </div>
    </div>
  );
};

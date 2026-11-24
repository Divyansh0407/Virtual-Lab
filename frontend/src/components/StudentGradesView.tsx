import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const StudentGradesView: React.FC = () => {
  const { currentUser, submissions, setActiveLabId, setActiveTab } = useApp();

  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-[#15171c]">Academic Grades & Verified Submissions</h1>
          </div>
          <p className="text-xs text-[#6b7382] mt-1">
            View officially released faculty evaluations, automated test suite reports, and cryptographic snapshot receipts.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c]">
          Student ID: <span className="text-[#2b59ff] font-bold">{currentUser.studentId}</span>
        </div>
      </div>

      {studentSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#6b7382] space-y-3 border border-[#e3e6eb] shadow-sm">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-[#15171c]">No lab submissions recorded yet.</p>
          <p className="text-xs text-[#6b7382]">
            Launch your assigned practical from the My Practicals dashboard to submit work.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-semibold inline-block"
          >
            Go to My Practicals
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {studentSubmissions.map(sub => {
            const isGraded = sub.grade?.status === 'published';

            return (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3e6eb] pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#2b59ff] bg-blue-50 px-2 py-0.5 rounded">
                        {sub.courseCode}
                      </span>
                      <span className="text-sm font-bold text-[#15171c]">{sub.labTitle}</span>
                    </div>
                    <p className="text-[11px] text-[#6b7382] font-mono mt-1">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()} • Artifact: {sub.artifactRef.substring(0, 24)}...
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#6b7382]">Score:</span>
                    <p className="text-xl font-black font-mono text-emerald-600">
                      {isGraded ? `${sub.grade?.finalScore} / ${sub.grade?.maxScore}` : `${sub.evaluation?.objectiveScore || 6} / 10 (Under Review)`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb]">
                    <p className="text-[#6b7382]">Automated Checks</p>
                    <p className="text-[#15171c] font-black text-sm mt-0.5">
                      {sub.grade?.breakdown.automatedCheckPoints ?? sub.evaluation?.objectiveScore ?? 6} / 6 Pts
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb]">
                    <p className="text-[#6b7382]">Written Explanation</p>
                    <p className="text-[#15171c] font-black text-sm mt-0.5">
                      {sub.grade?.breakdown.writtenExplanationPoints ?? sub.evaluation?.aiFeedback?.suggestedExplanationScore ?? 2} / 2 Pts
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb]">
                    <p className="text-[#6b7382]">Evidence Completeness</p>
                    <p className="text-[#15171c] font-black text-sm mt-0.5">
                      {sub.grade?.breakdown.evidenceCompletenessPoints ?? 2} / 2 Pts
                    </p>
                  </div>
                </div>

                {sub.grade?.facultyNotes && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800">Faculty Feedback ({sub.grade.reviewerName}): </span>
                    <span className="text-[#15171c]">{sub.grade.facultyNotes}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#6b7382] font-mono flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cryptographic snapshot frozen in PostgreSQL storage</span>
                  </span>

                  <button
                    onClick={() => {
                      setActiveLabId(sub.labId);
                      setActiveTab('workspace');
                    }}
                    className="text-xs text-[#2b59ff] font-bold flex items-center space-x-1"
                  >
                    <span>View Workspace & Evidence</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

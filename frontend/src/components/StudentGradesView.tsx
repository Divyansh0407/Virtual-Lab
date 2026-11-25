import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Terminal,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const StudentGradesView: React.FC = () => {
  const { currentUser, submissions, setActiveLabId, setActiveTab, startLabSession } = useApp();

  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#15171c] text-white flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#15171c] tracking-tight">
                My Submissions & Grades
              </h1>
              <p className="text-xs text-[#6b7382]">
                View your practical submissions, instructor evaluations, and marks
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono px-3.5 py-2 rounded-2xl bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c]">
          Student: <span className="text-[#2b59ff] font-bold">{currentUser.name}</span> ({currentUser.studentId})
        </div>
      </div>

      {studentSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-[#6b7382] space-y-3 border border-[#e3e6eb] shadow-sm">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#15171c]">No Submissions Recorded Yet</h3>
          <p className="text-xs text-[#6b7382] max-w-sm mx-auto">
            Launch your assigned practicals from your dashboard, run the commands, and submit your work.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#2b59ff] text-white text-xs font-bold shadow-md hover-lift transition-all"
          >
            Go to Practicals Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {studentSubmissions.map(sub => {
            const isGraded = sub.status === 'graded';

            return (
              <div key={sub.id} className="bg-white rounded-3xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3e6eb] pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#2b59ff] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        {sub.classroomName}
                      </span>
                      <h3 className="text-base font-bold text-[#15171c]">{sub.labTitle}</h3>
                    </div>
                    <p className="text-xs text-[#6b7382] mt-1">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isGraded
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isGraded ? 'Graded by Instructor' : 'Under Review'}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6b7382] uppercase font-bold block">Score</span>
                      <p className="text-xl font-black font-mono text-emerald-600">
                        {isGraded ? `${sub.grade?.score} / 10` : '— / 10'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Faculty Feedback */}
                {isGraded && sub.grade?.feedback && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-purple-900 tracking-wider">
                      Instructor Feedback ({sub.grade.gradedBy || 'Faculty'}):
                    </p>
                    <p className="text-xs text-purple-950 font-medium leading-relaxed">
                      "{sub.grade.feedback}"
                    </p>
                  </div>
                )}

                {/* Re-open Workspace */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setActiveLabId(sub.labId);
                      startLabSession(sub.labId);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#15171c] text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <Terminal className="w-3.5 h-3.5 text-[#2b59ff]" />
                    <span>Open Container Workspace</span>
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

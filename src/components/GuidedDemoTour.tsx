import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  X
} from 'lucide-react';

export const GuidedDemoTour: React.FC = () => {
  const {
    showGuidedTour,
    setShowGuidedTour,
    guidedTourStep,
    setGuidedTourStep,
    switchUser,
    setActiveTab,
    startLabSession,
    activeSession
  } = useApp();

  if (!showGuidedTour) return null;

  const steps = [
    {
      step: 1,
      title: 'Lab Definition & Assignment',
      actor: 'Faculty (Garvit Dohare)',
      actorId: 'faculty-1',
      desc: 'Faculty publishes "Lab 04: Linux File Permissions (640)" with automated check criteria and rubric.',
      targetTab: 'authoring',
      actionText: 'View Lab Blueprint',
      runAction: () => {
        switchUser('faculty-1');
        setActiveTab('authoring');
      }
    },
    {
      step: 2,
      title: 'Student Container Launch & Experiment',
      actor: 'Student (Divyansh Sharma)',
      actorId: 'student-1',
      desc: 'Student launches disposable rootless Ubuntu container, executes `chmod 640 report.txt`, and inspects perms.',
      targetTab: 'workspace',
      actionText: 'Launch & Open Shell',
      runAction: () => {
        switchUser('student-1');
        if (!activeSession || activeSession.state !== 'running') {
          startLabSession('lab-linux-perm');
        } else {
          setActiveTab('workspace');
        }
      }
    },
    {
      step: 3,
      title: 'Submit Snapshot & Auto-Evaluation',
      actor: 'Evaluation Engine',
      actorId: 'student-1',
      desc: 'Student submits answers & evidence. Engine generates SHA-256 snapshot, runs automated tests (6/6 pts), and AI feedback.',
      targetTab: 'workspace',
      actionText: 'Open Submission Tab',
      runAction: () => {
        switchUser('student-1');
        setActiveTab('workspace');
      }
    },
    {
      step: 4,
      title: 'Faculty Grading Studio & Grade Publish',
      actor: 'Faculty (Garvit Dohare)',
      actorId: 'faculty-1',
      desc: 'Faculty inspects Harshvardhan Gupta / Divyansh Sharma submission diff, reviews AI advice, overrides score, and publishes official grade.',
      targetTab: 'grading',
      actionText: 'Open Grading Studio',
      runAction: () => {
        switchUser('faculty-1');
        setActiveTab('grading');
      }
    },
    {
      step: 5,
      title: 'Admin Platform Health & Audit Isolation',
      actor: 'Administrator (Akshita)',
      actorId: 'admin-1',
      desc: 'Admin observes container lifecycle metrics, hardened image registry, and immutable audit logs.',
      targetTab: 'admin',
      actionText: 'Inspect Cluster Health',
      runAction: () => {
        switchUser('admin-1');
        setActiveTab('admin');
      }
    }
  ];

  const current = steps[guidedTourStep - 1] || steps[0];

  return (
    <div className="bg-[#ffffff] border-b border-[#e3e6eb] px-4 py-2.5 text-[#15171c] shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Step progress and title */}
        <div className="flex items-start sm:items-center space-x-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2b59ff] font-bold text-xs">
            {guidedTourStep}/5
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#2b59ff] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2b59ff]" />
                Major Project Demo Sequence
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-semibold text-[#15171c]">
                Role: <span className="text-amber-600 font-bold">{current.actor}</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-[#15171c] mt-0.5">
              {current.title}: <span className="text-[#6b7382] font-normal">{current.desc}</span>
            </p>
          </div>
        </div>

        {/* Right: Step Quick Navigation & Actions */}
        <div className="flex items-center flex-wrap gap-2 lg:flex-nowrap">
          <button
            onClick={current.runAction}
            className="px-3 py-1 rounded-lg bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{current.actionText}</span>
          </button>

          <div className="flex items-center space-x-1 bg-[#f4f5f7] p-0.5 rounded-lg border border-[#e3e6eb]">
            {steps.map(s => (
              <button
                key={s.step}
                onClick={() => {
                  setGuidedTourStep(s.step);
                  s.runAction();
                }}
                className={`w-5 h-5 rounded text-xs font-bold transition-all ${
                  s.step === guidedTourStep
                    ? 'bg-white text-[#15171c] shadow-sm border border-[#e3e6eb]'
                    : 'text-[#6b7382] hover:text-[#15171c]'
                }`}
                title={`${s.title} (${s.actor})`}
              >
                {s.step}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (guidedTourStep < steps.length) {
                const nextStep = guidedTourStep + 1;
                setGuidedTourStep(nextStep);
                steps[nextStep - 1].runAction();
              } else {
                setGuidedTourStep(1);
                steps[0].runAction();
              }
            }}
            className="p-1 rounded-lg bg-[#f4f5f7] hover:bg-gray-200 text-[#15171c] text-xs flex items-center"
            title="Next Step"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowGuidedTour(false)}
            className="p-1 rounded-lg text-[#6b7382] hover:text-[#15171c]"
            title="Dismiss walkthrough banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

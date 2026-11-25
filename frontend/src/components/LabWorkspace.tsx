import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RealTerminal } from './RealTerminal';
import {
  Terminal,
  Play,
  Square,
  RotateCcw,
  Clock,
  Cpu,
  FileCode,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
  Maximize2,
  Save,
  Check,
  Code2
} from 'lucide-react';
import { LabFile } from '../types';

export const LabWorkspace: React.FC = () => {
  const {
    currentUser,
    labs,
    activeLabId,
    activeSession,
    startLabSession,
    stopLabSession,
    reconnectLabSession,
    updateSessionFile,
    createSessionFile,
    submitLab,
    submissions,
    setActiveTab: setGlobalTab
  } = useApp();

  const currentLab = labs.find(l => l.id === activeLabId) || labs[0];

  const [activeTab, setActiveTab] = useState<'terminal' | 'editor' | 'guide' | 'submit'>('terminal');

  // Quick command executor reference into RealTerminal
  const quickCommandRef = useRef<((cmd: string) => void) | null>(null);

  const handleQuickRun = (cmd: string) => {
    if (quickCommandRef.current) {
      quickCommandRef.current(cmd + '\n');
    }
  };

  // Editor state
  const sessionFiles = activeSession?.files && activeSession.files.length > 0
    ? activeSession.files
    : currentLab?.starterFiles || [];

  const [selectedFileName, setSelectedFileName] = useState<string>(
    sessionFiles[0]?.name || 'solution.sh'
  );
  const [newFileModalOpen, setNewFileModalOpen] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const currentFile = sessionFiles.find(f => f.name === selectedFileName) || sessionFiles[0];

  // Submission answers state
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: 'Owner has Read+Write (6); Group has Read-only (4); Others have No access (0). This prevents untrusted users from tampering with files.',
    q2: '-rw-r----- 1 student student 142 Nov 24 report.txt'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const existingSub = submissions.find(
    s => s.labId === currentLab?.id && s.studentId === currentUser.id
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateFile = () => {
    if (!newFileNameInput.trim()) return;
    const cleanName = newFileNameInput.trim();
    createSessionFile(cleanName, `# ${cleanName}\n`);
    setSelectedFileName(cleanName);
    setNewFileNameInput('');
    setNewFileModalOpen(false);
  };

  const handleSaveFile = () => {
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2000);
  };

  const handleSubmitLab = () => {
    if (!currentLab) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const terminalSnippet = activeSession?.terminalLogs?.slice(-10)?.join('\n') || 'Commands executed successfully.';
      submitLab(currentLab.id, answers, terminalSnippet);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Workspace Top Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2b59ff] border border-blue-200">
              {currentLab?.classroomCode || 'CLASSROOM'}
            </span>
            <span className="text-xs text-[#6b7382]">
              {currentLab?.classroomName || 'Practical Lab'}
            </span>
            <span className="text-xs text-[#6b7382]">•</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {currentLab?.totalPoints || 10} Marks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#15171c] mt-1 tracking-tight">
            {currentLab?.title || 'Interactive Linux Lab Workspace'}
          </h1>
        </div>

        {/* Action Controls & Session Timer */}
        <div className="flex items-center space-x-3 flex-wrap">
          {activeSession && activeSession.state === 'running' ? (
            <>
              {/* Session Timer */}
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-800">
                <Clock className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                <span className="font-mono">{formatTime(activeSession.timeRemainingSeconds)}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600">Left</span>
              </div>

              {/* Container Status Pill */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-[#0d1117] text-white text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="truncate max-w-[140px]">{activeSession.containerRef}</span>
              </div>

              {/* Stop Lab Button */}
              <button
                onClick={stopLabSession}
                className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center space-x-1.5 border border-rose-200 transition-all btn-tactile"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Lab</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => startLabSession(currentLab?.id)}
              className="px-6 py-2.5 rounded-2xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs flex items-center space-x-2 shadow-md hover-lift transition-all btn-tactile"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Lab on AWS EC2</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-[#f4f5f7] p-1 rounded-2xl border border-[#e3e6eb] max-w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'terminal'
              ? 'bg-[#15171c] text-white shadow-sm'
              : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive Bash Terminal</span>
          {activeSession?.state === 'running' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'editor'
              ? 'bg-[#15171c] text-white shadow-sm'
              : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Code & File Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'guide'
              ? 'bg-[#15171c] text-white shadow-sm'
              : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tasks & Instructions</span>
        </button>

        <button
          onClick={() => setActiveTab('submit')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'submit'
              ? 'bg-[#15171c] text-white shadow-sm'
              : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Submit Lab</span>
          {existingSub && (
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
              ✓
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: REAL TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="space-y-3">
          {activeSession?.state === 'running' ? (
            <div className="rounded-3xl border border-gray-800 bg-[#0d1117] shadow-2xl overflow-hidden animate-pop-in">
              {/* Terminal Quick Command Ribbon */}
              <div className="px-4 py-2.5 bg-[#161b22] border-b border-gray-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <span className="text-gray-400 font-mono text-[11px] ml-2">
                    student@virtuallab:~$ (virtuallab-linux:1.0)
                  </span>
                </div>

                {/* Quick command buttons */}
                <div className="flex items-center space-x-1.5 overflow-x-auto">
                  <span className="text-gray-500 text-[10px] uppercase font-bold mr-1">Quick Run:</span>
                  <button
                    onClick={() => handleQuickRun('whoami')}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[11px] transition-all"
                  >
                    whoami
                  </button>
                  <button
                    onClick={() => handleQuickRun('pwd')}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[11px] transition-all"
                  >
                    pwd
                  </button>
                  <button
                    onClick={() => handleQuickRun('ls -la')}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[11px] transition-all"
                  >
                    ls -la
                  </button>
                  <button
                    onClick={() => handleQuickRun('cat instructions.txt')}
                    className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-[11px] transition-all"
                  >
                    cat instructions.txt
                  </button>
                </div>
              </div>

              {/* Real Interactive xterm.js Terminal */}
              <div className="p-2 bg-[#0d1117] min-h-[480px]">
                <RealTerminal
                  sessionId={activeSession.id}
                  ticket={activeSession.ticket || ''}
                  containerRef={activeSession.containerRef}
                  quickCommandRef={quickCommandRef}
                  onReconnect={reconnectLabSession}
                />
              </div>
            </div>
          ) : activeSession?.state === 'starting' ? (
            <div className="rounded-3xl border border-[#e3e6eb] bg-[#0d1117] text-white shadow-xl flex flex-col items-center justify-center p-12 min-h-[480px] text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-[#161b22] border border-gray-800 flex items-center justify-center mb-4 text-[#2b59ff]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#2b59ff]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Allocating Container on AWS EC2</h3>
              <p className="text-xs text-gray-400 max-w-md mb-4 leading-relaxed font-mono">
                Provisioning hardened <code className="text-blue-400">virtuallab-linux:1.0</code> sandbox with 128 MB RAM, 0.25 vCPU, and dropped capabilities...
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#2b59ff] animate-ping"></span>
                <span>Connecting interactive Bash WebSocket...</span>
              </div>
            </div>
          ) : activeSession?.state === 'failed' ? (
            <div className="rounded-3xl border border-rose-200 bg-white shadow-sm p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#15171c]">Could Not Connect to AWS Backend</h3>
              <p className="text-xs text-[#6b7382] max-w-lg mx-auto leading-relaxed">
                {activeSession.errorMessage || 'Please verify that your EC2 backend is running and the SSH port forward tunnel on port 5001 is active.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => startLabSession(currentLab?.id)}
                  className="px-6 py-2.5 rounded-xl bg-[#2b59ff] text-white font-bold text-xs shadow-md hover-lift transition-all"
                >
                  Retry Container Provision
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#e3e6eb] bg-[#0d1117] text-white shadow-xl flex flex-col items-center justify-center p-12 min-h-[480px] text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#161b22] border border-gray-800 flex items-center justify-center mb-4 text-[#2b59ff]">
                <Terminal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Container Terminal</h3>
              <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed font-mono">
                Click below to spin up a disposable Ubuntu 24.04 container on AWS EC2 with full interactive Bash TTY support.
              </p>
              <button
                onClick={() => startLabSession(currentLab?.id)}
                className="px-6 py-3 rounded-2xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs flex items-center space-x-2 shadow-lg hover-lift transition-all btn-tactile"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Container on AWS EC2</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CODE & FILE EDITOR (VSCODE-STYLED) */}
      {activeTab === 'editor' && (
        <div className="rounded-3xl border border-gray-800 bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[540px]">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-60 bg-[#161b22] border-b md:border-b-0 md:border-r border-gray-800 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#2b59ff]" />
                  <span>Workspace Files</span>
                </span>
                <button
                  onClick={() => setNewFileModalOpen(true)}
                  className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                  title="Create New File"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {sessionFiles.map(file => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFileName(file.name)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono text-left transition-all ${
                      selectedFileName === file.name
                        ? 'bg-[#2b59ff]/20 text-[#58a6ff] font-bold border border-[#2b59ff]/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    {file.isReadOnly && (
                      <span className="text-[9px] uppercase px-1 rounded bg-gray-800 text-gray-500 ml-auto">
                        RO
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 text-[10px] text-gray-500 font-mono">
              Working Directory: <code>/home/student/</code>
            </div>
          </div>

          {/* Main Editor Pane */}
          <div className="flex-1 flex flex-col bg-[#0d1117]">
            {/* Editor Top Bar */}
            <div className="bg-[#161b22] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-gray-200">{currentFile?.name}</span>
                {saveSuccessToast && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 animate-pop-in">
                    <Check className="w-3 h-3" /> Saved!
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveFile}
                  className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                {activeSession?.state === 'running' && (
                  <button
                    onClick={() => {
                      setActiveTab('terminal');
                      if (currentFile?.name?.endsWith('.sh')) {
                        handleQuickRun(`bash ${currentFile.name}`);
                      } else if (currentFile?.name?.endsWith('.c')) {
                        handleQuickRun(`gcc ${currentFile.name} -o prog && ./prog`);
                      } else if (currentFile?.name?.endsWith('.py')) {
                        handleQuickRun(`python3 ${currentFile.name}`);
                      } else {
                        handleQuickRun(`cat ${currentFile?.name}`);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-[#2b59ff] hover:bg-[#1e40eb] text-white text-xs font-bold flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run in Terminal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Code Textarea with Line Numbers */}
            <div className="flex-1 flex overflow-hidden min-h-[440px]">
              {/* Line numbers gutter */}
              <div className="bg-[#0d1117] select-none py-3 px-3 font-mono text-xs text-gray-600 text-right w-12 border-r border-gray-800">
                {Array.from({ length: Math.max(18, (currentFile?.content.split('\n').length || 1)) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={currentFile?.content || ''}
                onChange={e => {
                  if (currentFile && !currentFile.isReadOnly) {
                    updateSessionFile(currentFile.name, e.target.value);
                  }
                }}
                disabled={currentFile?.isReadOnly}
                className="flex-1 p-3 bg-transparent text-[#e6edf3] font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                placeholder={currentFile?.isReadOnly ? 'Read-only starter instructions.' : 'Write code here...'}
                spellCheck={false}
              />
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-[#161b22] px-4 py-1.5 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <div className="flex items-center space-x-3">
                <span>Lines: {currentFile?.content?.split('\n').length || 1}</span>
                <span>Length: {currentFile?.content?.length || 0} chars</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>UTF-8</span>
                <span>LF</span>
                <span>{currentFile?.name?.split('.').pop()?.toUpperCase() || 'TXT'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TASKS & INSTRUCTIONS */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm space-y-6">
          <div className="border-b border-[#e3e6eb] pb-4">
            <h2 className="text-xl font-bold text-[#15171c] flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#2b59ff]" />
              <span>Lab Specifications & Guidelines</span>
            </h2>
            <p className="text-xs text-[#6b7382] mt-1">
              Follow these instructions to complete the practical in your interactive container.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e3e6eb] space-y-2">
            <h3 className="text-xs uppercase font-bold text-[#15171c] tracking-wider">
              Prerequisites
            </h3>
            <ul className="space-y-1 text-xs text-[#6b7382]">
              {currentLab?.prerequisites?.map((p, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2b59ff]"></span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#fcfdfe] border border-[#e3e6eb] space-y-3">
            <h3 className="text-sm font-bold text-[#15171c]">Instructions</h3>
            <div className="prose prose-sm max-w-none text-xs text-[#15171c] leading-relaxed whitespace-pre-wrap font-sans">
              {currentLab?.instructions}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUBMIT LAB */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm space-y-6">
          <div className="border-b border-[#e3e6eb] pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#15171c] flex items-center space-x-2">
                <Send className="w-5 h-5 text-[#2b59ff]" />
                <span>Submit Lab Practical for Grading</span>
              </h2>
              <p className="text-xs text-[#6b7382] mt-1">
                Your container history, code files, and written explanations will be submitted to your teacher.
              </p>
            </div>

            {submittedSuccess && (
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pop-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lab successfully submitted!</span>
              </div>
            )}
          </div>

          {/* Submission Questions */}
          <div className="space-y-4">
            {currentLab?.questions?.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-2xl border border-[#e3e6eb] bg-[#fcfdfe] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#15171c]">Question {idx + 1} ({q.maxPoints} Points)</span>
                </div>
                <p className="text-xs text-[#6b7382] font-medium">{q.prompt}</p>
                <textarea
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Type your explanation or paste command evidence..."
                  className="w-full p-3 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] bg-white focus:outline-none focus:border-[#2b59ff]"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#e3e6eb] flex justify-end">
            <button
              onClick={handleSubmitLab}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs shadow-md transition-all btn-tactile hover-lift flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting to Teacher...' : 'Final Submit Lab'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CREATE FILE MODAL */}
      {newFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#e3e6eb] shadow-2xl p-6 space-y-4 animate-pop-in">
            <h3 className="text-lg font-bold text-[#15171c]">Create New File</h3>
            <input
              type="text"
              autoFocus
              value={newFileNameInput}
              onChange={e => setNewFileNameInput(e.target.value)}
              placeholder="e.g. main.c, script.sh"
              className="w-full px-3 py-2.5 rounded-xl border border-[#e3e6eb] text-xs font-mono text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setNewFileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6b7382]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFile}
                className="px-4 py-2 rounded-xl bg-[#2b59ff] text-white text-xs font-bold shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

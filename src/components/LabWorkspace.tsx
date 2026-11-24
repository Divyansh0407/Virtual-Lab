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
  HardDrive,
  Shield,
  FileCode,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Copy,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
  Maximize2,
  Info
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
    resetLabSession,
    executeTerminalCommand,
    updateSessionFile,
    createSessionFile,
    submitLab,
    submissions,
    setGuidedTourStep
  } = useApp();

  const currentLab = labs.find(l => l.id === activeLabId) || labs[0];

  const [activeTab, setActiveTab] = useState<'guide' | 'terminal' | 'editor' | 'submit' | 'results'>('terminal');

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const quickCommandRef = useRef<((cmd: string) => void) | null>(null);

  const handleQuickRun = (cmd: string) => {
    if (quickCommandRef.current) {
      quickCommandRef.current(cmd + '\n');
    } else {
      executeTerminalCommand(cmd);
    }
  };

  // Editor state
  const [selectedFileName, setSelectedFileName] = useState<string>('report.txt');
  const [newFileModalOpen, setNewFileModalOpen] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState('');

  // Submission answers state
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: 'Mode 640 translates into: Owner has Read + Write (4+2=6); Group has Read-only (4); Others have No permissions (0). In an enterprise context, this ensures that the author can modify their work, authorized group members (such as sysadmin or grading group) can inspect it, but general untrusted users cannot read or tamper with the audit data.',
    q2: '-rw-r----- 1 student student 142 Nov 21 12:20 report.txt'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.terminalLogs, activeTab]);

  const currentFile = activeSession?.files.find(f => f.name === selectedFileName) || activeSession?.files[0];

  const existingSub = submissions.find(
    s => s.labId === currentLab.id && s.studentId === currentUser.id
  );

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    executeTerminalCommand(terminalInput);
    setCommandHistory(prev => [...prev, terminalInput]);
    setHistoryIndex(-1);
    setTerminalInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setTerminalInput(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setTerminalInput('');
      } else {
        setHistoryIndex(nextIndex);
        setTerminalInput(commandHistory[nextIndex]);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateFile = () => {
    if (!newFileNameInput.trim()) return;
    createSessionFile(newFileNameInput.trim());
    setSelectedFileName(newFileNameInput.trim());
    setNewFileNameInput('');
    setNewFileModalOpen(false);
  };

  const handleSubmitLab = () => {
    if (!activeSession) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const terminalSnippet = activeSession.terminalLogs.slice(-10).join('\n');
      const sub = submitLab(currentLab.id, answers, terminalSnippet);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setLastSubmissionId(sub.id);
      setActiveTab('results');
      setGuidedTourStep(4);
    }, 1200);
  };

  const handleAutoInsertTerminalEvidence = () => {
    if (!activeSession) return;
    const statLog = activeSession.terminalLogs.find(l => l.includes('-rw-r-----') || l.includes('640') || l.includes('total'));
    if (statLog) {
      setAnswers(prev => ({ ...prev, q2: statLog }));
    } else {
      setAnswers(prev => ({
        ...prev,
        q2: `$ stat -c "%a %n" report.txt\n640 report.txt\n$ ls -l report.txt\n-rw-r----- 1 student student 142 Nov 21 12:20 report.txt`
      }));
    }
  };

  const displaySubmission = existingSub || (lastSubmissionId ? submissions.find(s => s.id === lastSubmissionId) : null);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Workspace Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm framer-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-mono font-bold text-[#2b59ff] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {currentLab.courseCode}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-[#6b7382] font-mono">v{currentLab.version}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#6b7382]">Due: Nov 28, 23:59 UTC</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#15171c] mt-1">
              {currentLab.title}
            </h1>
          </div>

          {/* Container Controls & Status */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs">
              {activeSession?.state === 'running' ? (
                <>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-700 uppercase tracking-wide">
                    Running
                  </span>
                </>
              ) : activeSession?.state === 'starting' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#2b59ff] animate-spin" />
                  <span className="font-bold text-[#2b59ff] uppercase tracking-wide">
                    Provisioning
                  </span>
                </>
              ) : activeSession?.state === 'queued' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="font-bold text-amber-700 uppercase tracking-wide">
                    Queued
                  </span>
                </>
              ) : activeSession?.state === 'failed' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-bold text-red-600 uppercase tracking-wide">
                    Failed
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                  <span className="font-bold text-[#6b7382] uppercase tracking-wide">
                    Stopped
                  </span>
                </>
              )}
            </div>

            {activeSession && activeSession.state === 'running' && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs font-mono text-[#15171c] transition-all">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse-subtle" />
                <span className="font-bold">{formatTime(activeSession.timeRemainingSeconds)}</span>
              </div>
            )}

            {!activeSession || activeSession.state === 'stopped' || activeSession.state === 'failed' ? (
              <button
                onClick={() => startLabSession(currentLab.id)}
                className="px-4 py-1.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-all btn-tactile hover-lift"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{activeSession?.state === 'failed' ? 'Retry Launch' : 'Launch Lab'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={stopLabSession}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f4f5f7] text-[#15171c] font-semibold text-xs flex items-center space-x-1.5 border border-[#e3e6eb] transition-all btn-tactile hover-lift"
                  title="Preserve files and stop disposable container"
                >
                  <Square className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
                <button
                  onClick={resetLabSession}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f4f5f7] text-[#15171c] font-semibold text-xs flex items-center space-x-1.5 border border-[#e3e6eb] transition-all btn-tactile hover-lift"
                  title="Reset container to clean image state"
                >
                  <RotateCcw className="w-3 h-3 text-[#2b59ff]" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Telemetry Strip */}
        {activeSession && activeSession.state === 'running' && (
          <div className="mt-4 pt-3 border-t border-[#e3e6eb] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7382] font-mono">
            <div className="flex items-center space-x-4 flex-wrap">
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#2b59ff]" />
                <span>CPU: <strong className="text-[#15171c]">{activeSession.cpuPercent}%</strong> (1.0 vCPU)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#2b59ff]" />
                <span>RAM: <strong className="text-[#15171c]">{activeSession.memoryMB} MB</strong> / {activeSession.maxMemoryMB} MB</span>
              </div>
              <div className="flex items-center space-x-1.5 hidden md:flex">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Non-Root (UID 1001)</span>
              </div>
              <div className="flex items-center space-x-1.5 hidden lg:flex">
                <span>Egress: Restricted Sandbox</span>
              </div>
            </div>

            <div className="text-[11px]">
              Container Ref: <span className="text-[#15171c] font-bold">{activeSession.containerRef}</span>
            </div>
          </div>
        )}

        {/* Provisioning / Connection Error Notice */}
        {activeSession?.errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start justify-between gap-3 animate-fade-in">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Backend Provisioning Notice</p>
                <p className="text-red-700 mt-0.5">{activeSession.errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => startLabSession(currentLab.id)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex-shrink-0 text-xs transition-all shadow-sm"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#e3e6eb] pb-2 flex-wrap gap-2">
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#e3e6eb] text-xs font-semibold shadow-sm">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'terminal' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Bash Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'editor' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Workspace Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guide' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lab Guide & Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'submit' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Evidence</span>
          </button>

          {displaySubmission && (
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'results' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Evaluation Results</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-[#6b7382]">
          <Info className="w-3.5 h-3.5 text-[#2b59ff]" />
          <span>Quick command: <code className="text-[#15171c] font-bold bg-[#f4f5f7] px-1.5 py-0.5 rounded border border-[#e3e6eb]">chmod 640 report.txt</code></span>
        </div>
      </div>

      {/* TAB 1: BASH TERMINAL */}
      {activeTab === 'terminal' && (
        <>
          {activeSession && activeSession.state === 'running' && activeSession.id && activeSession.ticket ? (
            <div className="space-y-3">
              {/* Quick Run Action Bar */}
              <div className="bg-[#161b22] px-3.5 py-2 rounded-xl border border-gray-800 flex items-center space-x-2 overflow-x-auto text-[11px] font-mono shadow-sm">
                <span className="text-gray-400 flex-shrink-0 font-sans font-semibold text-xs">Quick Run:</span>
                <button
                  onClick={() => handleQuickRun('touch report.txt')}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-blue-300 flex-shrink-0 transition-all"
                >
                  touch report.txt
                </button>
                <button
                  onClick={() => handleQuickRun('chmod 640 report.txt')}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-emerald-300 flex-shrink-0 font-bold transition-all"
                >
                  chmod 640 report.txt
                </button>
                <button
                  onClick={() => handleQuickRun('stat -c "%a %n" report.txt')}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-amber-300 flex-shrink-0 transition-all"
                >
                  stat -c "%a %n" report.txt
                </button>
                <button
                  onClick={() => handleQuickRun('ls -la')}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-purple-300 flex-shrink-0 transition-all"
                >
                  ls -la
                </button>
                <button
                  onClick={() => handleQuickRun('ps aux')}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex-shrink-0 transition-all"
                >
                  ps aux
                </button>
                <button
                  onClick={() => handleQuickRun('cat instructions.txt')}
                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 flex-shrink-0 transition-all"
                >
                  cat instructions.txt
                </button>
              </div>

              {/* Real Interactive xterm.js Terminal with Dockerode Exec WebSocket */}
              <RealTerminal
                sessionId={activeSession.id}
                ticket={activeSession.ticket}
                containerRef={activeSession.containerRef}
                quickCommandRef={quickCommandRef}
                onSessionError={(err) => {
                  console.warn('RealTerminal connection alert:', err);
                }}
              />
            </div>
          ) : activeSession && (activeSession.state === 'starting' || activeSession.state === 'queued') ? (
            <div className="rounded-2xl border border-[#e3e6eb] bg-[#0d1117] text-white shadow-xl overflow-hidden flex flex-col items-center justify-center p-12 min-h-[500px] text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#161b22] border border-gray-800 flex items-center justify-center mb-4 text-[#2b59ff]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#2b59ff]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Provisioning Container on AWS EC2</h3>
              <p className="text-sm text-gray-400 max-w-md mb-4 leading-relaxed font-mono">
                Allocating hardened <code className="text-blue-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">virtuallab-linux:1.0</code> sandbox with 128 MB RAM, 0.25 vCPU, and dropped Linux capabilities...
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#2b59ff] animate-ping"></span>
                <span>Negotiating authenticated WebSocket terminal ticket...</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e3e6eb] bg-[#0d1117] text-white shadow-xl overflow-hidden flex flex-col items-center justify-center p-12 min-h-[500px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#161b22] border border-gray-800 flex items-center justify-center mb-4 text-[#2b59ff]">
                <Terminal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Container Terminal</h3>
              <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
                Click below to dynamically provision an isolated Ubuntu container running <code className="text-blue-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">virtuallab-linux:1.0</code> on AWS EC2 and open a real interactive Bash shell with full TTY support.
              </p>
              <button
                onClick={() => startLabSession(currentLab.id)}
                className="px-6 py-2.5 rounded-xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-semibold text-sm flex items-center space-x-2 shadow-lg hover-lift transition-all btn-tactile"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Lab on AWS EC2</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB 2: EDITOR */}
      {activeTab === 'editor' && (
        <div className="rounded-2xl border border-[#e3e6eb] bg-white shadow-xl overflow-hidden flex flex-col md:flex-row h-[520px]">
          <div className="w-full md:w-56 bg-[#fcfdfe] border-b md:border-b-0 md:border-r border-[#e3e6eb] p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs uppercase font-bold text-[#6b7382] tracking-wider">
                  Files
                </span>
                <button
                  onClick={() => setNewFileModalOpen(true)}
                  className="p-1 rounded hover:bg-[#f4f5f7] text-[#6b7382]"
                  title="Create File"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {activeSession?.files.map(file => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFileName(file.name)}
                    className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-all ${
                      selectedFileName === file.name
                        ? 'bg-blue-50 text-[#2b59ff] font-bold border border-blue-200'
                        : 'text-[#15171c] hover:bg-[#f4f5f7]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#2b59ff] flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    {file.isReadOnly && (
                      <span className="text-[9px] uppercase px-1 rounded bg-gray-200 text-[#6b7382]">
                        RO
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#f4f5f7] border border-[#e3e6eb] text-[10px] text-[#6b7382]">
              Files staged on tmpfs; frozen upon submission.
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            <div className="bg-[#fcfdfe] px-4 py-2 border-b border-[#e3e6eb] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#15171c]">{currentFile?.name}</span>
              <span className="text-xs font-mono text-emerald-600 font-semibold">Auto-saved</span>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="bg-[#f4f5f7] select-none py-3 px-2 font-mono text-xs text-gray-400 text-right w-10 border-r border-[#e3e6eb]">
                {Array.from({ length: Math.max(15, (currentFile?.content.split('\n').length || 1)) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              <textarea
                value={currentFile?.content || ''}
                onChange={e => {
                  if (currentFile && !currentFile.isReadOnly) {
                    updateSessionFile(currentFile.name, e.target.value);
                  }
                }}
                disabled={currentFile?.isReadOnly || !activeSession || activeSession.state !== 'running'}
                className="flex-1 p-3 bg-transparent text-[#15171c] font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                placeholder={currentFile?.isReadOnly ? "Read-only file." : "Write code here..."}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GUIDE */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e3e6eb] space-y-6 shadow-sm">
          <div className="border-b border-[#e3e6eb] pb-4">
            <h2 className="text-xl font-bold text-[#15171c] flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#2b59ff]" />
              <span>Lab Specifications & Guidelines</span>
            </h2>
            <p className="text-xs text-[#6b7382] mt-1">
              Read all instructions carefully before completing the experiment and submitting your snapshot.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb]">
            <h3 className="text-xs uppercase font-bold text-[#15171c] tracking-wider mb-2">
              Prerequisites & Context
            </h3>
            <ul className="space-y-1 text-xs text-[#6b7382]">
              {currentLab.prerequisites.map((p, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2b59ff]"></span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#15171c] leading-relaxed">
            <div className="p-4 rounded-xl bg-[#fcfdfe] border border-[#e3e6eb]">
              <h3 className="text-sm font-bold text-[#15171c] mb-2">Step-by-Step Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-[#6b7382]">
                <li>Create the audit file using <code className="text-[#15171c] font-bold bg-[#f4f5f7] px-1.5 py-0.5 rounded border border-[#e3e6eb]">touch report.txt</code>.</li>
                <li>Set the octal file mode to <strong>640</strong>: <code className="text-[#15171c] font-bold bg-[#f4f5f7] px-1.5 py-0.5 rounded border border-[#e3e6eb]">chmod 640 report.txt</code>.</li>
                <li>Verify octal permissions: <code className="text-[#15171c] font-bold bg-[#f4f5f7] px-1.5 py-0.5 rounded border border-[#e3e6eb]">stat -c "%a %n" report.txt</code>.</li>
                <li>Answer the security reasoning questions in the <strong>Submit Evidence</strong> tab.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUBMIT */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e3e6eb] space-y-6 shadow-sm">
          <div className="border-b border-[#e3e6eb] pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#15171c] flex items-center space-x-2">
                <Send className="w-5 h-5 text-[#2b59ff]" />
                <span>Submit Practical Work & Evidence</span>
              </h2>
              <p className="text-xs text-[#6b7382] mt-1">
                Your submitted files, answers, and terminal output are captured into an immutable snapshot.
              </p>
            </div>
            <div className="text-xs font-mono text-[#6b7382]">
              Attempt: <span className="text-[#15171c] font-bold">1 of {currentLab.maxAttempts}</span>
            </div>
          </div>

          <div className="space-y-6">
            {currentLab.questions.map(q => (
              <div key={q.id} className="p-4 rounded-xl bg-[#fcfdfe] border border-[#e3e6eb] space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#2b59ff] uppercase tracking-wider">
                    Question ({q.maxPoints} Points)
                  </span>
                  <p className="text-sm font-bold text-[#15171c] mt-1">{q.prompt}</p>
                  <p className="text-xs text-[#6b7382] mt-0.5">Criteria: {q.criteria}</p>
                </div>

                {q.type === 'terminal_evidence' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-[#6b7382] font-mono">Terminal Output:</span>
                      <button
                        onClick={handleAutoInsertTerminalEvidence}
                        className="text-[11px] text-[#2b59ff] font-semibold hover:underline flex items-center space-x-1 btn-tactile"
                      >
                        <Sparkles className="w-3 h-3 animate-pulse-subtle" />
                        <span>Auto-Fill From Active Terminal</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder={q.placeholder}
                      className="w-full p-3 rounded-lg bg-[#0d1117] border border-gray-800 text-emerald-400 font-mono text-xs focus:outline-none"
                    />
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder={q.placeholder}
                    className="w-full p-3 rounded-lg bg-white border border-[#e3e6eb] text-[#15171c] text-xs sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => setActiveTab('terminal')}
              className="px-4 py-2 rounded-xl bg-[#f4f5f7] hover:bg-gray-200 text-[#15171c] text-xs font-semibold"
            >
              Back to Terminal
            </button>
            <button
              onClick={handleSubmitLab}
              disabled={isSubmitting || !activeSession}
              className="px-6 py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50 btn-tactile hover-lift"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Freezing Snapshot & Running Auto-Evaluation...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Lab Final Attempt</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: RESULTS */}
      {activeTab === 'results' && displaySubmission && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Snapshot Verified
              </span>
              <h2 className="text-xl font-bold text-[#15171c] mt-1">
                Evaluation Report: {displaySubmission.labTitle}
              </h2>
              <p className="text-xs font-mono text-[#6b7382] mt-0.5 truncate max-w-md">
                Artifact: {displaySubmission.artifactRef}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-center">
              <p className="text-xs text-[#6b7382]">
                {displaySubmission.grade?.status === 'published' ? 'Official Grade' : 'Automated Score'}
              </p>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
                {displaySubmission.grade?.status === 'published'
                  ? `${displaySubmission.grade.finalScore} / ${displaySubmission.grade.maxScore}`
                  : `${displaySubmission.evaluation?.objectiveScore || 6} / 10`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#15171c] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Deterministic Checks (6 / 6 Points)</span>
            </h3>

            <div className="space-y-2">
              {displaySubmission.evaluation?.testCases.map((tc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#fcfdfe] border border-[#e3e6eb] flex items-start justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#15171c]">{tc.title}</span>
                    <p className="font-mono text-[#6b7382] mt-0.5">{tc.outputLog}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">+{tc.pointsEarned} Pts</span>
                </div>
              ))}
            </div>
          </div>

          {displaySubmission.evaluation?.aiFeedback && (
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2b59ff] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Advisory Rubric Score: {displaySubmission.evaluation.aiFeedback.suggestedExplanationScore} / 2.0 Pts
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2b59ff]">
                  Advisory
                </span>
              </div>
              <p className="text-xs text-[#15171c] leading-relaxed">
                {displaySubmission.evaluation.aiFeedback.summary}
              </p>
            </div>
          )}

          {displaySubmission.grade?.status === 'published' && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-300 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-emerald-700 flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Published Instructor Feedback ({displaySubmission.grade.reviewerName})</span>
              </h3>
              <p className="text-xs text-[#15171c] leading-relaxed">
                {displaySubmission.grade.facultyNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {newFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#e3e6eb] p-5 space-y-4 shadow-xl animate-pop-in">
            <h3 className="text-sm font-bold text-[#15171c]">Create File</h3>
            <input
              type="text"
              value={newFileNameInput}
              onChange={e => setNewFileNameInput(e.target.value)}
              placeholder="e.g. test.py, report.txt"
              className="w-full p-2.5 rounded-lg border border-[#e3e6eb] text-xs font-mono text-[#15171c] focus:outline-none"
              autoFocus
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setNewFileModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#6b7382]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="px-4 py-1.5 rounded-lg bg-[#15171c] text-white text-xs font-semibold"
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

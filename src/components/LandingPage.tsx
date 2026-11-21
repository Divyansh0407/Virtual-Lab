import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Terminal,
  Cpu,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Server,
  Play,
  Sparkles,
  Lock,
  Code2,
  BookOpen,
  Users,
  Check,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Laptop,
  LogIn
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    setActiveTab,
    switchUser,
    startLabSession,
    isAuthenticated,
    setAuthModalOpen,
    currentUser
  } = useApp();

  // Active tab in "How VirtualLab Works"
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'author' | 'launch' | 'code' | 'evaluate'>('launch');

  // Mini live interactive terminal simulator on hero
  const [miniCmd, setMiniCmd] = useState('');
  const [miniLogs, setMiniLogs] = useState<string[]>([
    'VirtualLab Cloud Engine v2.4 (Simulated Rootless Container)',
    'student@vl-worker-demo:~/workspace$ ls -la',
    '-rw-r--r-- 1 student student  184 Nov 21 12:00 instructions.txt',
    '-rw-r----- 1 student student  142 Nov 21 12:20 report.txt (Mode 640 verified)'
  ]);

  const handleMiniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!miniCmd.trim()) return;

    const trimmed = miniCmd.trim();
    let res = '';

    if (trimmed.includes('chmod 640')) {
      res = 'Permissions updated to 640 (-rw-r-----). User: rw-, Group: r--, Others: ---';
    } else if (trimmed.includes('stat')) {
      res = '640 report.txt (Mode octal 0640 verified)';
    } else if (trimmed === 'ls' || trimmed === 'ls -la') {
      res = '-rw-r----- 1 student student 142 Nov 21 12:20 report.txt\n-rw-r--r-- 1 student student 184 Nov 21 12:00 instructions.txt';
    } else if (trimmed === 'whoami') {
      res = 'student (UID 1001, Non-Root)';
    } else if (trimmed.includes('pytest')) {
      res = '================ 2 passed in 0.18s ================\n[PASS] test_permissions_mode\n[PASS] test_file_presence';
    } else {
      res = `Executed: ${trimmed} [Exit Code 0]`;
    }

    setMiniLogs(prev => [...prev, `student@vl-worker-demo:~/workspace$ ${trimmed}`, res]);
    setMiniCmd('');
  };

  // FAQ Accordion open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do students need Docker or Linux installed on their personal laptops?',
      a: 'No. Students only need a modern web browser. Every lab session is provisioned on dedicated campus server infrastructure, and students interact directly through our low-latency browser terminal and code editor.'
    },
    {
      q: 'How does VirtualLab prevent container escape and privilege escalation?',
      a: 'Workloads execute in unprivileged rootless containers under UID 1001. All unnecessary Linux capabilities are dropped, root filesystems are mounted read-only, cgroup v2 resource limits enforce CPU/memory caps, and strict iptables firewall rules prevent egress to campus LAN or cloud metadata endpoints.'
    },
    {
      q: 'What happens if a student container crashes or times out?',
      a: 'The container is treated as a disposable execution environment. Work in progress is staged on persistent volumes, and submissions freeze immutable SHA-256 snapshots into PostgreSQL storage so academic records can never be lost.'
    },
    {
      q: 'Can instructors override AI-suggested scores and feedback?',
      a: 'Yes, always. AI feedback is strictly advisory and evaluated against an explicit rubric. Instructors retain 100% authority to review evidence, adjust marks with interactive sliders, add personal commentary, and officially publish grades.'
    }
  ];

  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Floating Decorative Badges matching Framer polish */}
        <div className="hidden xl:flex absolute -left-16 top-16 animate-float items-center space-x-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e3e6eb] shadow-framer text-xs font-semibold text-[#15171c] z-10 hover-lift">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping-slow"></div>
          <span>Rootless UID 1001 • cgroup v2</span>
        </div>

        <div className="hidden xl:flex absolute -right-16 top-24 animate-float-gentle items-center space-x-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#e3e6eb] shadow-framer text-xs font-semibold text-[#15171c] z-10 hover-lift">
          <Sparkles className="w-4 h-4 text-[#2b59ff]" />
          <span>AI Advisory Rubrics Active</span>
        </div>

        {/* Announcement Pill matching Ondrel with hover scale */}
        <div
          onClick={() => setActiveTab('architecture')}
          className="group inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-[#e3e6eb] text-xs font-semibold text-[#15171c] shadow-sm hover:border-[#2b59ff] hover:shadow-glow-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in-down"
        >
          <span className="w-2 h-2 rounded-full bg-[#2b59ff] animate-ping-slow"></span>
          <span>New VirtualLab 2.4 drafts rubric feedback and verifies container isolation</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#2b59ff] transition-transform duration-200 group-hover:translate-x-1" />
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-[#15171c] tracking-tight leading-[1.1] animate-fade-in">
          The cloud laboratory platform for universities that ship.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#6b7382] max-w-2xl mx-auto leading-relaxed animate-fade-in">
          Practical computing labs, isolated container workspaces and reproducible evaluation in one calm platform. Everyone learns by doing, and nobody has to debug local setup.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setAuthModalOpen('signup')}
                className="group w-full sm:w-auto px-6 py-3 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 btn-tactile hover-lift flex items-center justify-center space-x-2"
              >
                <span>Create Student / Faculty Account</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setAuthModalOpen('login')}
                className="group w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c] font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 btn-tactile hover-lift flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4 text-[#2b59ff] transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Sign In with University ID</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  if (currentUser.role === 'student') {
                    startLabSession('lab-linux-perm');
                  } else if (currentUser.role === 'faculty') {
                    setActiveTab('authoring');
                  } else {
                    setActiveTab('admin');
                  }
                }}
                className="group w-full sm:w-auto px-6 py-3 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs sm:text-sm shadow-md transition-all duration-200 btn-tactile hover-lift flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current transition-transform duration-200 group-hover:scale-110" />
                <span>
                  {currentUser.role === 'student' ? 'Start interactive lab' : currentUser.role === 'faculty' ? 'Author New Lab' : 'Fleet Console'}
                </span>
              </button>

              <button
                onClick={() => {
                  if (currentUser.role === 'student') {
                    setActiveTab('dashboard');
                  } else if (currentUser.role === 'faculty') {
                    setActiveTab('grading');
                  } else {
                    setActiveTab('admin');
                  }
                }}
                className="group w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c] font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 btn-tactile hover-lift flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4 text-amber-500 transition-transform duration-200 group-hover:rotate-12" />
                <span>Open {currentUser.role === 'student' ? 'My Practicals' : currentUser.role === 'faculty' ? 'Grading Studio' : 'Admin'}</span>
              </button>
            </>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#6b7382]">
            <span className="flex items-center space-x-1.5 transition-transform hover:scale-105 duration-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dedicated student workspace</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5 transition-transform hover:scale-105 duration-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Non-root container isolation</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5 transition-transform hover:scale-105 duration-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Academic ID & credentials login</span>
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#6b7382]">
            Authenticated as <span className="font-bold text-[#15171c]">{currentUser.name}</span> ({currentUser.role}) · <button onClick={() => setAuthModalOpen('login')} className="text-[#2b59ff] hover:underline font-semibold">Switch Account</button>
          </p>
        )}

        {/* 2. MOCK APP CANVAS (Interactive Preview) */}
        <div className="mt-12 text-left rounded-2xl bg-white border border-[#e3e6eb] shadow-xl overflow-hidden">
          {/* Browser Chrome Header */}
          <div className="bg-[#f4f5f7] px-4 py-3 border-b border-[#e3e6eb] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="bg-white px-3 py-1 rounded-md border border-[#e3e6eb] text-[11px] font-mono text-[#6b7382] flex items-center space-x-2">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>app.virtuallab.edu / CS303 / Lab 04 - Linux File Permissions</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#6b7382]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline">14 Containers Healthy</span>
            </div>
          </div>

          {/* Canvas Body: Mock Sidebar + Main Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Sidebar Mock */}
            <div className="hidden lg:block lg:col-span-3 bg-[#fcfdfe] border-r border-[#e3e6eb] p-4 space-y-4 text-xs font-medium">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#f4f5f7] border border-[#e3e6eb] text-[#6b7382]">
                <span>Search labs & students</span>
                <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#e3e6eb]">⌘K</kbd>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6b7382] px-2 tracking-wider">Navigation</div>
                <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#2b59ff] font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Active Workspace</span>
                </div>
                <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[#6b7382] hover:bg-[#f4f5f7]">
                  <Award className="w-3.5 h-3.5" />
                  <span>Evaluation & Rubrics</span>
                </div>
                <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[#6b7382] hover:bg-[#f4f5f7]">
                  <Server className="w-3.5 h-3.5" />
                  <span>Cluster Fleet Monitor</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e3e6eb] space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#6b7382] px-2 tracking-wider">Active Cohort</div>
                <div className="p-2 rounded-xl bg-white border border-[#e3e6eb] space-y-1">
                  <p className="font-bold text-[#15171c]">CS303 Operating Systems</p>
                  <p className="text-[11px] text-[#6b7382]">48 students enrolled</p>
                  <div className="w-full bg-[#f4f5f7] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-[#2b59ff] h-full w-[68%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Preview */}
            <div className="lg:col-span-9 p-4 sm:p-6 bg-white space-y-4 flex flex-col justify-between">
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e3e6eb]">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono font-bold text-[#2b59ff] bg-blue-50 px-2 py-0.5 rounded">
                      CS303
                    </span>
                    <span className="text-[#6b7382]">Lab 04: Linux File Permissions (Mode 640)</span>
                  </div>
                  <h3 className="text-base font-bold text-[#15171c] mt-1">
                    Student Divyansh Sharma · Workspace vl-cont-divyansh-8821
                  </h3>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Container Running</span>
                  </span>
                  <span className="font-mono text-[#6b7382]">88:24 remaining</span>
                </div>
              </div>

              {/* Terminal Box (Interactive!) */}
              <div className="rounded-xl bg-[#0d1117] text-white p-4 font-mono text-xs shadow-inner space-y-1.5 border border-gray-800">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-[11px] text-gray-400">
                  <span>student@vl-worker-demo:~/workspace (bash 80x24)</span>
                  <span className="text-emerald-400">Try running commands below:</span>
                </div>

                <div className="space-y-1 py-1 h-32 overflow-y-auto">
                  {miniLogs.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith('student@')
                          ? 'text-emerald-400 font-semibold'
                          : line.includes('PASS') || line.includes('verified')
                            ? 'text-emerald-300'
                            : 'text-gray-300'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleMiniSubmit} className="pt-2 border-t border-gray-800 flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">$</span>
                  <input
                    type="text"
                    value={miniCmd}
                    onChange={e => setMiniCmd(e.target.value)}
                    placeholder="Type 'chmod 640 report.txt', 'stat report.txt', 'pytest'..."
                    className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-600 font-mono"
                  />
                  <button
                    type="submit"
                    className="text-xs text-white bg-[#2b59ff] hover:bg-blue-600 font-bold px-3 py-1 rounded-lg btn-tactile hover-lift transition-all shadow-sm"
                  >
                    Run
                  </button>
                </form>
              </div>

              {/* Evaluation Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#fcfdfe] border border-[#e3e6eb] space-y-1.5 hover-lift transition-all duration-200">
                  <div className="flex items-center justify-between font-semibold text-[#15171c]">
                    <span className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse-subtle" />
                      <span>Deterministic Automated Tests</span>
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">6 / 6 Pts</span>
                  </div>
                  <p className="text-[11px] text-[#6b7382]">
                    ✓ File presence /home/student/workspace/report.txt verified<br />
                    ✓ Permissions 640 (-rw-r-----) matches rubric specification
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1.5 hover-lift transition-all duration-200">
                  <div className="flex items-center justify-between font-semibold text-[#15171c]">
                    <span className="flex items-center space-x-1.5 text-[#2b59ff]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>AI Advisory Rubric Score</span>
                    </span>
                    <span className="font-mono text-[#2b59ff] font-bold">2.0 / 2.0 Pts</span>
                  </div>
                  <p className="text-[11px] text-[#6b7382]">
                    Accurate explanation of owner (6), group (4), and others (0). Principle of least privilege properly articulated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF LOGO STRIP (Infinite Animated Marquee) */}
      <section className="text-center space-y-4 max-w-5xl mx-auto overflow-hidden py-4">
        <p className="text-xs uppercase font-bold tracking-wider text-[#6b7382]">
          Trusted by computer science faculty & 4,000+ engineering students
        </p>

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex space-x-12 animate-marquee whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity duration-300 py-2">
            {[
              'STANFORD CS', 'MIT EECS', 'BERKELEY', 'CMU CS', 'OXFORD COMP', 'CAMBRIDGE',
              'STANFORD CS', 'MIT EECS', 'BERKELEY', 'CMU CS', 'OXFORD COMP', 'CAMBRIDGE'
            ].map((name, i) => (
              <span key={i} className="font-extrabold text-xs tracking-widest text-[#15171c] px-4 hover:text-[#2b59ff] transition-colors duration-200 cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW VIRTUALLAB WORKS (4-STEP BENTO WORKFLOW) */}
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs uppercase font-bold text-[#2b59ff] tracking-wider">
            Practical Lifecycle
          </div>
          <h2 className="text-3xl font-extrabold text-[#15171c] tracking-tight">
            One workspace for the whole practical.
          </h2>
          <p className="text-sm text-[#6b7382]">
            Faculty author labs, containers spin up in seconds, code runs in the browser, and submissions freeze into immutable records.
          </p>
        </div>

        {/* 4-Tab Switcher matching Ondrel */}
        <div className="flex items-center justify-center space-x-2 border-b border-[#e3e6eb] pb-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'author', label: '1. Author practicals' },
            { id: 'launch', label: '2. Launch isolated containers' },
            { id: 'code', label: '3. Interactive browser shell' },
            { id: 'evaluate', label: '4. Automated & AI evaluation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveWorkflowTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 btn-tactile ${activeWorkflowTab === tab.id
                ? 'bg-[#15171c] text-white shadow-md scale-[1.02]'
                : 'bg-white text-[#6b7382] border border-[#e3e6eb] hover:text-[#15171c] hover:border-gray-400'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Bento Card content */}
        <div key={activeWorkflowTab} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 sm:p-12 rounded-3xl border border-[#e3e6eb] shadow-sm animate-fade-in framer-card">
          {activeWorkflowTab === 'author' && (
            <>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2b59ff]">
                  Faculty Workflow
                </span>
                <h3 className="text-2xl font-bold text-[#15171c]">
                  Author repeatable practicals without building bespoke servers.
                </h3>
                <p className="text-sm text-[#6b7382] leading-relaxed">
                  Select from administrator-approved environment images (Ubuntu, Python 3.11, GCC 12, Jupyter). Upload starter files, define questions and rubric weights, and write automated test assertions in standard Bash or Pytest.
                </p>
                <ul className="space-y-2 text-xs text-[#15171c]">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#2b59ff]" />
                    <span>Hardened template allowlist prevents arbitrary image vulnerabilities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#2b59ff]" />
                    <span>Automated test scripts run in a separate controlled worker</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#f4f5f7] border border-[#e3e6eb] font-mono text-xs space-y-2">
                <p className="text-[#6b7382]"># Verification Script: Mode 640</p>
                <div className="p-3 bg-white rounded-lg border border-[#e3e6eb] text-[#15171c]">
                  PERMS=$(stat -c "%a" /home/student/workspace/report.txt)<br />
                  if [ "$PERMS" == "640" ]; then<br />
                  &nbsp;&nbsp;echo "PASS: 6/6 points awarded"<br />
                  &nbsp;&nbsp;exit 0<br />
                  fi
                </div>
              </div>
            </>
          )}

          {activeWorkflowTab === 'launch' && (
            <>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Infrastructure Sandbox
                </span>
                <h3 className="text-2xl font-bold text-[#15171c]">
                  Disposable, isolated rootless containers provisioned in seconds.
                </h3>
                <p className="text-sm text-[#6b7382] leading-relaxed">
                  Each student receives a dedicated container with strict CPU quotas (1.0 vCPU), memory ceilings (512 MB), non-root execution (UID 1001), and blocked network egress to campus LAN or cloud metadata.
                </p>
                <ul className="space-y-2 text-xs text-[#15171c]">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>No student-to-student workspace cross-contamination</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Host Docker socket strictly protected and hidden from browser</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#f4f5f7] border border-[#e3e6eb] font-mono text-xs space-y-3">
                <div className="flex justify-between text-[#6b7382]">
                  <span>CPU Quota</span>
                  <span className="font-bold text-[#15171c]">1.0 vCPU (cgroups v2)</span>
                </div>
                <div className="flex justify-between text-[#6b7382]">
                  <span>RAM Limit</span>
                  <span className="font-bold text-[#15171c]">512 MB ceiling</span>
                </div>
                <div className="flex justify-between text-[#6b7382]">
                  <span>User Isolation</span>
                  <span className="font-bold text-emerald-600">student (UID 1001)</span>
                </div>
                <div className="flex justify-between text-[#6b7382]">
                  <span>Firewall</span>
                  <span className="font-bold text-[#15171c]">Egress strictly blocked</span>
                </div>
              </div>
            </>
          )}

          {activeWorkflowTab === 'code' && (
            <>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2b59ff]">
                  Student Experience
                </span>
                <h3 className="text-2xl font-bold text-[#15171c]">
                  Real interactive bash shell & code editor directly in the browser.
                </h3>
                <p className="text-sm text-[#6b7382] leading-relaxed">
                  Students don't suffer through broken local environments, incompatible PATH variables, or OS differences. Full POSIX permissions, GNU coreutils, Python runners, and syntax-highlighted editing work out of the box.
                </p>
                <ul className="space-y-2 text-xs text-[#15171c]">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#2b59ff]" />
                    <span>Interactive command history and quick-action shortcuts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#2b59ff]" />
                    <span>Session countdown timer with automatic graceful shutdown</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-2xl bg-[#0d1117] text-white font-mono text-xs space-y-1">
                <p className="text-gray-400">student@vl-worker:~/workspace$ chmod 640 report.txt</p>
                <p className="text-gray-400">student@vl-worker:~/workspace$ stat -c "%a %n" report.txt</p>
                <p className="text-emerald-400 font-bold">640 report.txt</p>
                <p className="text-gray-400">student@vl-worker:~/workspace$ ls -la</p>
                <p className="text-gray-300">-rw-r----- 1 student student 142 report.txt</p>
              </div>
            </>
          )}

          {activeWorkflowTab === 'evaluate' && (
            <>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Hybrid Evaluation
                </span>
                <h3 className="text-2xl font-bold text-[#15171c]">
                  Immutable snapshots, deterministic checks, and advisory AI rubric scoring.
                </h3>
                <p className="text-sm text-[#6b7382] leading-relaxed">
                  Submissions generate an immutable SHA-256 snapshot stored outside disposable containers. The evaluation pipeline executes trusted test suites (6 pts), while an AI assistant provides advisory formative suggestions on written reasoning (2 pts) for faculty approval.
                </p>
                <ul className="space-y-2 text-xs text-[#15171c]">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Faculty retain 100% authority to adjust marks before publishing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>All submission and grade changes logged in cryptographic audit trails</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#e3e6eb] flex items-center justify-between">
                  <span className="font-semibold text-[#15171c]">Automated Deterministic Checks</span>
                  <span className="font-mono font-bold text-emerald-600">6 / 6 Pts</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e3e6eb] flex items-center justify-between">
                  <span className="font-semibold text-[#15171c]">Written Security Explanation</span>
                  <span className="font-mono font-bold text-[#2b59ff]">2 / 2 Pts</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e3e6eb] flex items-center justify-between">
                  <span className="font-semibold text-[#15171c]">Terminal Output Evidence</span>
                  <span className="font-mono font-bold text-[#15171c]">2 / 2 Pts</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. MEASURABLE SUCCESS METRICS (Ondrel 4-stat block) */}
      <section className="bg-white rounded-3xl border border-[#e3e6eb] p-8 sm:p-12 max-w-6xl mx-auto shadow-sm framer-card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#e3e6eb]">
          <div className="pt-4 md:pt-0 p-3 rounded-2xl hover:bg-[#f4f5f7]/80 transition-all duration-200 hover-lift">
            <p className="text-4xl sm:text-5xl font-black text-[#15171c] tracking-tight">4,000+</p>
            <p className="text-xs text-[#6b7382] font-semibold mt-2">Active student lab sessions</p>
          </div>
          <div className="pt-4 md:pt-0 p-3 rounded-2xl hover:bg-[#f4f5f7]/80 transition-all duration-200 hover-lift">
            <p className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight">0 hrs</p>
            <p className="text-xs text-[#6b7382] font-semibold mt-2">Lost debugging broken local setups</p>
          </div>
          <div className="pt-4 md:pt-0 p-3 rounded-2xl hover:bg-[#f4f5f7]/80 transition-all duration-200 hover-lift">
            <p className="text-4xl sm:text-5xl font-black text-[#2b59ff] tracking-tight">2.4×</p>
            <p className="text-xs text-[#6b7382] font-semibold mt-2">Faster submission-to-grade turnaround</p>
          </div>
          <div className="pt-4 md:pt-0 p-3 rounded-2xl hover:bg-[#f4f5f7]/80 transition-all duration-200 hover-lift">
            <p className="text-4xl sm:text-5xl font-black text-[#15171c] tracking-tight">99.99%</p>
            <p className="text-xs text-[#6b7382] font-semibold mt-2">Container isolation SLA uptime</p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase font-bold text-[#2b59ff] tracking-wider">
            Academic Community
          </div>
          <h2 className="text-3xl font-extrabold text-[#15171c] tracking-tight">
            Loved by professors and students alike.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e3e6eb] shadow-sm space-y-4 framer-card hover-lift">
            <p className="text-xs sm:text-sm text-[#15171c] leading-relaxed italic">
              "We used to lose the first two weeks of our Operating Systems practicals resolving Mac M1/M2 compiler mismatches and broken WSL installations. With VirtualLab, every student starts in a standardized, reproducible Ubuntu container in five seconds."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-[#e3e6eb]">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80"
                alt="Garvit Dohare"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100"
              />
              <div>
                <p className="text-xs font-bold text-[#15171c]">Garvit Dohare</p>
                <p className="text-[11px] text-[#6b7382]">Professor of Systems & OS</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e3e6eb] shadow-sm space-y-4 framer-card hover-lift">
            <p className="text-xs sm:text-sm text-[#15171c] leading-relaxed italic">
              "Having the automated check run immediately after I set my octal permissions gave me real confidence that my file state was correct before submitting. Plus the browser terminal feels just like native Bash."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-[#e3e6eb]">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80"
                alt="Divyansh Sharma"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100"
              />
              <div>
                <p className="text-xs font-bold text-[#15171c]">Divyansh Sharma</p>
                <p className="text-[11px] text-[#6b7382]">Computer Science Senior</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e3e6eb] shadow-sm space-y-4 framer-card hover-lift">
            <p className="text-xs sm:text-sm text-[#15171c] leading-relaxed italic">
              "From an infrastructure perspective, keeping untrusted student workloads completely isolated from application databases while enforcing cgroup limits eliminated server crashes during peak submission nights."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-[#e3e6eb]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
                alt="Akshita"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
              />
              <div>
                <p className="text-xs font-bold text-[#15171c]">Akshita</p>
                <p className="text-[11px] text-[#6b7382]">Campus Cloud Architect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING & INSTITUTIONAL DEPLOYMENT */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase font-bold text-[#2b59ff] tracking-wider">
            Institutional Deployment
          </div>
          <h2 className="text-3xl font-extrabold text-[#15171c] tracking-tight">
            Free for small cohorts. Scalable for whole campuses.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e3e6eb] shadow-sm flex flex-col justify-between framer-card hover-lift">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#15171c]">Academic Free</h3>
                <p className="text-xs text-[#6b7382] mt-0.5">For self-hosted prototypes & small classes.</p>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#15171c]">$0 <span className="text-xs text-[#6b7382] font-normal">forever</span></div>
              <ul className="space-y-2 text-xs text-[#15171c]">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Up to 50 concurrent student containers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Approved Linux & Python templates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Deterministic automated test runner</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalOpen('signup');
                } else {
                  startLabSession('lab-linux-perm');
                }
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#f4f5f7] hover:bg-gray-200 text-[#15171c] font-semibold text-xs transition-all duration-200 btn-tactile hover-lift"
            >
              Get started free
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-[#15171c] shadow-lg flex flex-col justify-between relative framer-card hover-lift hover:border-[#2b59ff] transition-all duration-300">
            <div className="absolute -top-3 right-6 bg-[#15171c] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md animate-pulse-subtle">
              Recommended
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#15171c]">Department Cloud</h3>
                <p className="text-xs text-[#6b7382] mt-0.5">For university computing departments.</p>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#15171c]">$10 <span className="text-xs text-[#6b7382] font-normal">per student / semester</span></div>
              <ul className="space-y-2 text-xs text-[#15171c]">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Unlimited practicals and student sessions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>AI rubric advisory grading assistant</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Live faculty proctor & session controls</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Multi-container C/C++, Java & Jupyter</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalOpen('signup');
                } else {
                  setActiveTab(currentUser.role === 'student' ? 'dashboard' : 'grading');
                }
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs transition-all duration-200 btn-tactile hover-lift shadow-md"
            >
              Start departmental pilot
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e3e6eb] shadow-sm flex flex-col justify-between framer-card hover-lift">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#15171c]">Campus Enterprise</h3>
                <p className="text-xs text-[#6b7382] mt-0.5">For institution-wide deployment.</p>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#15171c]">Custom</div>
              <ul className="space-y-2 text-xs text-[#15171c]">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Single Sign-On (SAML / Azure AD)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Canvas / Blackboard LMS grade sync</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>Dedicated isolated VM host cluster</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#2b59ff]" />
                  <span>99.99% SLA & 24/7 technical support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setActiveTab('architecture')}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#f4f5f7] hover:bg-gray-200 text-[#15171c] font-semibold text-xs transition-all duration-200 btn-tactile hover-lift"
            >
              Contact solutions team
            </button>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION (Answers before you ask) */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs uppercase font-bold text-[#2b59ff] tracking-wider">
            Questions
          </div>
          <h2 className="text-3xl font-extrabold text-[#15171c] tracking-tight">
            Answers before you ask.
          </h2>
          <p className="text-sm text-[#6b7382]">
            Everything you need to know about the architecture, security isolation, and grading rules.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#e3e6eb] overflow-hidden transition-all duration-200 shadow-sm framer-card"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 btn-tactile"
              >
                <span className="text-sm font-bold text-[#15171c]">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6b7382] transition-transform duration-300 ease-out ${openFaq === idx ? 'rotate-180 text-[#2b59ff]' : ''
                    }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6b7382] leading-relaxed border-t border-[#e3e6eb] animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. BOTTOM GIANT WORDMARK & CTA (Matching Ondrel footer) */}
      <section className="rounded-3xl bg-[#15171c] text-white p-8 sm:p-16 text-center space-y-6 overflow-hidden relative shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white animate-fade-in">
            Ready to upgrade your university's practicals?
          </h2>
          <p className="text-sm text-gray-400">
            Join the students and professors running reproducible, browser-accessible computer science laboratories on VirtualLab.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalOpen('login');
                } else {
                  startLabSession('lab-linux-perm');
                }
              }}
              className="px-6 py-3 rounded-xl bg-white text-[#15171c] font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all duration-200 shadow-md btn-tactile hover-lift"
            >
              {isAuthenticated ? 'Launch Interactive Lab' : 'Sign In to Interactive Lab'}
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="px-6 py-3 rounded-xl bg-gray-800 text-white font-semibold text-xs sm:text-sm border border-gray-700 hover:bg-gray-700 transition-all duration-200 btn-tactile hover-lift"
            >
              Read Architecture Blueprint
            </button>
          </div>
        </div>

        {/* Huge Stylized Background Wordmark with gentle float */}
        <div className="pt-12 select-none pointer-events-none opacity-15 font-black text-6xl sm:text-9xl tracking-tighter text-white animate-float-gentle">
          VirtualLab
        </div>
      </section>
    </div>
  );
};

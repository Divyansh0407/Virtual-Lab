import React, { useState } from 'react';
import {
  Layers,
  Server,
  Terminal,
  Database,
  Cpu,
  Shield,
  ArrowDown,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Box,
  FileCheck,
  Lock
} from 'lucide-react';

export const ArchitectureExplorer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('orchestrator');

  const components = [
    {
      id: 'frontend',
      name: 'Student & Faculty Web UI',
      tech: 'React 18 + TypeScript + Vite + Tailwind CSS',
      role: 'Renders the responsive browser interface, interactive Bash shell emulator, code editor, and grading studio.',
      boundary: 'Never touches Docker credentials or privileged host system APIs. Communicates solely over HTTPS/WSS to Web API.',
      security: 'Session tokens, sanitized markdown rendering, client-side sandboxing.',
      color: 'border-blue-300 bg-blue-50 text-[#2b59ff]'
    },
    {
      id: 'webapi',
      name: 'Web Application API',
      tech: 'Node.js + Express + TypeScript',
      role: 'Manages user identities, role permissions (Student, Faculty, Admin), lab course catalog, assignments, and grade records.',
      boundary: 'Validates permissions server-side before dispatching provisioning or evaluation jobs to background services.',
      security: 'JWT authentication, RBAC, input validation, audit event streaming.',
      color: 'border-indigo-300 bg-indigo-50 text-indigo-700'
    },
    {
      id: 'gateway',
      name: 'Lab Gateway & Reverse Proxy',
      tech: 'WebSocket Reverse Proxy / Token Authenticator',
      role: 'Routes authenticated students exclusively to their own dedicated container port/pty stream.',
      boundary: 'Verifies short-lived session token; prevents cross-student container access.',
      security: 'Subnet isolation, connection timeouts, TLS termination.',
      color: 'border-teal-300 bg-teal-50 text-teal-700'
    },
    {
      id: 'orchestrator',
      name: 'Lab Container Orchestrator',
      tech: 'Python 3.11 + Docker SDK / Controlled API',
      role: 'Provisions, monitors, starts, stops, and cleans up student container sessions based on approved templates.',
      boundary: 'Accepts only administrator-whitelisted images; never runs student-supplied Dockerfiles.',
      security: 'Enforces cgroup v2 quotas (CPU, RAM, PIDs), non-root UID 1001, drop ALL capabilities except required POSIX flags.',
      color: 'border-emerald-300 bg-emerald-50 text-emerald-700'
    },
    {
      id: 'runtime',
      name: 'Dedicated Container Host VM',
      tech: 'Ubuntu 22.04 LTS Kernel 6.2 + Rootless Docker Engine',
      role: 'Dedicated Linux virtual machine running untrusted student workloads separated from production databases.',
      boundary: 'Docker socket protected from container escape; ephemeral workspace layers pruned on container stop.',
      security: 'Kernel isolation, read-only rootfs, iptables egress firewall blocking LAN & cloud metadata (169.254.169.254).',
      color: 'border-amber-300 bg-amber-50 text-amber-700'
    },
    {
      id: 'evaluation',
      name: 'Submission & Evaluation Service',
      tech: 'Independent Test Runner + AI Rubric Adapter',
      role: 'Freezes immutable SHA-256 snapshots, runs deterministic verification scripts, and generates AI-assisted feedback.',
      boundary: 'Runs in controlled evaluation environment separate from student live container.',
      security: 'AI score treated as purely advisory; final grade publication strictly requires faculty review.',
      color: 'border-purple-300 bg-purple-50 text-purple-700'
    },
    {
      id: 'database',
      name: 'PostgreSQL & Persistent Artifact Store',
      tech: 'PostgreSQL 15 + Prisma ORM + Object Storage',
      role: 'Stores relational entities (users, courses, labs, submissions, grades) and sealed file artifacts outside disposable containers.',
      boundary: 'Preserves academic records even when student containers are deleted or reset.',
      security: 'Encrypted at rest, parameterized queries, strict student tenant isolation.',
      color: 'border-sky-300 bg-sky-50 text-sky-700'
    }
  ];

  const current = components.find(c => c.id === selectedNode) || components[3];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm framer-card">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#2b59ff]" />
          <h1 className="text-xl font-bold text-[#15171c]">System Architecture & Component Boundaries</h1>
        </div>
        <p className="text-xs text-[#6b7382] mt-1">
          Interactive blueprint corresponding to Section 05 & 06 of the proposal. Click on any component to inspect its responsibilities, security boundaries, and technology rationale.
        </p>
      </div>

      {/* Interactive Visual Schematic */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm framer-card">
        <h2 className="text-xs uppercase font-bold text-[#6b7382] tracking-wider mb-6 text-center">
          Interactive Topology (Click to Inspect)
        </h2>

        {/* Tier 1: Browser */}
        <div className="max-w-md mx-auto">
          <div
            onClick={() => setSelectedNode('frontend')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'frontend' ? 'ring-2 ring-[#2b59ff] border-blue-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-[#2b59ff] tracking-wider">Client Presentation</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">Student / Faculty Browser (React + Tailwind)</h3>
            <p className="text-[11px] text-[#6b7382] font-mono mt-0.5">HTTPS & WebSocket</p>
          </div>
        </div>

        <div className="flex justify-center my-3 text-gray-400">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* Tier 2: Web API & Gateway */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div
            onClick={() => setSelectedNode('webapi')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'webapi' ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-indigo-700 tracking-wider">Control Plane</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">Web Application API (Node.js)</h3>
            <p className="text-[11px] text-[#6b7382]">Auth, RBAC, Labs, Submissions</p>
          </div>

          <div
            onClick={() => setSelectedNode('gateway')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'gateway' ? 'ring-2 ring-teal-500 border-teal-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-teal-700 tracking-wider">Data Plane</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">Lab Gateway (Reverse Proxy)</h3>
            <p className="text-[11px] text-[#6b7382]">Authenticated Terminal Stream</p>
          </div>
        </div>

        <div className="flex justify-center my-3 text-gray-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Tier 3: Orchestrator & Evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div
            onClick={() => setSelectedNode('orchestrator')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'orchestrator' ? 'ring-2 ring-emerald-500 border-emerald-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-emerald-700 tracking-wider">Lifecycle Engine</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">Lab Orchestrator (Python)</h3>
            <p className="text-[11px] text-[#6b7382]">Docker SDK, Quotas, Cleanups</p>
          </div>

          <div
            onClick={() => setSelectedNode('evaluation')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'evaluation' ? 'ring-2 ring-purple-500 border-purple-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-purple-700 tracking-wider">Evaluation Engine</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">Submission & Evaluation Service</h3>
            <p className="text-[11px] text-[#6b7382]">Automated Tests + AI Rubric Adapter</p>
          </div>
        </div>

        <div className="flex justify-center my-3 text-gray-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Tier 4: Runtime & Database */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div
            onClick={() => setSelectedNode('runtime')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'runtime' ? 'ring-2 ring-amber-500 border-amber-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-amber-700 tracking-wider">Execution Sandbox</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">Dedicated Linux VM Host</h3>
            <p className="text-[11px] text-[#6b7382]">Non-Root Containers (Student A, B, C)</p>
          </div>

          <div
            onClick={() => setSelectedNode('database')}
            className={`p-4 rounded-2xl cursor-pointer border text-center transition-all shadow-sm framer-card hover-lift ${
              selectedNode === 'database' ? 'ring-2 ring-sky-500 border-sky-400' : 'border-[#e3e6eb] hover:border-gray-400'
            } bg-[#fcfdfe]`}
          >
            <p className="text-xs uppercase font-bold text-sky-700 tracking-wider">Persistent Records</p>
            <h3 className="text-sm font-bold text-[#15171c] mt-1">PostgreSQL & Storage</h3>
            <p className="text-[11px] text-[#6b7382]">Users, Snapshots, Audit Logs, Grades</p>
          </div>
        </div>
      </div>

      {/* Selected Component Deep Dive */}
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4 framer-card animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#e3e6eb] pb-3 flex-wrap gap-2">
          <div>
            <span className="text-xs uppercase font-bold text-[#2b59ff] tracking-wider">
              Component Deep Dive
            </span>
            <h2 className="text-lg font-bold text-[#15171c] mt-0.5">{current.name}</h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c]">
            Tech: <strong className="text-[#2b59ff]">{current.tech}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-1.5">
            <h4 className="font-bold text-[#15171c] flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2b59ff]" />
              <span>Core Responsibilities</span>
            </h4>
            <p className="text-[#6b7382] leading-relaxed">{current.role}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-1.5">
            <h4 className="font-bold text-[#15171c] flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Architectural Boundary</span>
            </h4>
            <p className="text-[#6b7382] leading-relaxed">{current.boundary}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-1.5">
            <h4 className="font-bold text-[#15171c] flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Security Controls</span>
            </h4>
            <p className="text-[#6b7382] leading-relaxed">{current.security}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#15171c] flex items-start space-x-3">
          <Layers className="w-4 h-4 text-[#2b59ff] flex-shrink-0 mt-0.5" />
          <p>
            <strong>Design Principle:</strong> The container is a disposable execution environment; submissions and grades must be stored independently in PostgreSQL so a stopped, expired, or reset container does not erase academic records.
          </p>
        </div>
      </div>
    </div>
  );
};

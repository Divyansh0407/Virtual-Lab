import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  Cpu,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Filter,
  Lock,
  Terminal,
  Activity,
  FileCheck,
  Settings,
  RefreshCw
} from 'lucide-react';

export const AdminClusterDashboard: React.FC = () => {
  const { clusterMetrics, templates, auditLogs, liveContainerCount } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'audit' | 'settings'>('overview');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.eventType.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesFilter = auditFilter === 'ALL' || log.eventType === auditFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 framer-card">
        <div>
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-[#2b59ff]" />
            <h1 className="text-xl font-bold text-[#15171c]">Platform Infrastructure & Cluster Control</h1>
          </div>
          <p className="text-xs text-[#6b7382] mt-1">
            Dedicated Linux VM host monitoring, approved environment image allowlists, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Rootless Docker Isolation: Active</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#e3e6eb] text-xs font-semibold w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg transition-all btn-tactile ${
            activeTab === 'overview' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          Node Telemetry
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3.5 py-1.5 rounded-lg transition-all btn-tactile ${
            activeTab === 'templates' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          Approved Image Registry ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-lg transition-all btn-tactile ${
            activeTab === 'audit' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          Immutable Audit Stream ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 rounded-lg transition-all btn-tactile ${
            activeTab === 'settings' ? 'bg-[#15171c] text-white shadow-sm' : 'text-[#6b7382] hover:text-[#15171c]'
          }`}
        >
          Quotas & Security Policy
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm framer-card hover-lift">
              <div className="flex items-center justify-between text-[#6b7382] mb-2">
                <span className="text-xs font-semibold">Active Containers</span>
                <Cpu className="w-4 h-4 text-[#2b59ff]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#15171c]">
                {liveContainerCount} <span className="text-xs text-[#6b7382] font-normal">/ {clusterMetrics.maxContainerCapacity} cap</span>
              </div>
              <div className="w-full bg-[#f4f5f7] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#2b59ff] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(liveContainerCount / clusterMetrics.maxContainerCapacity) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm framer-card hover-lift">
              <div className="flex items-center justify-between text-[#6b7382] mb-2">
                <span className="text-xs font-semibold">Host CPU Utilization</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-[#15171c]">
                {clusterMetrics.cpuUtilization}%
              </div>
              <div className="w-full bg-[#f4f5f7] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${clusterMetrics.cpuUtilization}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm framer-card hover-lift">
              <div className="flex items-center justify-between text-[#6b7382] mb-2">
                <span className="text-xs font-semibold">Host RAM (64 GB)</span>
                <HardDrive className="w-4 h-4 text-[#2b59ff]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#15171c]">
                {clusterMetrics.memoryUsedGB} <span className="text-xs text-[#6b7382] font-normal">/ {clusterMetrics.memoryTotalGB} GB</span>
              </div>
              <div className="w-full bg-[#f4f5f7] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(clusterMetrics.memoryUsedGB / clusterMetrics.memoryTotalGB) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm framer-card hover-lift">
              <div className="flex items-center justify-between text-[#6b7382] mb-2">
                <span className="text-xs font-semibold">Sandbox Storage</span>
                <Server className="w-4 h-4 text-[#2b59ff]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#15171c]">
                {clusterMetrics.diskUsedGB} <span className="text-xs text-[#6b7382] font-normal">/ {clusterMetrics.diskTotalGB} GB</span>
              </div>
              <div className="w-full bg-[#f4f5f7] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(clusterMetrics.diskUsedGB / clusterMetrics.diskTotalGB) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#15171c] flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#2b59ff]" />
              <span>Dedicated Linux Execution Host Specifications</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#f4f5f7] rounded-xl border border-[#e3e6eb]">
                <p className="text-[#6b7382]">Hostname</p>
                <p className="text-[#15171c] font-bold truncate">{clusterMetrics.hostName}</p>
              </div>
              <div className="p-3 bg-[#f4f5f7] rounded-xl border border-[#e3e6eb]">
                <p className="text-[#6b7382]">Internal IPv4</p>
                <p className="text-[#15171c] font-bold">{clusterMetrics.hostIp}</p>
              </div>
              <div className="p-3 bg-[#f4f5f7] rounded-xl border border-[#e3e6eb]">
                <p className="text-[#6b7382]">Kernel Version</p>
                <p className="text-[#15171c] font-bold">{clusterMetrics.osKernel}</p>
              </div>
              <div className="p-3 bg-[#f4f5f7] rounded-xl border border-[#e3e6eb]">
                <p className="text-[#6b7382]">Container Runtime</p>
                <p className="text-[#15171c] font-bold">{clusterMetrics.dockerVersion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {templates.map(tmpl => (
            <div key={tmpl.id} className="bg-white rounded-2xl p-5 border border-[#e3e6eb] shadow-sm space-y-3 framer-card hover-lift">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#15171c]">{tmpl.name}</h3>
                  <p className="text-xs font-mono text-[#2b59ff] mt-0.5">{tmpl.approvedImage}</p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Clean
                </span>
              </div>
              <p className="text-xs text-[#6b7382] leading-relaxed">{tmpl.description}</p>
              <div className="pt-2 border-t border-[#e3e6eb] grid grid-cols-2 gap-2 text-[11px] font-mono text-[#6b7382]">
                <div>User: <strong className="text-[#15171c]">{tmpl.nonRootUser}</strong></div>
                <div>CPU: <strong className="text-[#15171c]">{tmpl.cpuLimit}</strong></div>
                <div>RAM: <strong className="text-[#15171c]">{tmpl.memoryLimitMB} MB</strong></div>
                <div>Timeout: <strong className="text-[#15171c]">{tmpl.timeoutMinutes} min</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none"
              />
            </div>
            <select
              value={auditFilter}
              onChange={e => setAuditFilter(e.target.value)}
              className="p-2 rounded-xl bg-white border border-[#e3e6eb] text-xs text-[#15171c]"
            >
              <option value="ALL">All Event Types</option>
              <option value="CONTAINER_LAUNCH">CONTAINER_LAUNCH</option>
              <option value="CONTAINER_STOP">CONTAINER_STOP</option>
              <option value="SUBMISSION_SNAPSHOT">SUBMISSION_SNAPSHOT</option>
              <option value="AUTO_EVALUATION">AUTO_EVALUATION</option>
              <option value="GRADE_PUBLISH">GRADE_PUBLISH</option>
              <option value="SECURITY_CHECK">SECURITY_CHECK</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-[#e3e6eb] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#e3e6eb] bg-[#f4f5f7] text-[#6b7382] font-semibold">
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Target Ref</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e6eb] text-[#15171c] font-mono">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#f4f5f7]/50">
                      <td className="py-3 px-4 text-[#6b7382]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold">{log.actorName}</span>{' '}
                        <span className="text-[10px] text-[#6b7382]">({log.actorRole})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2b59ff] border border-blue-200">
                          {log.eventType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#2b59ff] truncate max-w-xs font-semibold">
                        {log.targetId}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-[#6b7382]">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#15171c] flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#2b59ff]" />
            <span>Platform Security Controls & Limits (Section 09 Compliance)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-1">
              <p className="font-bold text-[#15171c]">Docker Daemon Protection</p>
              <p className="text-[#6b7382]">Docker socket (/var/run/docker.sock) is strictly inaccessible to student containers.</p>
              <span className="inline-block text-[10px] text-emerald-700 font-bold font-mono">Status: Hardened & Isolated</span>
            </div>
            <div className="p-4 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] space-y-1">
              <p className="font-bold text-[#15171c]">Resource Quotas & DoS Mitigation</p>
              <p className="text-[#6b7382]">Borders enforced with --cpus=1.0, --memory=512m, and --pids-limit=64.</p>
              <span className="inline-block text-[10px] text-emerald-700 font-bold font-mono">Status: Enforced by Cgroups v2</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

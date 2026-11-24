import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  Cpu,
  HardDrive,
  Shield,
  Activity
} from 'lucide-react';

export const LiveSessionMonitor: React.FC = () => {
  const { activeSession, stopLabSession, clusterMetrics } = useApp();

  const activeFleet = [
    {
      id: 'sess-divyansh-8821',
      studentName: 'Divyansh Sharma',
      studentId: 'STU-2026-8841',
      courseCode: 'CS303',
      containerRef: activeSession?.containerRef || 'vl-cont-divyansh-8821',
      status: activeSession?.state || 'running',
      cpuPercent: activeSession?.cpuPercent || 14,
      memoryMB: activeSession?.memoryMB || 164,
      maxMemoryMB: 512,
      timeElapsed: '28m',
      networkPolicy: 'Restricted Egress'
    },
    {
      id: 'sess-harsh-9921',
      studentName: 'Harshvardhan Gupta',
      studentId: 'STU-2026-9210',
      courseCode: 'CS303',
      containerRef: 'vl-cont-harshvardhan-9921',
      status: 'stopped',
      cpuPercent: 0,
      memoryMB: 0,
      maxMemoryMB: 512,
      timeElapsed: 'Completed (Snapshot frozen)',
      networkPolicy: 'Restricted Egress'
    },
    {
      id: 'sess-liam-3310',
      studentName: 'Liam O’Connor',
      studentId: 'STU-2026-7712',
      courseCode: 'CS201',
      containerRef: 'vl-cont-liamoconnor-3310',
      status: 'running',
      cpuPercent: 8,
      memoryMB: 198,
      maxMemoryMB: 1024,
      timeElapsed: '14m',
      networkPolicy: 'Restricted Egress'
    },
    {
      id: 'sess-zara-4419',
      studentName: 'Zara Hassan',
      studentId: 'STU-2026-6619',
      courseCode: 'NET401',
      containerRef: 'vl-cont-zarahassan-4419',
      status: 'running',
      cpuPercent: 22,
      memoryMB: 312,
      maxMemoryMB: 1024,
      timeElapsed: '49m',
      networkPolicy: 'Restricted Egress'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-[#15171c]">Live Container Proctor & Fleet Monitor</h1>
          </div>
          <p className="text-xs text-[#6b7382] mt-1">
            Real-time observability of student sandbox environments, resource quotas, and lifecycle states.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cluster Healthy: 14 Active</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e3e6eb] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#e3e6eb] bg-[#f4f5f7] text-[#6b7382]">
                <th className="py-3 px-4 font-semibold">Student / Session</th>
                <th className="py-3 px-4 font-semibold">Course</th>
                <th className="py-3 px-4 font-semibold">Container Ref</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">CPU Load</th>
                <th className="py-3 px-4 font-semibold">Memory</th>
                <th className="py-3 px-4 font-semibold">Security Policy</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e6eb] text-[#15171c]">
              {activeFleet.map(worker => {
                const isRunning = worker.status === 'running';

                return (
                  <tr key={worker.id} className="hover:bg-[#f4f5f7]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#15171c]">{worker.studentName}</div>
                      <div className="text-[10px] text-[#6b7382] font-mono">{worker.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2b59ff]">
                      {worker.courseCode}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6b7382]">
                      {worker.containerRef}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${isRunning
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-[#6b7382]'
                          }`}
                      >
                        {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        <span>{worker.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {isRunning ? `${worker.cpuPercent}%` : '0%'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {isRunning ? `${worker.memoryMB} MB` : '0 MB'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#f4f5f7] border border-[#e3e6eb] text-[#15171c] font-mono">
                        {worker.networkPolicy}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isRunning && worker.studentName === 'Divyansh Sharma' ? (
                        <button
                          onClick={stopLabSession}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-[11px]"
                        >
                          Terminate
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#6b7382]">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Cpu,
  Layers,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Lab, LabFile, LabQuestion } from '../types';

export const FacultyLabAuthoring: React.FC = () => {
  const { courses, templates, createNewLab, setActiveTab } = useApp();

  const [courseCode, setCourseCode] = useState('CS303');
  const [title, setTitle] = useState('Lab 06: POSIX Shared Memory & Semaphores');
  const [shortDesc, setShortDesc] = useState('Implement inter-process communication using shm_open and named POSIX semaphores.');
  const [templateId, setTemplateId] = useState('tmpl-gcc-cpp');
  const [totalPoints, setTotalPoints] = useState(10);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [dueAt, setDueAt] = useState('2026-12-15T23:59:00Z');

  const [instructions, setInstructions] = useState(`### Objective
Create a producer-consumer model where two separate processes communicate over a shared memory segment synchronized with POSIX semaphores.

### Task Specifications
1. Use \`shm_open\` to allocate a 4KB shared buffer named \`/shm_virtuallab\`.
2. Initialize two named semaphores: \`sem_empty\` (initialized to 10) and \`sem_full\` (initialized to 0).
3. Compile with \`gcc -pthread -lrt producer.c -o producer\`.
4. Demonstrate clean exit and verify unlinking with \`shm_unlink\`.`);

  const [starterFiles, setStarterFiles] = useState<LabFile[]>([
    {
      name: 'producer.c',
      path: '/home/student/workspace/producer.c',
      content: `#include <stdio.h>\n#include <stdlib.h>\n#include <sys/mman.h>\n#include <semaphore.h>\n\nint main() {\n    printf("Shared Memory Producer Starting...\\n");\n    return 0;\n}`,
      isReadOnly: false
    }
  ]);

  const [questions, setQuestions] = useState<LabQuestion[]>([
    {
      id: 'q1',
      prompt: 'Explain what happens if a process crashes before calling sem_post() or shm_unlink(). How can persistent shared memory leaks be diagnosed in Linux?',
      type: 'explanation',
      maxPoints: 4,
      criteria: 'Discussion of /dev/shm filesystem inspection and deadlock conditions.'
    }
  ]);

  const [verificationScript, setVerificationScript] = useState(`gcc -pthread -lrt producer.c -o producer && ./producer --test-run`);

  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handlePublishLab = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCourse = courses.find(c => c.code === courseCode) || courses[0];

    const newLab: Lab = {
      id: `lab-${Date.now()}`,
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      title,
      shortDescription: shortDesc,
      instructions,
      prerequisites: ['Basic C systems programming', 'Understanding of IPC and concurrency', 'POSIX memory models'],
      templateId,
      version: '1.0.0',
      status: 'published',
      dueAt,
      totalPoints,
      maxAttempts,
      starterFiles,
      questions,
      verificationScript
    };

    createNewLab(newLab);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setActiveTab('dashboard');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#2b59ff]" />
          <h1 className="text-xl font-bold text-[#15171c]">Lab Authoring & Publishing Studio</h1>
        </div>
        <p className="text-xs text-[#6b7382] mt-1">
          Faculty portal to create repeatable computing practicals, assign approved container runtime templates, configure starter files, and define automated rubrics.
        </p>
      </div>

      <form onSubmit={handlePublishLab} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#2b59ff]" />
            <span>Step 1: General Details & Course Assignment</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#15171c] block mb-1">Target Course</label>
              <select
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs text-[#15171c]"
              >
                {courses.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#15171c] block mb-1">Total Points</label>
              <input
                type="number"
                value={totalPoints}
                onChange={e => setTotalPoints(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs text-[#15171c]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#15171c] block mb-1">Max Attempts</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={e => setMaxAttempts(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs text-[#15171c]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#15171c] block mb-1">Lab Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] text-xs text-[#15171c]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-4">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Step 2: Approved Container Runtime Template</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tmpl => (
              <div
                key={tmpl.id}
                onClick={() => setTemplateId(tmpl.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${templateId === tmpl.id
                  ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                  : 'bg-[#f4f5f7] border-[#e3e6eb] hover:border-gray-400'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#15171c]">{tmpl.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#6b7382]">{tmpl.description}</p>
                <div className="mt-3 pt-2 border-t border-[#e3e6eb] flex items-center justify-between text-[11px] text-[#6b7382] font-mono">
                  <span>Quota: {tmpl.cpuLimit} • {tmpl.memoryLimitMB}MB</span>
                  <span>{tmpl.timeoutMinutes}m timeout</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e3e6eb] shadow-sm space-y-3">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider">
            Step 3: Laboratory Instructions (Markdown)
          </h2>
          <textarea
            rows={5}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#f4f5f7] border border-[#e3e6eb] font-mono text-xs text-[#15171c] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          {publishedSuccess && (
            <span className="text-xs text-emerald-600 flex items-center space-x-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Lab published successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white font-semibold text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Publish Practical Lab</span>
          </button>
        </div>
      </form>
    </div>
  );
};

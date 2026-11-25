import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Trash2,
  FileCode,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  Sparkles,
  Calendar,
  Award
} from 'lucide-react';
import { Lab, LabFile, LabQuestion } from '../types';

export const FacultyLabAuthoring: React.FC = () => {
  const { classrooms, createLab, setActiveTab, currentUser } = useApp();

  const teacherClassrooms = classrooms.filter(
    c => c.teacherId === currentUser.id || currentUser.role === 'admin'
  );

  const [selectedClassroomId, setSelectedClassroomId] = useState(
    teacherClassrooms[0]?.id || classrooms[0]?.id || ''
  );

  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [totalPoints, setTotalPoints] = useState(10);
  const [dueAt, setDueAt] = useState('2026-12-25T23:59');

  const [instructions, setInstructions] = useState(`### Objective
Describe the practical objectives and target outcomes for the student here.

### Instructions & Steps
1. In the terminal, verify your environment.
2. Complete the tasks as outlined in the starter files.
3. Test your program thoroughly.
4. Record your findings and submit.`);

  const [starterFiles, setStarterFiles] = useState<LabFile[]>([
    {
      name: 'solution.sh',
      path: '/home/student/solution.sh',
      content: '#!/bin/bash\n# Write your solution script here\necho "Hello from VirtualLab"\n',
      isReadOnly: false
    }
  ]);

  const [questions, setQuestions] = useState<LabQuestion[]>([
    {
      id: 'q1',
      prompt: 'Explain how your solution works and describe the commands you executed to verify it.',
      type: 'explanation',
      maxPoints: 5,
      criteria: 'Clear technical explanation of commands executed.'
    }
  ]);

  const [newFileName, setNewFileName] = useState('');
  const [newQuestionPrompt, setNewQuestionPrompt] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addStarterFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    if (starterFiles.some(f => f.name === name)) {
      setErrorMsg(`File "${name}" already exists.`);
      return;
    }
    setStarterFiles(prev => [
      ...prev,
      {
        name,
        path: `/home/student/${name}`,
        content: `# File: ${name}\n`,
        isReadOnly: false
      }
    ]);
    setNewFileName('');
    setErrorMsg('');
  };

  const removeStarterFile = (index: number) => {
    setStarterFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    if (!newQuestionPrompt.trim()) return;
    const newQ: LabQuestion = {
      id: `q-${Date.now()}`,
      prompt: newQuestionPrompt.trim(),
      type: 'explanation',
      maxPoints: 5,
      criteria: 'Evaluation criteria'
    };
    setQuestions(prev => [...prev, newQ]);
    setNewQuestionPrompt('');
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !shortDesc.trim()) {
      setErrorMsg('Please enter a Lab Title and Short Summary.');
      return;
    }

    if (!selectedClassroomId) {
      setErrorMsg('Please select a target Classroom.');
      return;
    }

    const classroom = classrooms.find(c => c.id === selectedClassroomId);

    createLab({
      classroomId: selectedClassroomId,
      classroomCode: classroom?.code || '',
      classroomName: classroom?.name || '',
      title: title.trim(),
      shortDescription: shortDesc.trim(),
      instructions,
      prerequisites: ['Basic Linux command line knowledge'],
      dueAt: new Date(dueAt).toISOString(),
      totalPoints,
      maxAttempts: 3,
      starterFiles,
      questions,
      status: 'published'
    });

    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setActiveTab('classrooms');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#15171c] text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-[#2b59ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#15171c] tracking-tight">
                Author New Practical Lab
              </h1>
              <p className="text-xs text-[#6b7382]">
                Design interactive Linux container assignments with starter code and rubric questions
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('classrooms')}
          className="text-xs font-bold text-[#6b7382] hover:text-[#15171c] px-4 py-2 rounded-xl border border-[#e3e6eb] bg-[#f8f9fa] hover:bg-white"
        >
          Back to Classrooms
        </button>
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pop-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lab published successfully! Redirecting to classroom hub...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Section 1: Target Classroom & Basic Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm space-y-4">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2b59ff]" />
            <span>Step 1: Classroom & Practical Metadata</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#15171c] block mb-1">
                Assign to Classroom
              </label>
              <select
                value={selectedClassroomId}
                onChange={e => setSelectedClassroomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] bg-[#f8f9fa] focus:outline-none focus:border-[#2b59ff]"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#15171c] block mb-1">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] bg-[#f8f9fa] focus:outline-none focus:border-[#2b59ff]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#15171c] block mb-1">
              Lab Practical Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Lab 04: Socket Programming & TCP Handshakes"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs font-bold text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#15171c] block mb-1">
                Short Description / Learning Goal
              </label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={e => setShortDesc(e.target.value)}
                placeholder="Brief summary shown on student cards..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#15171c] block mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={totalPoints}
                onChange={e => setTotalPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c] focus:outline-none focus:border-[#2b59ff]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Instructions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm space-y-3">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2b59ff]" />
            <span>Step 2: Lab Tasks & Instructions (Markdown)</span>
          </h2>
          <p className="text-xs text-[#6b7382]">
            These instructions will appear in the student workspace beside the interactive terminal and editor.
          </p>

          <textarea
            rows={8}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            className="w-full p-4 rounded-2xl border border-[#e3e6eb] text-xs font-mono text-[#15171c] bg-[#f8f9fa] focus:outline-none focus:border-[#2b59ff] leading-relaxed"
          />
        </div>

        {/* Section 3: Starter Files */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm space-y-4">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#2b59ff]" />
            <span>Step 3: Starter Files in Container</span>
          </h2>
          <p className="text-xs text-[#6b7382]">
            These files are automatically preloaded into the student's isolated container workspace at <code>/home/student/</code>.
          </p>

          <div className="space-y-3">
            {starterFiles.map((file, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-[#e3e6eb] bg-[#fcfdfe] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#15171c]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeStarterFile(idx)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={file.content}
                  onChange={e => {
                    const newContent = e.target.value;
                    setStarterFiles(prev =>
                      prev.map((f, i) => i === idx ? { ...f, content: newContent } : f)
                    );
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#e3e6eb] text-xs font-mono text-[#15171c] bg-white"
                />
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                placeholder="New filename (e.g. server.c, main.py)"
                className="flex-1 px-3 py-2 rounded-xl border border-[#e3e6eb] text-xs font-mono text-[#15171c]"
              />
              <button
                type="button"
                onClick={addStarterFile}
                className="px-4 py-2 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add File</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Evaluation Questions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3e6eb] shadow-sm space-y-4">
          <h2 className="text-sm uppercase font-bold text-[#15171c] tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#2b59ff]" />
            <span>Step 4: Submission Questions & Rubric</span>
          </h2>

          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="p-3.5 rounded-2xl border border-[#e3e6eb] bg-[#fcfdfe] flex items-center justify-between gap-3">
                <div className="flex-1 text-xs text-[#15171c] font-medium">{q.prompt}</div>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-gray-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionPrompt}
                onChange={e => setNewQuestionPrompt(e.target.value)}
                placeholder="Add evaluation question prompt for student submission..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#e3e6eb] text-xs text-[#15171c]"
              />
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 rounded-xl bg-[#15171c] hover:bg-[#252830] text-white text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('classrooms')}
            className="px-5 py-2.5 rounded-xl border border-[#e3e6eb] text-xs font-semibold text-[#6b7382]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#2b59ff] hover:bg-[#1e40eb] text-white font-bold text-xs shadow-md btn-tactile hover-lift flex items-center space-x-2"
          >
            <span>Publish Lab Practical to Classroom</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

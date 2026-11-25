import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { labApi, BackendHealthResponse } from '../services/api';
import {
  User,
  UserRole,
  Classroom,
  Lab,
  LabSession,
  Submission,
  LabFile,
  Grade
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSROOMS,
  INITIAL_LABS,
  INITIAL_SUBMISSIONS
} from '../data/mockData';

interface BackendStatus {
  online: boolean;
  dockerConnected: boolean;
  dynamoDbConnected: boolean;
  lastChecked: string | null;
  checking: boolean;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  currentRole: UserRole;
  switchUser: (userId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  loginWithCredentials: (identifier: string, passwordInput: string) => { success: boolean; error?: string };
  signup: (data: { name: string; email: string; password?: string; role: UserRole; department: string; studentId?: string }) => void;
  logout: () => void;
  authModalOpen: 'login' | 'signup' | null;
  setAuthModalOpen: (mode: 'login' | 'signup' | null) => void;

  // Classrooms
  classrooms: Classroom[];
  createClassroom: (data: { name: string; code: string; section: string; description: string }) => { success: boolean; message: string; classroom?: Classroom };
  joinClassroom: (code: string) => { success: boolean; message: string };

  // Labs
  labs: Lab[];
  createLab: (lab: Omit<Lab, 'id'>) => { success: boolean; labId: string };
  deleteLab: (labId: string) => void;
  activeLabId: string;
  setActiveLabId: (labId: string) => void;

  // Real EC2 Docker Container Session
  activeSession: LabSession | null;
  startLabSession: (labId: string) => Promise<void>;
  stopLabSession: () => Promise<void>;
  reconnectLabSession: () => Promise<void>;
  updateSessionFile: (fileName: string, content: string) => void;
  createSessionFile: (fileName: string, content?: string) => void;

  // Submissions & Grading
  submissions: Submission[];
  submitLab: (labId: string, answers: Record<string, string>, terminalSnapshot: string) => Submission;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  // System Health
  backendStatus: BackendStatus;
  checkBackendHealth: () => Promise<void>;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vl_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vl_is_authenticated') === 'true';
  });

  const [authModalOpen, setAuthModalOpen] = useState<'login' | 'signup' | null>(null);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('vl_current_user_id');
    const found = users.find(u => u.id === savedId);
    return found || users[0]; // Default student
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const isAuth = localStorage.getItem('vl_is_authenticated') === 'true';
    if (!isAuth) return 'landing';
    const role = localStorage.getItem('vl_current_role') || 'student';
    return role === 'teacher' || role === 'faculty' ? 'classrooms' : 'dashboard';
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem('vl_classrooms');
    return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
  });

  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem('vl_labs');
    return saved ? JSON.parse(saved) : INITIAL_LABS;
  });

  const [activeLabId, setActiveLabId] = useState<string>('lab-linux-perm');

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('vl_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [activeSession, setActiveSession] = useState<LabSession | null>(null);

  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    online: false,
    dockerConnected: false,
    dynamoDbConnected: false,
    lastChecked: null,
    checking: false
  });

  // State persistence
  useEffect(() => {
    if (localStorage.getItem('vl_seeded_v3') !== 'true') {
      setClassrooms(INITIAL_CLASSROOMS);
      setLabs(INITIAL_LABS);
      setUsers(INITIAL_USERS);
      localStorage.setItem('vl_classrooms', JSON.stringify(INITIAL_CLASSROOMS));
      localStorage.setItem('vl_labs', JSON.stringify(INITIAL_LABS));
      localStorage.setItem('vl_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('vl_seeded_v3', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vl_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vl_current_user_id', currentUser.id);
    localStorage.setItem('vl_current_role', currentUser.role);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vl_classrooms', JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem('vl_labs', JSON.stringify(labs));
  }, [labs]);

  useEffect(() => {
    localStorage.setItem('vl_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Periodic Backend Health Check
  const checkBackendHealth = useCallback(async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    try {
      const data: BackendHealthResponse = await labApi.checkHealth();
      setBackendStatus({
        online: data.status === 'ok',
        dockerConnected: Boolean(data.docker?.connected),
        dynamoDbConnected: Boolean(data.dynamoDB?.connected),
        lastChecked: new Date().toLocaleTimeString(),
        checking: false
      });
    } catch {
      setBackendStatus({
        online: false,
        dockerConnected: false,
        dynamoDbConnected: false,
        lastChecked: new Date().toLocaleTimeString(),
        checking: false
      });
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 15000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Active Session countdown timer
  useEffect(() => {
    if (!activeSession || activeSession.state !== 'running') return;
    const interval = setInterval(() => {
      setActiveSession(prev => {
        if (!prev || prev.state !== 'running') return prev;
        if (prev.timeRemainingSeconds <= 1) {
          return { ...prev, state: 'expired', timeRemainingSeconds: 0 };
        }
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.state]);

  // User Authentication
  const login = (userId: string) => {
    const target = users.find(u => u.id === userId) || users[0];
    setCurrentUser(target);
    setIsAuthenticated(true);
    localStorage.setItem('vl_is_authenticated', 'true');
    localStorage.setItem('vl_current_user_id', target.id);
    localStorage.setItem('vl_current_role', target.role);

    if (target.role === 'teacher' || target.role === 'faculty') {
      setActiveTab('classrooms');
    } else {
      setActiveTab('dashboard');
    }
  };

  const loginWithCredentials = (identifier: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both your email/ID and password.' };
    }

    let normalizedId = cleanId;
    if (cleanId === 'divyansh.sharma@university.edu') normalizedId = 'student@virtuallab.edu';
    if (cleanId === 'garvit.dohare@university.edu') normalizedId = 'teacher@virtuallab.edu';

    const target = users.find(u =>
      u.email.toLowerCase() === normalizedId ||
      u.studentId?.toLowerCase() === cleanId ||
      u.id.toLowerCase() === cleanId
    );

    if (!target) {
      return { success: false, error: 'No account found with these credentials.' };
    }

    const isLegacyDemoPass =
      (target.id === 'student-1' && cleanPass === 'divyansh@123') ||
      (target.id === 'teacher-1' && cleanPass === 'garvit@123');

    if (target.password && target.password !== cleanPass && !isLegacyDemoPass && cleanPass !== 'password123') {
      return { success: false, error: 'Incorrect password.' };
    }

    login(target.id);
    return { success: true };
  };

  const signup = (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department: string;
    studentId?: string;
  }) => {
    const newId = `${data.role}-${Date.now().toString(36)}`;
    const avatar = data.role === 'teacher' || data.role === 'faculty'
      ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newUser: User = {
      id: newId,
      name: data.name,
      email: data.email,
      password: data.password || 'password123',
      role: data.role,
      department: data.department,
      studentId: data.studentId || (data.role === 'student' ? `STU-${Math.floor(1000 + Math.random() * 9000)}` : `FAC-${Math.floor(100 + Math.random() * 900)}`),
      avatar
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('vl_is_authenticated', 'true');
    localStorage.setItem('vl_current_user_id', newId);
    localStorage.setItem('vl_current_role', newUser.role);

    if (data.role === 'teacher' || data.role === 'faculty') {
      setActiveTab('classrooms');
    } else {
      setActiveTab('dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vl_is_authenticated');
    setActiveTab('landing');
    if (activeSession) {
      stopLabSession();
    }
  };

  const switchUser = (userId: string) => {
    login(userId);
  };

  // Classroom Management
  const createClassroom = (data: { name: string; code: string; section: string; description: string }) => {
    const cleanCode = data.code.trim().toUpperCase();
    if (!data.name.trim() || !cleanCode) {
      return { success: false, message: 'Classroom title and code are required.' };
    }

    // Check duplicate code
    if (classrooms.some(c => c.code.toUpperCase() === cleanCode)) {
      return { success: false, message: `Classroom code "${cleanCode}" is already in use.` };
    }

    const colors = [
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-purple-600 to-indigo-800',
      'from-amber-600 to-rose-700',
      'from-cyan-600 to-blue-800'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newClassroom: Classroom = {
      id: `cls-${Date.now().toString(36)}`,
      name: data.name.trim(),
      code: cleanCode,
      section: data.section.trim() || 'General Cohort',
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      description: data.description.trim() || 'Interactive cloud computing practical classroom.',
      color: randomColor,
      studentIds: [],
      createdAt: new Date().toISOString()
    };

    setClassrooms(prev => [newClassroom, ...prev]);
    return { success: true, message: 'Classroom created successfully!', classroom: newClassroom };
  };

  const joinClassroom = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const target = classrooms.find(c => c.code.toUpperCase() === cleanCode);
    if (!target) {
      return { success: false, message: `No classroom found matching code "${cleanCode}".` };
    }

    if (target.studentIds.includes(currentUser.id)) {
      return { success: false, message: `You are already enrolled in "${target.name}".` };
    }

    setClassrooms(prev =>
      prev.map(c =>
        c.id === target.id
          ? { ...c, studentIds: [...c.studentIds, currentUser.id] }
          : c
      )
    );

    return { success: true, message: `Successfully enrolled in ${target.name}!` };
  };

  // Lab Management
  const createLab = (labData: Omit<Lab, 'id'>) => {
    const newId = `lab-${Date.now().toString(36)}`;
    const classroom = classrooms.find(c => c.id === labData.classroomId);

    const newLab: Lab = {
      ...labData,
      id: newId,
      classroomCode: classroom?.code || '',
      classroomName: classroom?.name || ''
    };

    setLabs(prev => [newLab, ...prev]);
    return { success: true, labId: newId };
  };

  const deleteLab = (labId: string) => {
    setLabs(prev => prev.filter(l => l.id !== labId));
  };

  // Real Container Lifecycle Management
  const startLabSession = async (labId: string) => {
    const lab = labs.find(l => l.id === labId) || labs[0];
    if (!lab) return;

    setActiveLabId(lab.id);
    setActiveTab('workspace');

    // 1. Initial State: Starting / Provisioning on AWS EC2
    setActiveSession({
      id: '',
      assignmentId: `assign-${lab.id}`,
      labId: lab.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      containerRef: 'Allocating AWS EC2 Container...',
      state: 'starting',
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      durationMinutes: 30,
      timeRemainingSeconds: 30 * 60,
      cpuPercent: 5,
      memoryMB: 48,
      maxMemoryMB: 128,
      activePids: 2,
      networkEgressBlocked: true,
      terminalLogs: [
        `[VirtualLab Orchestrator] Contacting AWS EC2 backend gateway...`,
        `[VirtualLab Orchestrator] Target Image: virtuallab-linux:1.0 | Resource Limit: 128MB RAM, 0.25 vCPU`,
        `[VirtualLab Orchestrator] Security: Dropping all Linux capabilities; no network egress.`
      ],
      files: JSON.parse(JSON.stringify(lab.starterFiles || [])),
      studentAnswers: {}
    });

    try {
      const response = await labApi.launchLab(
        lab.id,
        currentUser.id,
        currentUser.name,
        currentUser.role
      );

      const serverSession = response.session;
      setActiveSession(prev => ({
        ...(prev || {}),
        id: serverSession.id,
        assignmentId: `assign-${lab.id}`,
        labId: lab.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        containerRef: serverSession.containerName,
        state: 'running',
        startedAt: serverSession.startedAt,
        expiresAt: serverSession.expiresAt,
        durationMinutes: serverSession.durationMinutes || 30,
        timeRemainingSeconds: serverSession.timeRemainingSeconds || 30 * 60,
        cpuPercent: 8,
        memoryMB: 54,
        maxMemoryMB: 128,
        activePids: 3,
        networkEgressBlocked: true,
        ticket: serverSession.ticket,
        wsEndpoint: serverSession.wsEndpoint,
        errorMessage: undefined,
        terminalLogs: [
          `[VirtualLab Orchestrator] Container ${serverSession.containerName} is live on AWS EC2.`,
          `[VirtualLab Orchestrator] Interactive Bash TTY attached.`
        ],
        files: prev?.files || JSON.parse(JSON.stringify(lab.starterFiles || [])),
        studentAnswers: prev?.studentAnswers || {}
      }));
    } catch (err: any) {
      const errMsg = err.message || 'Failed to connect to AWS EC2 backend. Check SSH tunnel on port 5001.';
      setActiveSession(prev => ({
        ...(prev || {
          id: '',
          assignmentId: `assign-${lab.id}`,
          labId: lab.id,
          studentId: currentUser.id,
          studentName: currentUser.name,
          containerRef: 'launch-failed',
          startedAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
          durationMinutes: 30,
          timeRemainingSeconds: 0,
          cpuPercent: 0,
          memoryMB: 0,
          maxMemoryMB: 128,
          activePids: 0,
          networkEgressBlocked: true,
          files: JSON.parse(JSON.stringify(lab.starterFiles || [])),
          studentAnswers: {}
        }),
        state: 'failed',
        errorMessage: errMsg,
        terminalLogs: [
          `[VirtualLab Error] Could not provision container on EC2.`,
          `[VirtualLab Error] ${errMsg}`
        ]
      }));
    }
  };

  const stopLabSession = async () => {
    if (!activeSession) return;
    const sessionToStop = activeSession;
    setActiveSession(null);

    try {
      if (sessionToStop.id && sessionToStop.id.startsWith('sess_')) {
        await labApi.stopLab(sessionToStop.id, currentUser.id, currentUser.role);
      }
    } catch (err) {
      console.warn('Backend stop session notice:', err);
    }
  };

  const reconnectLabSession = async () => {
    if (!activeSession || !activeSession.id) return;
    try {
      const statusRes = await labApi.getLabStatus(activeSession.id, currentUser.id, currentUser.role);
      if (statusRes.session) {
        setActiveSession(prev => prev ? {
          ...prev,
          ticket: statusRes.session.ticket,
          timeRemainingSeconds: statusRes.session.timeRemainingSeconds
        } : null);
      }
    } catch (err) {
      console.warn('Failed to refresh session ticket:', err);
    }
  };

  const updateSessionFile = (fileName: string, content: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const files = prev.files.map(f => f.name === fileName ? { ...f, content } : f);
      if (!files.some(f => f.name === fileName)) {
        files.push({ name: fileName, path: `/home/student/${fileName}`, content, isReadOnly: false });
      }
      return { ...prev, files };
    });
  };

  const createSessionFile = (fileName: string, content = '') => {
    setActiveSession(prev => {
      if (!prev) return null;
      if (prev.files.some(f => f.name === fileName)) return prev;
      return {
        ...prev,
        files: [...prev.files, { name: fileName, path: `/home/student/${fileName}`, content, isReadOnly: false }]
      };
    });
  };

  // Lab Submission & Grading
  const submitLab = (labId: string, answers: Record<string, string>, terminalSnapshot: string): Submission => {
    const lab = labs.find(l => l.id === labId);
    const classroom = classrooms.find(c => c.id === lab?.classroomId);

    const newSub: Submission = {
      id: `sub-${Date.now().toString(36)}`,
      labId,
      labTitle: lab?.title || 'Lab Practical',
      classroomId: classroom?.id || '',
      classroomName: classroom?.name || 'Classroom',
      studentId: currentUser.id,
      studentName: currentUser.name,
      submittedAt: new Date().toISOString(),
      answers,
      terminalSnapshot,
      filesSnapshot: activeSession?.files || [],
      status: 'submitted'
    };

    setSubmissions(prev => [newSub, ...prev.filter(s => !(s.labId === labId && s.studentId === currentUser.id))]);
    return newSub;
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev =>
      prev.map(s => {
        if (s.id !== submissionId) return s;
        return {
          ...s,
          status: 'graded',
          grade: {
            score,
            maxScore: 10,
            feedback,
            gradedAt: new Date().toISOString(),
            gradedBy: currentUser.name
          }
        };
      })
    );
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setClassrooms(INITIAL_CLASSROOMS);
    setLabs(INITIAL_LABS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setActiveSession(null);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        currentRole: currentUser.role,
        switchUser,
        activeTab,
        setActiveTab,
        isAuthenticated,
        login,
        loginWithCredentials,
        signup,
        logout,
        authModalOpen,
        setAuthModalOpen,
        classrooms,
        createClassroom,
        joinClassroom,
        labs,
        createLab,
        deleteLab,
        activeLabId,
        setActiveLabId,
        activeSession,
        startLabSession,
        stopLabSession,
        reconnectLabSession,
        updateSessionFile,
        createSessionFile,
        submissions,
        submitLab,
        gradeSubmission,
        backendStatus,
        checkBackendHealth,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

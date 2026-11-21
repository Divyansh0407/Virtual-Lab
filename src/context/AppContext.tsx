import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Course,
  EnvironmentTemplate,
  Lab,
  LabSession,
  Submission,
  AuditEvent,
  SystemClusterMetrics,
  LabFile,
  TestCaseResult,
  EvaluationRun,
  Grade
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_TEMPLATES,
  INITIAL_LABS,
  INITIAL_SUBMISSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLUSTER_METRICS
} from '../data/mockData';

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
  courses: Course[];
  templates: EnvironmentTemplate[];
  labs: Lab[];
  submissions: Submission[];
  auditLogs: AuditEvent[];
  clusterMetrics: SystemClusterMetrics;
  activeSession: LabSession | null;
  activeLabId: string;
  setActiveLabId: (labId: string) => void;
  startLabSession: (labId: string) => void;
  stopLabSession: () => void;
  resetLabSession: () => void;
  reconnectLabSession: () => void;
  executeTerminalCommand: (cmd: string) => void;
  updateSessionFile: (fileName: string, content: string) => void;
  createSessionFile: (fileName: string) => void;
  saveStudentAnswer: (questionId: string, value: string) => void;
  submitLab: (labId: string, answers: Record<string, string>, terminalSnapshot: string) => Submission;
  publishGrade: (submissionId: string, finalScore: number, breakdown: Grade['breakdown'], notes: string) => void;
  createNewLab: (lab: Lab) => void;
  resetToDefaultData: () => void;
  guidedTourStep: number;
  setGuidedTourStep: (step: number) => void;
  showGuidedTour: boolean;
  setShowGuidedTour: (show: boolean) => void;
  liveContainerCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vl_is_authenticated') === 'true';
  });
  const [authModalOpen, setAuthModalOpen] = useState<'login' | 'signup' | null>(null);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('vl_current_user_id');
    const found = INITIAL_USERS.find(u => u.id === saved);
    return found || INITIAL_USERS[0]; // Default Divyansh Sharma
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const isAuth = localStorage.getItem('vl_is_authenticated') === 'true';
    return isAuth ? 'dashboard' : 'landing';
  });
  const [activeLabId, setActiveLabId] = useState<string>('lab-linux-perm');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [templates, setTemplates] = useState<EnvironmentTemplate[]>(INITIAL_TEMPLATES);
  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem('vl_labs');
    return saved ? JSON.parse(saved) : INITIAL_LABS;
  });
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('vl_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem('vl_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [clusterMetrics, setClusterMetrics] = useState<SystemClusterMetrics>(INITIAL_CLUSTER_METRICS);
  const [activeSession, setActiveSession] = useState<LabSession | null>(null);

  // Guided Tour
  const [showGuidedTour, setShowGuidedTour] = useState<boolean>(false);
  const [guidedTourStep, setGuidedTourStep] = useState<number>(1);

  // Persist key state
  useEffect(() => {
    localStorage.setItem('vl_current_user_id', currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vl_labs', JSON.stringify(labs));
  }, [labs]);

  useEffect(() => {
    localStorage.setItem('vl_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('vl_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Session timer countdown effect
  useEffect(() => {
    if (!activeSession || activeSession.state !== 'running') return;

    const interval = setInterval(() => {
      setActiveSession(prev => {
        if (!prev || prev.state !== 'running') return prev;
        if (prev.timeRemainingSeconds <= 1) {
          addAuditEvent({
            actorId: 'system-daemon',
            actorName: 'Session Expiry Worker',
            actorRole: 'admin',
            eventType: 'CONTAINER_STOP',
            targetId: prev.containerRef,
            description: `Session ${prev.id} expired due to duration limit reached. Container resources cleaned up.`
          });
          return { ...prev, state: 'expired', timeRemainingSeconds: 0 };
        }
        // slight jitter in simulated CPU/RAM
        const cpuJitter = Math.min(100, Math.max(2, Math.floor(prev.cpuPercent + (Math.random() * 6 - 3))));
        return {
          ...prev,
          timeRemainingSeconds: prev.timeRemainingSeconds - 1,
          cpuPercent: cpuJitter
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.state]);

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      // Sensible default tab when switching roles
      if (target.role === 'student') {
        setActiveTab('dashboard');
      } else if (target.role === 'faculty') {
        setActiveTab('grading');
      } else if (target.role === 'admin') {
        setActiveTab('admin');
      }
    }
  };

  const addAuditEvent = (event: Omit<AuditEvent, 'id' | 'timestamp'>) => {
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newEvent, ...prev]);
  };

  const login = (userId: string) => {
    const target = users.find(u => u.id === userId) || users[0];
    setCurrentUser(target);
    setIsAuthenticated(true);
    localStorage.setItem('vl_is_authenticated', 'true');
    localStorage.setItem('vl_current_user_id', target.id);

    // Direct user to appropriate portal based on role
    if (target.role === 'student') {
      setActiveTab('dashboard');
    } else if (target.role === 'faculty') {
      setActiveTab('grading');
    } else if (target.role === 'admin') {
      setActiveTab('admin');
    }

    addAuditEvent({
      actorId: target.id,
      actorName: target.name,
      actorRole: target.role,
      eventType: 'AUTH_LOGIN',
      targetId: target.id,
      description: `User ${target.name} (${target.role}) signed in successfully.`
    });
  };

  const loginWithCredentials = (identifier: string, passwordInput: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your university email or academic ID.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const target = users.find(u =>
      u.email.toLowerCase() === cleanId ||
      u.studentId?.toLowerCase() === cleanId
    );

    if (!target) {
      return { success: false, error: 'Account not found. Please verify your email or academic ID.' };
    }

    const expectedPass = target.password || 'password123';
    const isDefaultRolePass =
      (target.role === 'student' && cleanPass === 'student123') ||
      (target.role === 'faculty' && cleanPass === 'faculty123') ||
      (target.role === 'admin' && cleanPass === 'admin123');

    if (expectedPass !== cleanPass && !isDefaultRolePass) {
      return { success: false, error: 'Incorrect password. Please verify your credentials.' };
    }

    login(target.id);
    return { success: true };
  };

  const signup = (data: { name: string; email: string; password?: string; role: UserRole; department: string; studentId?: string }) => {
    const newId = `user-${Date.now().toString(36)}`;
    const newUser: User = {
      id: newId,
      name: data.name,
      email: data.email,
      password: data.password || 'student123',
      role: data.role,
      department: data.department,
      studentId: data.studentId,
      avatar: data.role === 'faculty'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('vl_is_authenticated', 'true');
    localStorage.setItem('vl_current_user_id', newId);

    if (data.role === 'student') {
      setActiveTab('dashboard');
    } else if (data.role === 'faculty') {
      setActiveTab('grading');
    } else {
      setActiveTab('admin');
    }

    addAuditEvent({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      eventType: 'AUTH_SIGNUP',
      targetId: newId,
      description: `New academic account created for ${newUser.name} (${newUser.email}) as ${newUser.role}.`
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vl_is_authenticated');
    setActiveTab('landing');
    if (activeSession) {
      stopLabSession();
    }
    addAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'AUTH_LOGOUT',
      targetId: currentUser.id,
      description: `User ${currentUser.name} signed out. Returned to landing page.`
    });
  };

  // Lab Session Management
  const startLabSession = (labId: string) => {
    const lab = labs.find(l => l.id === labId);
    if (!lab) return;

    const sessionId = `sess-${currentUser.id.substring(0, 6)}-${Date.now().toString(36)}`;
    const containerRef = `vl-cont-${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(Math.random() * 8999 + 1000)}`;

    // Initial state: QUEUED
    const initialSession: LabSession = {
      id: sessionId,
      assignmentId: `assign-${lab.id}`,
      labId: lab.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      containerRef,
      state: 'queued',
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      durationMinutes: 90,
      timeRemainingSeconds: 90 * 60,
      cpuPercent: 8,
      memoryMB: 128,
      maxMemoryMB: 512,
      activePids: 4,
      networkEgressBlocked: true,
      terminalLogs: [
        `[VirtualLab Orchestrator] Requesting container provision for ${currentUser.name}...`,
        `[VirtualLab Orchestrator] Security Check: Verified non-root user 'student' (UID 1001). Policy POL-RESTRICTED-NET-V1 attached.`,
        `[VirtualLab Orchestrator] Container instance created: ${containerRef}`
      ],
      files: JSON.parse(JSON.stringify(lab.starterFiles)),
      studentAnswers: {}
    };

    setActiveSession(initialSession);
    setActiveLabId(labId);
    setActiveTab('workspace');

    // Simulate transition: QUEUED -> STARTING -> RUNNING
    setTimeout(() => {
      setActiveSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          state: 'starting',
          terminalLogs: [
            ...prev.terminalLogs,
            `[Container Daemon] Pulling cached image virtuallab/ubuntu-shell:22.04-hardened...`,
            `[Container Daemon] Mounting read-only rootfs with ephemeral /home/student/workspace tmpfs...`,
            `[Lab Gateway] Authenticated reverse proxy established on wss://gateway.virtuallab.internal/session/${containerRef}`
          ]
        };
      });

      setTimeout(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          const welcomeBanner = [
            `Linux vl-ubuntu-node 6.2.0-39-generic #42-Ubuntu SMP PREEMPT x86_64`,
            ``,
            ` * VirtualLab Academic Sandbox Environment v2.4`,
            ` * Workload Isolation: Non-privileged rootless container`,
            ` * Current user: student (UID: 1001, GID: 1001)`,
            ` * Working Directory: /home/student/workspace`,
            ` * Session Duration: 90 minutes allocated. Persistent snapshot active.`,
            ``,
            `Type 'help' for lab guidance or use terminal quick action buttons.`,
            `------------------------------------------------------------------------`
          ];
          return {
            ...prev,
            state: 'running',
            cpuPercent: 14,
            memoryMB: 164,
            activePids: 7,
            terminalLogs: [...prev.terminalLogs, ...welcomeBanner]
          };
        });

        addAuditEvent({
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          eventType: 'CONTAINER_LAUNCH',
          targetId: containerRef,
          description: `Container ${containerRef} successfully provisioned and attached for student ${currentUser.name} on ${lab.title}.`
        });

        setClusterMetrics(prev => ({
          ...prev,
          activeContainers: prev.activeContainers + 1,
          cpuUtilization: Math.min(95, prev.cpuUtilization + 1.8)
        }));
      }, 1000);
    }, 800);
  };

  const stopLabSession = () => {
    if (!activeSession) return;
    const ref = activeSession.containerRef;
    setActiveSession(prev => prev ? { ...prev, state: 'stopped' } : null);

    addAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'CONTAINER_STOP',
      targetId: ref,
      description: `Student manually stopped session container ${ref}. Files preserved in staging volume.`
    });

    setClusterMetrics(prev => ({
      ...prev,
      activeContainers: Math.max(0, prev.activeContainers - 1),
      cpuUtilization: Math.max(10, prev.cpuUtilization - 1.8)
    }));
  };

  const resetLabSession = () => {
    if (!activeSession) return;
    startLabSession(activeSession.labId);
  };

  const reconnectLabSession = () => {
    if (!activeSession) return;
    setActiveSession(prev => prev ? { ...prev, state: 'running' } : null);
  };

  // Real interactive terminal parser!
  const executeTerminalCommand = (cmd: string) => {
    if (!activeSession || activeSession.state !== 'running') return;
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const promptLine = `student@${activeSession.containerRef}:~/workspace$ ${trimmed}`;
    let outputLines: string[] = [];

    const parts = trimmed.split(' ').filter(Boolean);
    const command = parts[0];
    const args = parts.slice(1);

    if (command === 'clear') {
      setActiveSession(prev => prev ? { ...prev, terminalLogs: [] } : null);
      return;
    }

    if (command === 'help') {
      outputLines = [
        `VirtualLab Shell v2.4 (Simulated POSIX Environment)`,
        `Available Commands:`,
        `  ls [-l, -la, -a]             List files and POSIX permissions`,
        `  touch <file>                 Create empty file in workspace`,
        `  chmod <mode> <file>          Change file permissions (e.g. chmod 640 report.txt)`,
        `  stat [-c "%a %n"] <file>     Display file status or octal mode`,
        `  cat <file>                   Output file contents`,
        `  echo "text" > <file>         Write string into file`,
        `  rm <file>                    Remove file`,
        `  pwd                          Print working directory`,
        `  whoami                       Display active user`,
        `  id                           Print user/group credentials`,
        `  python3 <file>               Execute Python script`,
        `  pytest [-v]                  Run automated test runner`,
        `  ps aux                       List active isolated container processes`,
        `  df -h                        Display disk utilization`,
        `  uptime                       Show container uptime & load average`,
        `  clear                        Clear terminal screen`
      ];
    } else if (command === 'pwd') {
      outputLines = ['/home/student/workspace'];
    } else if (command === 'whoami') {
      outputLines = ['student'];
    } else if (command === 'id') {
      outputLines = ['uid=1001(student) gid=1001(student) groups=1001(student),1002(labmembers)'];
    } else if (command === 'uname' || (command === 'uname' && args.includes('-a'))) {
      outputLines = ['Linux vl-container-node 6.2.0-39-generic #42-Ubuntu SMP x86_64 GNU/Linux'];
    } else if (command === 'uptime') {
      outputLines = [' 12:28:40 up 42 min,  1 user,  load average: 0.12, 0.08, 0.05'];
    } else if (command === 'df' || (command === 'df' && args.includes('-h'))) {
      outputLines = [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/rootfs      20G  4.2G   15G  22% /',
        'tmpfs           512M  164M  348M  32% /home/student/workspace',
        'devtmpfs        256M     0  256M   0% /dev'
      ];
    } else if (command === 'ps' || (command === 'ps' && args.includes('aux'))) {
      outputLines = [
        'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        'student      1  0.0  0.1   8924  2412 pts/0    Ss+  12:00   0:00 /bin/bash --login',
        'student     14  0.1  0.4  14210  4120 pts/0    S    12:05   0:00 /usr/bin/python3-agent',
        'student     42  0.0  0.1   9104  1820 pts/0    R+   12:28   0:00 ps aux'
      ];
    } else if (command === 'touch') {
      if (!args[0]) {
        outputLines = ['touch: missing file operand'];
      } else {
        const fileName = args[0];
        const existing = activeSession.files.find(f => f.name === fileName);
        if (!existing) {
          const newFile: LabFile = {
            name: fileName,
            path: `/home/student/workspace/${fileName}`,
            content: fileName === 'report.txt' ? 'CS303 Operating Systems Audit Report\nAuthor: Student\nFile permission: Mode 640\nFindings verified.' : '',
            isReadOnly: false
          };
          setActiveSession(prev => prev ? { ...prev, files: [...prev.files, newFile] } : null);
        }
        outputLines = [];
      }
    } else if (command === 'chmod') {
      if (args.length < 2) {
        outputLines = ['chmod: missing operand after chmod'];
      } else {
        const mode = args[0];
        const fileName = args[1];
        const targetFile = activeSession.files.find(f => f.name === fileName);
        if (!targetFile) {
          outputLines = [`chmod: cannot access '${fileName}': No such file or directory`];
        } else {
          // store permission metadata in file
          (targetFile as any).permissions = mode;
          outputLines = [];
        }
      }
    } else if (command === 'stat') {
      const isFormatOctal = args.includes('-c') && args.includes('%a %n');
      const targetName = args[args.length - 1];
      const targetFile = activeSession.files.find(f => f.name === targetName);

      if (!targetFile) {
        outputLines = [`stat: cannot stat '${targetName}': No such file or directory`];
      } else {
        const perms = (targetFile as any).permissions || '644';
        if (isFormatOctal) {
          outputLines = [`${perms} ${targetFile.name}`];
        } else {
          outputLines = [
            `  File: ${targetFile.name}`,
            `  Size: ${targetFile.content.length}       Blocks: 8          IO Block: 4096   regular file`,
            `Device: 002bh/43d   Inode: 8941293     Links: 1`,
            `Access: (0${perms}/-rw-r-----)  Uid: ( 1001/ student)   Gid: ( 1001/ student)`,
            `Access: 2026-11-21 12:20:14.000000000 +0000`,
            `Modify: 2026-11-21 12:20:14.000000000 +0000`,
            `Change: 2026-11-21 12:20:14.000000000 +0000`
          ];
        }
      }
    } else if (command === 'ls') {
      const isLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
      if (isLong) {
        outputLines = ['total ' + (activeSession.files.length * 4)];
        activeSession.files.forEach(f => {
          const perms = (f as any).permissions || (f.name === 'report.txt' ? '640' : '644');
          const permStr = perms === '640' ? '-rw-r-----' : perms === '777' ? '-rwxrwxrwx' : '-rw-r--r--';
          outputLines.push(`${permStr} 1 student student ${f.content.length.toString().padStart(4, ' ')} Nov 21 12:20 ${f.name}`);
        });
      } else {
        outputLines = [activeSession.files.map(f => f.name).join('   ')];
      }
    } else if (command === 'cat') {
      if (!args[0]) {
        outputLines = ['cat: missing operand'];
      } else {
        const target = activeSession.files.find(f => f.name === args[0]);
        if (!target) {
          outputLines = [`cat: ${args[0]}: No such file or directory`];
        } else {
          outputLines = target.content ? target.content.split('\n') : ['(empty file)'];
        }
      }
    } else if (command === 'python3') {
      if (args[0] === '--version') {
        outputLines = ['Python 3.11.8 (main, Feb 2026, 14:12:00) [GCC 12.3.0] on linux'];
      } else if (args[0] === 'scheduler.py') {
        outputLines = [
          `[VirtualLab Python Runtime] Running scheduler.py...`,
          `Simulating Round Robin with Quantum q=3 on 3 processes...`,
          `PID P1: Completed at t=12, Wait Time: 7`,
          `PID P2: Completed at t=6,  Wait Time: 3`,
          `PID P3: Completed at t=16, Wait Time: 8`,
          `Average Turnaround Time (ATT): 11.33 ms`,
          `Average Waiting Time (AWT):    6.00 ms`,
          `Simulation complete. Execution time: 0.04s`
        ];
      } else {
        outputLines = [`[Python 3.11] Executed ${args[0]} successfully (Exit code: 0)`];
      }
    } else if (command === 'pytest') {
      outputLines = [
        `============================= test session starts ==============================`,
        `platform linux -- Python 3.11.8, pytest-7.4.3, pluggy-1.3.0`,
        `rootdir: /home/student/workspace`,
        `collected 2 items`,
        ``,
        `test_scheduler.py::test_single_process PASSED                            [ 50%]`,
        `test_scheduler.py::test_multiple_processes PASSED                        [100%]`,
        ``,
        `============================== 2 passed in 0.18s ===============================`
      ];
    } else if (command === 'echo') {
      const fullCmd = trimmed;
      if (fullCmd.includes('>')) {
        const match = fullCmd.match(/echo\s+["']?([^"'>]+)["']?\s*>\s*([^\s]+)/);
        if (match) {
          const text = match[1];
          const fileName = match[2];
          const file = activeSession.files.find(f => f.name === fileName);
          if (file) {
            file.content = text;
          } else {
            activeSession.files.push({
              name: fileName,
              path: `/home/student/workspace/${fileName}`,
              content: text,
              isReadOnly: false
            });
          }
          outputLines = [];
        }
      } else {
        outputLines = [args.join(' ')];
      }
    } else {
      outputLines = [`bash: ${command}: command not found. Type 'help' for available lab commands.`];
    }

    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        terminalLogs: [...prev.terminalLogs, promptLine, ...outputLines]
      };
    });
  };

  const updateSessionFile = (fileName: string, content: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = prev.files.map(f => f.name === fileName ? { ...f, content } : f);
      return { ...prev, files: updated };
    });
  };

  const createSessionFile = (fileName: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      if (prev.files.some(f => f.name === fileName)) return prev;
      const newFile: LabFile = {
        name: fileName,
        path: `/home/student/workspace/${fileName}`,
        content: '',
        isReadOnly: false
      };
      return { ...prev, files: [...prev.files, newFile] };
    });
  };

  const saveStudentAnswer = (questionId: string, value: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        studentAnswers: {
          ...prev.studentAnswers,
          [questionId]: value
        }
      };
    });
  };

  // Lab Submission & Automated/AI Evaluation Engine
  const submitLab = (labId: string, answers: Record<string, string>, terminalSnapshot: string): Submission => {
    const lab = labs.find(l => l.id === labId);
    if (!lab || !activeSession) throw new Error('No active lab session');

    // 1. Generate sha256 checksum artifact
    const artifactDigest = `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const subId = `sub-${currentUser.id}-${Date.now().toString(36)}`;

    // 2. Perform Automated Objective Checks
    const testCases: TestCaseResult[] = [];
    let objectiveEarned = 0;

    if (labId === 'lab-linux-perm') {
      const reportFile = activeSession.files.find(f => f.name === 'report.txt');
      const fileExists = Boolean(reportFile);
      const perms = (reportFile as any)?.permissions || '640';
      const is640 = perms === '640';

      testCases.push({
        id: 'tc-auto-1',
        title: 'File Existence Check: /home/student/workspace/report.txt',
        status: fileExists ? 'pass' : 'fail',
        pointsEarned: fileExists ? 3 : 0,
        maxPoints: 3,
        outputLog: fileExists
          ? `PASS: report.txt exists in staging volume (${reportFile?.content.length || 0} bytes).`
          : `FAIL: File /home/student/workspace/report.txt not found.`
      });

      testCases.push({
        id: 'tc-auto-2',
        title: 'Permission Mask Verification: Exact octal mode 640 (-rw-r-----)',
        status: is640 ? 'pass' : 'fail',
        pointsEarned: is640 ? 3 : 0,
        maxPoints: 3,
        outputLog: is640
          ? `PASS: stat -c "%a" returned 640. User rw-, Group r--, Other --- verified.`
          : `FAIL: Expected mode 640, found ${perms}.`
      });

      objectiveEarned = testCases.reduce((acc, tc) => acc + tc.pointsEarned, 0);
    } else {
      // Default positive test cases
      testCases.push({
        id: 'tc-gen-1',
        title: 'Unit Test Suite Execution',
        status: 'pass',
        pointsEarned: 6,
        maxPoints: 6,
        outputLog: 'Automated test suite passed 2/2 tests without errors.'
      });
      objectiveEarned = 6;
    }

    // 3. AI-Assisted Feedback Generator
    const q1Answer = answers['q1'] || '';
    const hasOctalExplanation = q1Answer.toLowerCase().includes('owner') || q1Answer.toLowerCase().includes('group');
    const hasSecurityReasoning = q1Answer.toLowerCase().includes('read') || q1Answer.toLowerCase().includes('least privilege') || q1Answer.toLowerCase().includes('confidential');

    let aiExplanationScore = 1.5;
    if (hasOctalExplanation && hasSecurityReasoning) {
      aiExplanationScore = 2.0;
    } else if (hasOctalExplanation || hasSecurityReasoning) {
      aiExplanationScore = 1.0;
    } else {
      aiExplanationScore = 0.5;
    }

    const aiFeedback = {
      suggestedExplanationScore: aiExplanationScore,
      maxExplanationScore: 2.0,
      clarityScore: hasSecurityReasoning ? 9 : 6,
      technicalAccuracyScore: hasOctalExplanation ? 9 : 5,
      summary: hasOctalExplanation
        ? `Solid technical explanation demonstrating clear grasp of octal bit masks and confidentiality protection.`
        : `Explanation lacks precision on how numeric octals (6, 4, 0) translate into read/write/execute flags.`,
      strengths: [
        'Clear identification of owner and group isolation roles.',
        'Practical articulation of why mode 640 prevents unauthorized read leaks compared to mode 644.'
      ],
      improvementSuggestions: [
        'Mention the concept of umask in automated file provisioning.',
        'Detail whether execute (x=1) permissions are ever appropriate for non-binary text files.'
      ],
      isAdvisory: true
    };

    const evaluation: EvaluationRun = {
      id: `eval-${subId}`,
      submissionId: subId,
      status: 'completed',
      objectiveScore: objectiveEarned,
      objectiveMaxScore: 6,
      testCases,
      aiFeedback,
      totalSuggestedScore: objectiveEarned + aiExplanationScore + 1.8,
      runAt: new Date().toISOString()
    };

    const newSubmission: Submission = {
      id: subId,
      sessionId: activeSession.id,
      labId: lab.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      courseCode: lab.courseCode,
      labTitle: lab.title,
      attemptNo: 1,
      submittedAt: new Date().toISOString(),
      artifactRef: artifactDigest,
      filesSnapshot: JSON.parse(JSON.stringify(activeSession.files)),
      answers,
      terminalSnapshot,
      evaluation,
      status: 'reviewed'
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Audit logs
    addAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'SUBMISSION_SNAPSHOT',
      targetId: subId,
      description: `Immutable submission snapshot ${subId} captured with SHA-256 hash ${artifactDigest.substring(0, 19)}...`
    });

    addAuditEvent({
      actorId: 'evaluation-engine',
      actorName: 'Automated Test Runner',
      actorRole: 'admin',
      eventType: 'AUTO_EVALUATION',
      targetId: evaluation.id,
      description: `Objective test suite completed: ${testCases.filter(t => t.status === 'pass').length}/${testCases.length} passed (${objectiveEarned}/6 pts).`
    });

    addAuditEvent({
      actorId: 'ai-evaluator-adapter',
      actorName: 'AI Evaluation Assistant',
      actorRole: 'admin',
      eventType: 'AI_FEEDBACK_GENERATED',
      targetId: evaluation.id,
      description: `Advisory rubric feedback generated for student ${currentUser.name}. Suggested explanation score: ${aiExplanationScore}/2.0.`
    });

    return newSubmission;
  };

  const publishGrade = (
    submissionId: string,
    finalScore: number,
    breakdown: Grade['breakdown'],
    notes: string
  ) => {
    const existing = submissions.find(s => s.id === submissionId);
    if (!existing) return;

    const grade: Grade = {
      id: `grd-${submissionId}`,
      submissionId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      finalScore,
      maxScore: 10,
      breakdown,
      facultyNotes: notes,
      publishedAt: new Date().toISOString(),
      status: 'published'
    };

    setSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, grade, status: 'published' } : s)
    );

    addAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'GRADE_PUBLISH',
      targetId: submissionId,
      description: `Instructor ${currentUser.name} officially published final grade ${finalScore}/10 for submission ${submissionId}.`
    });
  };

  const createNewLab = (newLab: Lab) => {
    setLabs(prev => [newLab, ...prev]);
    addAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      eventType: 'SECURITY_CHECK',
      targetId: newLab.id,
      description: `New practical lab created: '${newLab.title}' under course ${newLab.courseCode}. Template: ${newLab.templateId}.`
    });
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setLabs(INITIAL_LABS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveSession(null);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(false);
    setActiveTab('landing');
    setGuidedTourStep(1);
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
        courses,
        templates,
        labs,
        submissions,
        auditLogs,
        clusterMetrics,
        activeSession,
        activeLabId,
        setActiveLabId,
        startLabSession,
        stopLabSession,
        resetLabSession,
        reconnectLabSession,
        executeTerminalCommand,
        updateSessionFile,
        createSessionFile,
        saveStudentAnswer,
        submitLab,
        publishGrade,
        createNewLab,
        resetToDefaultData,
        guidedTourStep,
        setGuidedTourStep,
        showGuidedTour,
        setShowGuidedTour,
        liveContainerCount: clusterMetrics.activeContainers + (activeSession?.state === 'running' ? 1 : 0)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

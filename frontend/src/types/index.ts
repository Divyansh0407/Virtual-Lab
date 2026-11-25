export type UserRole = 'student' | 'teacher' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  studentId?: string;
  department: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string; // Join code for students, e.g. "OS-2026", "CS-303"
  section: string;
  teacherId: string;
  teacherName: string;
  description: string;
  color: string; // Tailwind gradient class
  studentIds: string[]; // Enrolled students
  createdAt: string;
}

export interface LabFile {
  name: string;
  path: string;
  content: string;
  isReadOnly?: boolean;
}

export interface LabQuestion {
  id: string;
  prompt: string;
  type: 'code' | 'explanation' | 'terminal_evidence';
  maxPoints: number;
  criteria: string;
}

export interface Lab {
  id: string;
  classroomId: string;
  classroomCode?: string;
  classroomName?: string;
  title: string;
  shortDescription: string;
  instructions: string; // Markdown / task instructions
  prerequisites: string[];
  dueAt: string;
  totalPoints: number;
  maxAttempts: number;
  starterFiles: LabFile[];
  questions: LabQuestion[];
  verificationScript?: string;
  status: 'published' | 'draft';
}

export type SessionState = 'queued' | 'starting' | 'running' | 'stopped' | 'failed' | 'expired';

export interface LabSession {
  id: string;
  assignmentId: string;
  labId: string;
  studentId: string;
  studentName: string;
  containerRef: string;
  state: SessionState;
  startedAt: string;
  expiresAt: string;
  durationMinutes: number;
  timeRemainingSeconds: number;
  cpuPercent: number;
  memoryMB: number;
  maxMemoryMB: number;
  activePids: number;
  networkEgressBlocked: boolean;
  terminalLogs: string[];
  files: LabFile[];
  studentAnswers: Record<string, string>;
  ticket?: string;
  wsEndpoint?: string;
  errorMessage?: string;
}

export interface Grade {
  score: number;
  maxScore: number;
  feedback: string;
  gradedAt: string;
  gradedBy: string;
}

export interface Submission {
  id: string;
  labId: string;
  labTitle: string;
  classroomId: string;
  classroomName: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answers: Record<string, string>;
  terminalSnapshot: string;
  filesSnapshot: LabFile[];
  grade?: Grade;
  status: 'submitted' | 'graded';
}

export interface Course extends Classroom {
  title: string;
  instructorId: string;
  instructorName: string;
  studentCount: number;
  term?: string;
}

export interface EnvironmentTemplate {
  id: string;
  name: string;
  approvedImage: string;
  tag: string;
  category: string;
  cpuLimit: string;
  memoryLimitMB: number;
  timeoutMinutes: number;
  nonRootUser: string;
  isVerified: boolean;
  description: string;
}

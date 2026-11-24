export type UserRole = 'student' | 'faculty' | 'admin';

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

export interface Course {
  id: string;
  code: string;
  title: string;
  term: string;
  instructorId: string;
  instructorName: string;
  description: string;
  studentCount: number;
  color: string;
}

export interface EnvironmentTemplate {
  id: string;
  name: string;
  approvedImage: string;
  tag: string;
  category: 'Linux Shell' | 'Python' | 'C/C++' | 'Data Science';
  cpuLimit: string;
  memoryLimitMB: number;
  timeoutMinutes: number;
  nonRootUser: string;
  isVerified: boolean;
  policyId: string;
  description: string;
}

export interface LabQuestion {
  id: string;
  prompt: string;
  type: 'code' | 'explanation' | 'terminal_evidence';
  maxPoints: number;
  criteria: string;
  placeholder?: string;
}

export interface LabFile {
  name: string;
  path: string;
  content: string;
  isReadOnly?: boolean;
}

export interface Lab {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  shortDescription: string;
  instructions: string; // Markdown / structured guide
  prerequisites: string[];
  templateId: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  dueAt: string;
  totalPoints: number;
  maxAttempts: number;
  starterFiles: LabFile[];
  questions: LabQuestion[];
  verificationScript: string; // automated check definition
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

export interface TestCaseResult {
  id: string;
  title: string;
  status: 'pass' | 'fail';
  pointsEarned: number;
  maxPoints: number;
  outputLog?: string;
}

export interface EvaluationRun {
  id: string;
  submissionId: string;
  status: 'completed' | 'running' | 'failed';
  objectiveScore: number;
  objectiveMaxScore: number;
  testCases: TestCaseResult[];
  aiFeedback?: {
    suggestedExplanationScore: number;
    maxExplanationScore: number;
    clarityScore: number;
    technicalAccuracyScore: number;
    summary: string;
    strengths: string[];
    improvementSuggestions: string[];
    isAdvisory: boolean;
  };
  totalSuggestedScore: number;
  runAt: string;
}

export interface Grade {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  finalScore: number;
  maxScore: number;
  breakdown: {
    automatedCheckPoints: number;
    writtenExplanationPoints: number;
    evidenceCompletenessPoints: number;
  };
  facultyNotes: string;
  publishedAt: string | null;
  status: 'draft' | 'published';
}

export interface Submission {
  id: string;
  sessionId: string;
  labId: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  labTitle: string;
  attemptNo: number;
  submittedAt: string;
  artifactRef: string; // SHA-256 hash
  filesSnapshot: LabFile[];
  answers: Record<string, string>;
  terminalSnapshot: string;
  evaluation?: EvaluationRun;
  grade?: Grade;
  status: 'submitted' | 'evaluating' | 'reviewed' | 'published';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: 'CONTAINER_LAUNCH' | 'CONTAINER_STOP' | 'SUBMISSION_SNAPSHOT' | 'AUTO_EVALUATION' | 'AI_FEEDBACK_GENERATED' | 'GRADE_OVERRIDE' | 'GRADE_PUBLISH' | 'SECURITY_CHECK' | 'AUTH_LOGIN' | 'AUTH_SIGNUP' | 'AUTH_LOGOUT';
  targetId: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface SystemClusterMetrics {
  hostName: string;
  hostIp: string;
  osKernel: string;
  dockerVersion: string;
  activeContainers: number;
  maxContainerCapacity: number;
  cpuUtilization: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  diskUsedGB: number;
  diskTotalGB: number;
  queuedLaunches: number;
  networkStatus: 'Normal' | 'Degraded' | 'Throttled';
}

import {
  User,
  Course,
  EnvironmentTemplate,
  Lab,
  Submission,
  AuditEvent,
  SystemClusterMetrics
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'student-1',
    name: 'Divyansh Sharma',
    email: 'divyansh.sharma@university.edu',
    password: 'divyansh@123',
    role: 'student',
    studentId: 'STU-2026-8841',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-2',
    name: 'Harshvardhan Gupta',
    email: 'harshvardhan.gupta@university.edu',
    password: 'harsh@123',
    role: 'student',
    studentId: 'STU-2026-9210',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'faculty-1',
    name: 'Garvit Dohare',
    email: 'garvit.dohare@university.edu',
    password: 'garvit@123',
    role: 'faculty',
    studentId: 'FAC-2026-104',
    department: 'Systems & Operating Systems Lab',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-1',
    name: 'Akshita',
    email: 'akshita@admin.university.edu',
    password: 'akshita@123',
    role: 'admin',
    studentId: 'ADM-2026-001',
    department: 'Campus Cloud & Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-cs303',
    code: 'CS303',
    title: 'Operating Systems & Systems Programming',
    term: 'Fall 2026',
    instructorId: 'faculty-1',
    instructorName: 'Garvit Dohare',
    description: 'Hands-on exploration of POSIX APIs, file system semantics, process virtualization, concurrency, and virtual memory isolation.',
    studentCount: 48,
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'course-cs201',
    code: 'CS201',
    title: 'Data Structures & Algorithms Laboratory',
    term: 'Fall 2026',
    instructorId: 'faculty-1',
    instructorName: 'Garvit Dohare',
    description: 'Practical implementation of self-balancing trees, graphs, sorting heuristics, memory profiling, and algorithmic complexity verification.',
    studentCount: 62,
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'course-net401',
    code: 'NET401',
    title: 'Distributed Networks & Cloud Infrastructure',
    term: 'Fall 2026',
    instructorId: 'faculty-1',
    instructorName: 'Garvit Dohare',
    description: 'Socket programming, multi-threaded HTTP servers, TCP windowing, network namespaces, and container networking.',
    studentCount: 36,
    color: 'from-purple-600 to-indigo-800'
  }
];

export const INITIAL_TEMPLATES: EnvironmentTemplate[] = [
  {
    id: 'tmpl-ubuntu-shell',
    name: 'Ubuntu Linux 22.04 LTS (Systems Shell)',
    approvedImage: 'virtuallab-registry.local/ubuntu-shell:22.04-hardened',
    tag: 'v2.4-rootless',
    category: 'Linux Shell',
    cpuLimit: '1.0 vCPU',
    memoryLimitMB: 512,
    timeoutMinutes: 90,
    nonRootUser: 'student (UID 1001)',
    isVerified: true,
    policyId: 'POL-RESTRICTED-NET-V1',
    description: 'Hardened rootless container with GNU Coreutils, Bash 5.2, Vim, Nano, Git, and automated test hooks. Egress network strictly filtered.'
  },
  {
    id: 'tmpl-python-base',
    name: 'Python 3.11 Compute & Testing Sandbox',
    approvedImage: 'virtuallab-registry.local/python-runtime:3.11-slim',
    tag: 'v3.11-std',
    category: 'Python',
    cpuLimit: '1.5 vCPU',
    memoryLimitMB: 1024,
    timeoutMinutes: 120,
    nonRootUser: 'appuser (UID 1000)',
    isVerified: true,
    policyId: 'POL-PYTHON-SAFE-EXEC',
    description: 'Preconfigured Python 3.11 environment with pytest, NumPy, SciPy, tabulate, and memory profiling harnesses.'
  },
  {
    id: 'tmpl-gcc-cpp',
    name: 'GCC 12 & Valgrind Systems Workbench',
    approvedImage: 'virtuallab-registry.local/gcc-toolchain:12.3',
    tag: 'v1.8',
    category: 'C/C++',
    cpuLimit: '2.0 vCPU',
    memoryLimitMB: 1024,
    timeoutMinutes: 90,
    nonRootUser: 'builder (UID 1002)',
    isVerified: true,
    policyId: 'POL-NATIVE-COMPILE',
    description: 'Equipped with GCC 12, GDB, Valgrind, Make, CMake, and address sanitizer support for low-level systems lab assignments.'
  },
  {
    id: 'tmpl-jupyter',
    name: 'JupyterLab Scientific Notebook',
    approvedImage: 'virtuallab-registry.local/jupyter-datasci:2026.1',
    tag: 'v1.2',
    category: 'Data Science',
    cpuLimit: '2.0 vCPU',
    memoryLimitMB: 2048,
    timeoutMinutes: 180,
    nonRootUser: 'jovyan (UID 1000)',
    isVerified: true,
    policyId: 'POL-JUPYTER-NOTEBOOK',
    description: 'Web notebook container with Pandas, Matplotlib, Seaborn, and Scikit-Learn with auto-snapshot on checkpoint.'
  }
];

export const INITIAL_LABS: Lab[] = [
  {
    id: 'lab-linux-perm',
    courseId: 'course-cs303',
    courseCode: 'CS303',
    title: 'Lab 04: Linux File Permissions & Access Control',
    shortDescription: 'Implement POSIX file permissions (mode 640), analyze octal masks, and demonstrate security principle of least privilege.',
    version: '1.2.0',
    status: 'published',
    dueAt: '2026-11-28T23:59:00Z',
    totalPoints: 10,
    maxAttempts: 3,
    templateId: 'tmpl-ubuntu-shell',
    prerequisites: ['Basic Bash navigation (cd, ls, pwd)', 'Understanding of UNIX file system hierarchies', 'Binary to octal conversions'],
    instructions: `### Objective
Demonstrate an understanding of standard Linux file permissions (read, write, execute), octal notation, and access control for files containing sensitive audit data.

### Task Specifications
1. Launch your isolated **Ubuntu 22.04 LTS** container.
2. In your workspace directory \`/home/student/workspace\`, create a file named \`report.txt\`.
3. Add a brief title and your student findings inside \`report.txt\`.
4. Use the \`chmod\` utility to set its octal permission mode to **\`640\`** (\`-rw-r-----\`).
5. Verify the permissions using \`ls -la report.txt\` or \`stat -c "%a %n" report.txt\`.
6. Answer the rubric-evaluated explanation questions in the submission form below.

### Evaluation Criteria (10 Points)
* **Automated Check (6 Points):** Automated test runner will verify file presence \`/home/student/workspace/report.txt\` and assert exact permission bits match octal \`640\`.
* **Written Explanation (2 Points):** AI & Faculty evaluated explanation of user, group, and other bit masks.
* **Evidence & Completeness (2 Points):** Accurate command output log snapshot and reason for choosing 640 over 777 or 644.`,
    starterFiles: [
      {
        name: 'instructions.txt',
        path: '/home/student/workspace/instructions.txt',
        content: `VIRTUAL LAB EXERCISE: CS303 LAB 04
Task: Create report.txt with permission mode 640.
Owner: Read + Write (6)
Group: Read only (4)
Others: No permissions (0)

Verify with: stat -c "%a %n" report.txt`,
        isReadOnly: true
      },
      {
        name: 'notes.md',
        path: '/home/student/workspace/notes.md',
        content: `# Student Scratchpad\nDraft your reasoning here before final submission.`,
        isReadOnly: false
      }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Explain the owner, group, and other permissions represented by octal mode 640. Why would a confidential enterprise report or exam paper use 640 instead of 644 or 777?',
        type: 'explanation',
        maxPoints: 2,
        criteria: 'Clarity on octal bit mapping (Owner: rw-=6, Group: r--=4, Others: ---=0) and least-privilege security rationale.',
        placeholder: 'Octal 640 translates into...\nOwner: ...\nGroup: ...\nOthers: ...\nWhy 640 is superior to 644/777 for sensitive files: ...'
      },
      {
        id: 'q2',
        prompt: 'Paste the terminal verification output demonstrating the file existence and mode (e.g. output from `ls -l report.txt` or `stat report.txt`).',
        type: 'terminal_evidence',
        maxPoints: 2,
        criteria: 'Presence of valid permission string (-rw-r-----) and correct filename.',
        placeholder: '-rw-r----- 1 student student 142 Nov 21 12:15 report.txt'
      }
    ],
    verificationScript: `#!/bin/bash
TARGET="/home/student/workspace/report.txt"
if [ ! -f "$TARGET" ]; then
  echo "FAIL: File $TARGET does not exist"
  exit 1
fi
PERMS=$(stat -c "%a" "$TARGET")
if [ "$PERMS" != "640" ]; then
  echo "FAIL: Expected permissions 640, found $PERMS"
  exit 2
fi
echo "PASS: File exists and permissions are 640 (-rw-r-----)"
exit 0`
  },
  {
    id: 'lab-python-scheduler',
    courseId: 'course-cs303',
    courseCode: 'CS303',
    title: 'Lab 05: CPU Round-Robin Scheduling & Context Switching',
    shortDescription: 'Implement round-robin time-quantum slicing in Python 3.11 and measure average turnaround time under burst workloads.',
    version: '1.0.1',
    status: 'published',
    dueAt: '2026-12-05T23:59:00Z',
    totalPoints: 10,
    maxAttempts: 2,
    templateId: 'tmpl-python-base',
    prerequisites: ['Python object-oriented programming', 'Queue data structures', 'Operating systems scheduling basics'],
    instructions: `### Objective
Implement the classical Round Robin (RR) CPU scheduling algorithm with an arbitrary time quantum $q$.

### Specifications
1. Open \`scheduler.py\` in the workspace editor.
2. Complete the \`round_robin(processes, quantum)\` generator function.
3. Track and return:
   - Completion time for each PID
   - Total waiting time
   - Average turnaround time (ATT)
4. Execute test suite with \`pytest test_scheduler.py\` in the integrated console.`,
    starterFiles: [
      {
        name: 'scheduler.py',
        path: '/home/student/workspace/scheduler.py',
        content: `"""
CS303 Lab 05: Round Robin Scheduler
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class Process:
    pid: str
    arrival_time: int
    burst_time: int

def round_robin(processes: List[Process], quantum: int) -> Dict[str, float]:
    # TODO: Implement Round Robin queue scheduling algorithm
    # Return dictionary with average_turnaround_time and average_waiting_time
    pass
`,
        isReadOnly: false
      },
      {
        name: 'test_scheduler.py',
        path: '/home/student/workspace/test_scheduler.py',
        content: `from scheduler import Process, round_robin

def test_single_process():
    procs = [Process("P1", 0, 10)]
    result = round_robin(procs, 2)
    assert result["P1_completion"] == 10

def test_multiple_processes():
    procs = [
        Process("P1", 0, 5),
        Process("P2", 0, 3),
        Process("P3", 0, 8),
    ]
    result = round_robin(procs, 3)
    assert result is not None
`,
        isReadOnly: true
      }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Analyze what happens to system performance and context switching overhead when time quantum $q$ approaches 0 versus when $q$ approaches $\\infty$.',
        type: 'explanation',
        maxPoints: 4,
        criteria: 'Clear explanation of processor thrashing vs FIFO degradation.',
        placeholder: 'As q -> 0, CPU spends excessive cycles in context switching overhead...\nAs q -> inf, Round Robin degenerates into FCFS (First Come First Served)...'
      }
    ],
    verificationScript: `pytest -v /home/student/workspace/test_scheduler.py`
  },
  {
    id: 'lab-socket-server',
    courseId: 'course-net401',
    courseCode: 'NET401',
    title: 'Lab 03: Multi-Threaded TCP Echo & HTTP Request Parser',
    shortDescription: 'Construct a concurrent non-blocking TCP socket server in C with pthread worker pooling and HTTP GET parsing.',
    version: '1.0.0',
    status: 'published',
    dueAt: '2026-12-10T23:59:00Z',
    totalPoints: 10,
    maxAttempts: 3,
    templateId: 'tmpl-gcc-cpp',
    prerequisites: ['C socket API (socket, bind, listen, accept)', 'POSIX threads (pthread_create)', 'HTTP/1.1 message structure'],
    instructions: `### Objective
Develop a robust C TCP server listening on loopback port 8080 that can handle concurrent HTTP requests without hanging or leaking memory descriptors.`,
    starterFiles: [
      {
        name: 'server.c',
        path: '/home/student/workspace/server.c',
        content: `// NET401 Lab 03 - Concurrent HTTP Server\n#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <sys/socket.h>\n#include <netinet/in.h>\n\nint main() {\n    printf("TCP Server Initializing on 127.0.0.1:8080...\\n");\n    return 0;\n}`,
        isReadOnly: false
      }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Describe how your implementation prevents zombie thread accumulation and socket descriptor exhaustion.',
        type: 'explanation',
        maxPoints: 4,
        criteria: 'Discussion of pthread_detach or pthread_join and proper close() invocation on client sockets.',
        placeholder: 'To prevent descriptor leaks, client sockets are closed in the worker routine...'
      }
    ],
    verificationScript: `gcc -Wall -Wextra server.c -o server && ./test_runner.sh`
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-harsh-01',
    sessionId: 'sess-harsh-linux',
    labId: 'lab-linux-perm',
    studentId: 'student-2',
    studentName: 'Harshvardhan Gupta',
    courseCode: 'CS303',
    labTitle: 'Lab 04: Linux File Permissions & Access Control',
    attemptNo: 1,
    submittedAt: '2026-11-20T16:45:10Z',
    artifactRef: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    filesSnapshot: [
      {
        name: 'report.txt',
        path: '/home/student/workspace/report.txt',
        content: 'CS303 AUDIT REPORT\nStudent: Harshvardhan Gupta\nExperiment: File permission security audit.\nStatus: Verified mode 640.'
      }
    ],
    answers: {
      q1: 'Mode 640 translates into: Owner has Read (4) and Write (2) = 6; Group has Read (4) = 4; Others have No permissions (0) = 0. In an enterprise setting, 640 is crucial because it permits the creator to modify the file, trusted group members (such as sysadmin or auditor group) to inspect it, but completely locks out general untrusted users. Mode 644 gives public read access which causes data exfiltration, while 777 dangerously grants arbitrary execution and tampering.',
      q2: '-rw-r----- 1 student student 112 Nov 20 16:42 report.txt\nOwner: student (rw-)\nGroup: student (r--)\nOthers: (---)'
    },
    terminalSnapshot: `$ touch report.txt\n$ chmod 640 report.txt\n$ stat -c "%a %n" report.txt\n640 report.txt\n$ ls -l report.txt\n-rw-r----- 1 student student 112 Nov 20 16:42 report.txt`,
    status: 'published',
    evaluation: {
      id: 'eval-harsh-01',
      submissionId: 'sub-harsh-01',
      status: 'completed',
      objectiveScore: 6,
      objectiveMaxScore: 6,
      testCases: [
        {
          id: 'tc-1',
          title: 'Verify report.txt existence in workspace',
          status: 'pass',
          pointsEarned: 3,
          maxPoints: 3,
          outputLog: 'File found: /home/student/workspace/report.txt (112 bytes)'
        },
        {
          id: 'tc-2',
          title: 'Verify octal permission mode is exactly 640 (-rw-r-----)',
          status: 'pass',
          pointsEarned: 3,
          maxPoints: 3,
          outputLog: 'Permission bits: 0640. Matches expected specification.'
        }
      ],
      aiFeedback: {
        suggestedExplanationScore: 2.0,
        maxExplanationScore: 2.0,
        clarityScore: 10,
        technicalAccuracyScore: 10,
        summary: 'Exemplary submission with accurate octal arithmetic and clear principle of least privilege reasoning.',
        strengths: [
          'Correctly decoupled owner (6), group (4), and others (0) bit representations.',
          'Articulated the risk of 644 (unintended confidentiality breach) and 777 (integrity loss).'
        ],
        improvementSuggestions: [
          'Could additionally mention the umask setting (e.g. umask 027) that automates creating files with 640 default permissions.'
        ],
        isAdvisory: true
      },
      totalSuggestedScore: 9.8,
      runAt: '2026-11-20T16:45:15Z'
    },
    grade: {
      id: 'grd-harsh-01',
      submissionId: 'sub-harsh-01',
      reviewerId: 'faculty-1',
      reviewerName: 'Garvit Dohare',
      finalScore: 10,
      maxScore: 10,
      breakdown: {
        automatedCheckPoints: 6,
        writtenExplanationPoints: 2,
        evidenceCompletenessPoints: 2
      },
      facultyNotes: 'Excellent work Harshvardhan. Precise explanation and flawless terminal evidence.',
      publishedAt: '2026-11-20T17:10:00Z',
      status: 'published'
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-11-21T09:12:04Z',
    actorId: 'admin-1',
    actorName: 'Akshita',
    actorRole: 'admin',
    eventType: 'SECURITY_CHECK',
    targetId: 'tmpl-ubuntu-shell',
    description: 'Vulnerability scan completed for container image virtuallab/ubuntu-shell:22.04. 0 CVEs detected. Policy POL-RESTRICTED-NET-V1 verified.'
  },
  {
    id: 'aud-002',
    timestamp: '2026-11-21T10:05:30Z',
    actorId: 'faculty-1',
    actorName: 'Garvit Dohare',
    actorRole: 'faculty',
    eventType: 'GRADE_PUBLISH',
    targetId: 'sub-harsh-01',
    description: 'Published final grade 10/10 for student Harshvardhan Gupta on Lab 04.'
  },
  {
    id: 'aud-003',
    timestamp: '2026-11-21T10:45:00Z',
    actorId: 'student-2',
    actorName: 'Harshvardhan Gupta',
    actorRole: 'student',
    eventType: 'CONTAINER_STOP',
    targetId: 'sess-harsh-linux',
    description: 'Container vl-worker-harshvardhan-9921 gracefully terminated after submission snapshot. Writable layer pruned; submission artifact persisted to immutable store.'
  }
];

export const INITIAL_CLUSTER_METRICS: SystemClusterMetrics = {
  hostName: 'compute-node-us-east-01.virtuallab.internal',
  hostIp: '10.240.12.84',
  osKernel: 'Linux 6.2.0-39-generic x86_64',
  dockerVersion: 'Docker Engine v24.0.7 (containerd 1.7.2)',
  activeContainers: 14,
  maxContainerCapacity: 45,
  cpuUtilization: 28.4,
  memoryUsedGB: 18.2,
  memoryTotalGB: 64.0,
  diskUsedGB: 142.5,
  diskTotalGB: 512.0,
  queuedLaunches: 0,
  networkStatus: 'Normal'
};

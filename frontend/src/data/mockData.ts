import {
  User,
  Classroom,
  Lab,
  Submission,
  EnvironmentTemplate
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'student-1',
    name: 'Divyansh Sharma',
    email: 'student@virtuallab.edu',
    password: 'student@123',
    role: 'student',
    studentId: 'STU-2026-01',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher-1',
    name: 'Prof. Garvit Dohare',
    email: 'teacher@virtuallab.edu',
    password: 'teacher@123',
    role: 'teacher',
    studentId: 'FAC-2026-01',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-os',
    name: 'Operating Systems & Linux Lab',
    code: 'OS-303',
    section: 'Batch A (Fall 2026)',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Garvit Dohare',
    description: 'Hands-on practicals in Linux shell navigation, file permissions, process inspection, and bash automation.',
    color: 'from-blue-600 to-indigo-700',
    studentIds: ['student-1'],
    createdAt: '2026-11-01T09:00:00Z'
  }
];

export const INITIAL_LABS: Lab[] = [
  {
    id: 'lab-linux-perm',
    classroomId: 'cls-os',
    classroomCode: 'OS-303',
    classroomName: 'Operating Systems & Linux Lab',
    title: 'Lab 01: Linux Fundamentals & File Permissions',
    shortDescription: 'Audit file permissions, configure secure octal mode (640), and test commands inside a live Linux container.',
    instructions: `### Objective
Learn how to inspect the system environment, manipulate files, and audit file access permissions in a hardened Linux container.

### Step-by-Step Practical Tasks:
1. **Check Environment Identity:**
   Verify that you are running as an unprivileged \`student\` user:
   \`\`\`bash
   whoami
   pwd
   \`\`\`

2. **Inspect Workspace Files:**
   List all files including hidden ones with permissions:
   \`\`\`bash
   ls -la
   \`\`\`

3. **Configure File Permissions:**
   Restrict \`report.txt\` so that:
   - **Owner (you)** has Read and Write (\`rw-\`)
   - **Group** has Read-only (\`r--\`)
   - **Others** have No access (\`---\`)
   \`\`\`bash
   chmod 640 report.txt
   \`\`\`

4. **Verify Your Changes:**
   Confirm that the file now shows \`-rw-r-----\`:
   \`\`\`bash
   ls -l report.txt
   \`\`\`

5. **Execute Script:**
   Make \`practice.sh\` executable and run it:
   \`\`\`bash
   chmod +x practice.sh
   ./practice.sh
   \`\`\`

6. **Submit:**
   Go to the **Submit Lab** tab, answer the questions, and click **Final Submit Lab**.`,
    prerequisites: ['Basic terminal commands (whoami, pwd, ls)', 'Understanding octal permission notation (r=4, w=2, x=1)'],
    dueAt: '2026-12-30T23:59:00Z',
    totalPoints: 10,
    maxAttempts: 3,
    status: 'published',
    starterFiles: [
      {
        name: 'instructions.txt',
        path: '/home/student/instructions.txt',
        content: `=== VirtualLab Demo Practical ===
Objective: Configure report.txt with mode 640 (-rw-r-----).
Use 'whoami', 'ls -la', and 'chmod 640 report.txt'.`,
        isReadOnly: true
      },
      {
        name: 'report.txt',
        path: '/home/student/report.txt',
        content: `# System Audit & Lab Report
Student: Divyansh Sharma
Date: 2026-11-24

Task: Restrict permissions to mode 640.
Owner: Read + Write
Group: Read-only
Others: None`,
        isReadOnly: false
      },
      {
        name: 'practice.sh',
        path: '/home/student/practice.sh',
        content: `#!/bin/bash
echo "=== VirtualLab Linux Container Demo ==="
echo "Host OS: $(uname -s -r)"
echo "Current User: $(whoami)"
echo "Current Directory: $(pwd)"
echo "Files in Workspace:"
ls -l
`,
        isReadOnly: false
      }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Explain what octal mode 640 means for Owner, Group, and Others, and why sensitive audit reports use this mode.',
        type: 'explanation',
        maxPoints: 5,
        criteria: 'Correct breakdown of 6 (rw-), 4 (r--), 0 (---).'
      },
      {
        id: 'q2',
        prompt: 'Paste the exact output of "ls -l report.txt" after executing chmod 640.',
        type: 'terminal_evidence',
        maxPoints: 5,
        criteria: 'Expected output showing -rw-r----- report.txt.'
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export const INITIAL_TEMPLATES: EnvironmentTemplate[] = [
  {
    id: 'tmpl-ubuntu-shell',
    name: 'Ubuntu Linux 24.04 LTS (Systems Shell)',
    approvedImage: 'virtuallab-linux:1.0',
    tag: '1.0',
    category: 'Linux Shell',
    cpuLimit: '0.25 vCPU',
    memoryLimitMB: 128,
    timeoutMinutes: 30,
    nonRootUser: 'student (UID 1000)',
    isVerified: true,
    description: 'Hardened disposable Ubuntu 24.04 container with coreutils, bash, vim, nano, and python3. Resource constrained with no network access.'
  }
];

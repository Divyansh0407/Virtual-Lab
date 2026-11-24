# VirtualLab - AWS EC2 Backend Service (Phase 1 & Phase 2)

## Overview

VirtualLab is a cloud-based interactive Linux laboratory platform designed for universities. This backend service runs directly on an **AWS EC2 instance (Ubuntu 24.04 LTS)** with Docker Engine installed. It manages isolated student container sessions, exposes bidirectional WebSocket terminal streams powered by `@xterm/xterm` and `Dockerode`, and persists all session activity and Linux command history to **AWS DynamoDB** via the EC2 instance role (`VirtualLabEC2Role`).

> [!WARNING]
> **Academic Prototype Security Disclaimer**:
> This platform is an educational academic prototype. Standard Docker containerization shares the host Linux kernel. While student containers run under strict non-root policies (`student`, UID 1001), drop all Linux capabilities (`CapDrop: ['ALL']`), enforce `no-new-privileges`, and disable network egress (`network: none`), standard containers do **not** provide hypervisor-level isolation (e.g. AWS Firecracker / Kata Containers) against arbitrary untrusted users attempting zero-day host kernel exploits.

---

## Architecture & Data Flow

```
+-------------------------------------------------------------+
|                     Student Laptop                          |
|  - React + Vite Frontend (http://localhost:5173)            |
|  - @xterm/xterm + FitAddon interactive terminal             |
+------------------------------+------------------------------+
                               |
                   SSH Tunnel  | -L 5000:127.0.0.1:5000
                               v
+-------------------------------------------------------------+
|               AWS EC2 (Ubuntu 24.04 LTS)                    |
|                                                             |
|  VirtualLab Express & WebSocket Server (127.0.0.1:5000)     |
|   - GET  /api/health (Includes Docker & DynamoDB metrics)   |
|   - POST /api/labs/launch                                   |
|   - GET  /api/labs/:id/status                               |
|   - GET  /api/labs/:id/history (Paginated command logs)     |
|   - DELETE /api/labs/:id                                    |
|   - WS   /ws/terminal/:id?ticket=...                        |
|                                                             |
|  Dockerode (Connected via /var/run/docker.sock)             |
|   - Container 1: virtuallab-linux:1.0 (student1)            |
|   - Container 2: virtuallab-linux:1.0 (student2)            |
|     (Network: none | PROMPT_COMMAND="history -a")           |
|                                                             |
|  Real-time Command Stream (tail -F /tmp/.vl_history)        |
|   -> Redaction & Bounded Queue Worker (with retries)        |
+------------------------------+------------------------------+
                               |
             IAM Instance Role | VirtualLabEC2Role
             Default Chain     | (No AWS keys needed)
                               v
+-------------------------------------------------------------+
|               AWS DynamoDB (ap-south-1)                     |
|                                                             |
|  Table: VirtualLabCommandLogs                               |
|   - Partition Key: sessionId (String)                       |
|   - Sort Key:      eventId   (String: ISO_seq_uuid)         |
|   - Event Types:   COMMAND_HISTORY, LAB_STARTED, LAB_STOPPED|
+-------------------------------------------------------------+
```

---

## Phase 2: DynamoDB Command Logging Architecture

### 1. Zero Credential Requirement (IAM Role)
The EC2 instance is assigned the IAM Role `VirtualLabEC2Role` with permissions:
- `dynamodb:PutItem`
- `dynamodb:GetItem`
- `dynamodb:Query`
- `dynamodb:DescribeTable`

The AWS SDK v3 client initializes with `{ region: config.awsRegion }`, naturally resolving credentials from the **EC2 Instance Metadata Service (IMDS)** via the default credential provider chain. **No AWS access keys or secrets are ever stored, configured, or committed.**

### 2. Shell-Level Command Capture Mechanism
Rather than capturing noisy raw WebSocket keystrokes (which include backspaces, arrow-key escape sequences, Tab completions, and interactive text from `nano`/`vim`), command capture occurs at the **Bash readline execution boundary**:

1. **Controlled Shell Initialization**:
   When a terminal session connects, an initialization script creates `/tmp/.vl_bashrc` and `/tmp/.vl_history` in the container's tmpfs:
   ```bash
   if [ -f /home/student/.bashrc ]; then . /home/student/.bashrc; fi
   export HISTFILE=/tmp/.vl_history
   export HISTSIZE=10000
   export HISTFILESIZE=10000
   export HISTCONTROL=ignoredups
   shopt -s histappend
   export PROMPT_COMMAND="history -a"
   ```
2. **Immediate Append**:
   Whenever a command finishes executing, `PROMPT_COMMAND` triggers `history -a`, immediately appending the completed command line to `/tmp/.vl_history`.
3. **Structured Real-Time Streaming**:
   The backend attaches a companion `tail -n 0 -F /tmp/.vl_history` exec stream to the container. As new lines are appended, they are streamed in real time to the Node.js backend.
4. **Why No Docker Image Rebuild Was Needed**:
   Standard core utilities (`bash`, `sh`, `tail`, `touch`, `cat`) are already present in Ubuntu 24.04 and `virtuallab-linux:1.0`. The integration runs entirely at runtime in the ephemeral `/tmp` tmpfs.
5. **Container Security Maintained**:
   - The student container's network remains **completely detached** (`network: none`).
   - The student container has **zero access** to AWS credentials, instance metadata, or the Docker socket.

### 3. DynamoDB Record Schema

Table: `VirtualLabCommandLogs`
- **Partition Key**: `sessionId` (String) — actual backend-generated session ID.
- **Sort Key**: `eventId` (String) — `${isoTimestamp}_${seq}_${uuid}` (strictly monotonic, globally unique, chronologically sortable).

| Field | Type | Description |
|---|---|---|
| `sessionId` | String | Unique server-side session identifier (e.g. `sess_student1_...`) |
| `eventId` | String | Chronological sort key (e.g. `2026-11-24T08:35:12.345Z_000001_8f3de860...`) |
| `studentId` | String | Authenticated student identity |
| `studentName` | String | Student display name |
| `labId` | String | Target lab identifier (e.g. `lab-linux-perm`) |
| `containerId` | String | First 12 characters of associated Docker container ID |
| `command` | String | Sanitized and redacted command string or lifecycle message |
| `timestamp` | String | ISO 8601 UTC timestamp |
| `eventType` | String | `COMMAND_HISTORY`, `LAB_STARTED`, or `LAB_STOPPED` |
| `exitCode` | Number | Optional process exit code |

### 4. Reliability & Sensitive Input Protection
- **Non-blocking Execution**: Commands are pushed to an in-memory bounded queue (`maxQueueSize = 1000`). Terminal execution is never blocked by database latency.
- **Retry Mechanism**: Transient DynamoDB errors trigger exponential backoff retries (up to 3 attempts). Permanent failures increment `totalEventsFailed` without crashing the process.
- **Graceful Shutdown Flush**: When a session stops or server shuts down, `flushQueue()` waits for pending events to persist before container teardown.
- **Persistence After Teardown**: Command logs exist in DynamoDB and remain fully queryable even after containers are stopped and deleted.
- **Secret Redaction**: Commands are filtered before storage:
  - AWS keys (`AKIA...`) -> `[REDACTED_AWS_KEY]`
  - Passwords (`--password=...`, `-p secret`) -> `[REDACTED_PASS]`
  - Tokens (`Bearer ...`, `token=...`) -> `[REDACTED_TOKEN]`
  - Private key blocks -> `[REDACTED_PRIVATE_KEY]`

---

## Deployment Steps on AWS EC2

### Step 1: Connect to AWS EC2 Instance
```bash
ssh -i "path/to/your-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

### Step 2: Update Code on EC2
```bash
cd /home/ubuntu/virtuallab-backend
git pull origin main
```

### Step 3: Install Required Dependencies
Install the newly added AWS SDK v3 client and document libraries:
```bash
npm install
```

### Step 4: Verify `.env` Configuration
Ensure `.env` contains the DynamoDB configuration:
```ini
PORT=5000
HOST=127.0.0.1
NODE_ENV=production
DOCKER_SOCKET=/var/run/docker.sock
LAB_DOCKER_IMAGE=virtuallab-linux:1.0
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_GLOBAL_CONCURRENT_LABS=2
MAX_STUDENT_CONCURRENT_LABS=1
SESSION_DURATION_MINUTES=30
TICKET_TTL_SECONDS=60
CONTAINER_MEMORY_LIMIT_MB=128
CONTAINER_CPU_LIMIT=0.25
CONTAINER_PIDS_LIMIT=64
WS_RATE_LIMIT_MESSAGES_PER_SEC=100

# AWS DynamoDB Configuration (Phase 2)
AWS_REGION=ap-south-1
DYNAMODB_TABLE_NAME=VirtualLabCommandLogs
COMMAND_LOGGING_ENABLED=true
```

### Step 5: Run Automated Verification Suite
Run the test suite on EC2 to verify all 19 tests pass:
```bash
npm test
```

### Step 6: Start / Restart the Backend Service
```bash
# If using PM2:
pm2 restart virtuallab-backend || pm2 start src/server.js --name virtuallab-backend
pm2 logs virtuallab-backend --lines 25
```

---

## Verifying in AWS DynamoDB Console

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Select Region: **ap-south-1 (Asia Pacific - Mumbai)**.
3. Navigate to **DynamoDB** -> **Tables** -> **VirtualLabCommandLogs**.
4. Click **Explore table items**.
5. You will see:
   - Partition Key (`sessionId`): The exact session identifier (e.g. `sess_student1_...`).
   - Sort Key (`eventId`): Chronologically ordered event timestamps.
   - Initial lifecycle event: `eventType = 'LAB_STARTED'`.
   - Each executed command: `eventType = 'COMMAND_HISTORY'`, with the clean command string.
   - Final lifecycle event: `eventType = 'LAB_STOPPED'`.

---

## API Testing Instructions (via SSH Port Forwarding)

With SSH tunnel active (`ssh -L 5000:127.0.0.1:5000 ubuntu@<EC2_PUBLIC_IP>`):

### 1. Health Check (Includes DynamoDB & Docker Status)
```bash
curl http://localhost:5000/api/health
```
**Sample Output:**
```json
{
  "status": "ok",
  "docker": { "connected": true, "socket": "/var/run/docker.sock" },
  "sessions": { "activeCount": 0, "maxGlobalConcurrent": 2, "maxPerStudent": 1 },
  "dynamoDB": {
    "enabled": true,
    "connected": true,
    "tableName": "VirtualLabCommandLogs",
    "region": "ap-south-1",
    "queue": { "pendingEvents": 0, "totalLogged": 0, "totalFailed": 0 },
    "error": null
  }
}
```

### 2. Launch Lab
```bash
curl -X POST http://localhost:5000/api/labs/launch \
  -H "Content-Type: application/json" \
  -H "x-user-id: usr-student-divyansh" \
  -H "x-user-name: Divyansh Sharma" \
  -d '{"labId": "lab-linux-perm"}'
```

### 3. Query Session History from Backend API
```bash
curl http://localhost:5000/api/labs/<SESSION_ID>/history \
  -H "x-user-id: usr-student-divyansh"
```

---

## Limitations of Bash Command Capture

1. **Not a Cryptographic Kernel Audit**:
   Commands are captured at the shell readline/history layer via `PROMPT_COMMAND="history -a"`. If a student invokes a subshell that disables history (`set +o history` or unsets `PROMPT_COMMAND`), commands within that specific subshell will not append to history. (For kernel-level non-bypassable auditing in enterprise environments, Linux `auditd` / eBPF probes would be required).
2. **Piped Background Subshells**:
   Commands executed non-interactively via scripts (e.g. `bash script.sh`) run as child processes and do not trigger interactive readline history for their internal script lines; only the parent invocation (`bash script.sh`) is recorded.
3. **Sensitive Data in Arguments**:
   While regex redactions mask common flags (`--password`, `-p`, `Bearer`, `AKIA`), custom non-standard argument names might not match redaction heuristics. Students should follow academic lab best practices and avoid putting secrets on command line arguments.

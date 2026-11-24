# VirtualLab - AWS EC2 Backend Service

## Overview

VirtualLab is a cloud-based interactive Linux laboratory platform designed for universities. This backend service runs directly on an **AWS EC2 instance (Ubuntu 24.04 LTS)** with Docker Engine installed. It manages isolated student container sessions and exposes bidirectional WebSocket terminal streams powered by `@xterm/xterm` and `Dockerode`.

> [!WARNING]
> **Academic Prototype Security Disclaimer**:
> This platform is an educational academic prototype. Standard Docker containerization shares the host Linux kernel. While student containers run under strict non-root policies (`student`, UID 1001), drop all Linux capabilities (`CapDrop: ['ALL']`), enforce `no-new-privileges`, and disable network egress (`network: none`), standard containers do **not** provide hypervisor-level isolation (e.g. AWS Firecracker / Kata Containers) against arbitrary untrusted users attempting zero-day host kernel exploits.

---

## Architecture

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
|   - GET  /api/health                                        |
|   - POST /api/labs/launch                                   |
|   - GET  /api/labs/:id/status                               |
|   - DELETE /api/labs/:id                                    |
|   - WS   /ws/terminal/:id?ticket=...                        |
|                                                             |
|  Dockerode (Connected via /var/run/docker.sock)             |
|                                                             |
|  Docker Engine:                                             |
|   - Container 1: virtuallab-linux:1.0 (student1)            |
|   - Container 2: virtuallab-linux:1.0 (student2)            |
|   (Max 2 concurrent containers, 1 per student)              |
+-------------------------------------------------------------+
```

---

## Prerequisites & Requirements

- **Operating System**: Ubuntu 24.04 LTS (AWS EC2)
- **Node.js**: `>= 18.0.0` (Node 20.x LTS recommended)
- **Docker Engine**: Installed and running with user `ubuntu` in the `docker` group
- **Docker Image**: `virtuallab-linux:1.0` built and available locally on EC2
- **Network Boundary**: Bound strictly to `127.0.0.1:5000` (accessed via SSH port forwarding, never exposed publicly)

---

## Container Security & Resource Constraints

Every dynamically launched lab container is configured with the following restrictions:

| Parameter | Value | Purpose |
|---|---|---|
| **Base Image** | `virtuallab-linux:1.0` | Custom Ubuntu image with bash, nano, vim, python3 |
| **User** | `student` (UID 1001) | Non-root principle of least privilege |
| **Working Dir** | `/home/student` | Isolated home directory |
| **Command** | `sleep infinity` | Keeps container running for interactive exec |
| **Memory Limit** | `128 MB` | Prevents RAM exhaustion on host |
| **CPU Limit** | `0.25 vCPU` (250,000,000 NanoCPUs) | Fair CPU scheduling |
| **PID Limit** | `64` | Prevents fork-bombs (`:(){ :\|:& };:`) |
| **Network Mode** | `none` | Blocks all ingress and egress network traffic |
| **Capabilities** | `CapDrop: ['ALL']` | Drops all Linux kernel capabilities |
| **Privileges** | `no-new-privileges: true` | Blocks setuid / setgid privilege escalation |
| **Privileged Mode** | `false` | Explicitly non-privileged |
| **Tmpfs Limits** | `/tmp` (32MB), `/run` (16MB) | Ephemeral in-memory writable storage with `nosuid` |
| **Host Mounts** | `Binds: []` | Strictly no host directories or docker socket mounted |
| **Labels** | `virtuallab.managed=true` | Identifies containers for automated cleanup |

---

## Deployment Steps on AWS EC2

### Step 1: Connect to AWS EC2 Instance

From your Windows workstation (PowerShell or Git Bash):
```bash
ssh -i "path/to/your-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

### Step 2: Verify Docker & Pre-built Image

Ensure Docker is running and the custom student image `virtuallab-linux:1.0` exists:
```bash
docker --version
docker images | grep virtuallab-linux
```
*(If image `virtuallab-linux:1.0` is missing, build it using `docker build -t virtuallab-linux:1.0 .` from your Dockerfile directory).*

Ensure the `ubuntu` user can run Docker commands without `sudo`:
```bash
docker ps
```
*(If permission is denied: `sudo usermod -aG docker $USER && newgrp docker`).*

### Step 3: Clone / Copy Backend Code to EC2

Clone the repository or copy the `backend` folder to `/home/ubuntu/virtuallab-backend`:
```bash
mkdir -p /home/ubuntu/virtuallab-backend
cd /home/ubuntu/virtuallab-backend
```

### Step 4: Install Dependencies

```bash
# Verify Node.js version (must be >= 18.0.0)
node -v

# Install production dependencies
npm install
```

### Step 5: Configure Environment Variables

Create your `.env` configuration:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```ini
PORT=5000
HOST=127.0.0.1
NODE_ENV=production
DOCKER_SOCKET_PATH=/var/run/docker.sock
LAB_DOCKER_IMAGE=virtuallab-linux:1.0
SESSION_DURATION_MINUTES=30
MAX_GLOBAL_CONCURRENT_LABS=2
MAX_LABS_PER_STUDENT=1
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Step 6: Start Backend Service

To start in foreground for immediate testing:
```bash
npm start
```

Or run persistently using **PM2** (recommended for production/presentation):
```bash
sudo npm install -g pm2
pm2 start src/server.js --name virtuallab-backend
pm2 status
```

---

## Connecting from Workstation (SSH Port Forwarding)

Because the backend is bound strictly to `127.0.0.1:5000` for security, **do not open port 5000 in your AWS EC2 Security Group**. Instead, forward local port 5000 over an encrypted SSH tunnel.

Run this command on your Windows workstation in a separate terminal:

```bash
ssh -i "path/to/your-key.pem" -N -L 5000:127.0.0.1:5000 ubuntu@<EC2_PUBLIC_IP>
```

*Flags explained:*
- `-i "path/to/key.pem"`: Path to your AWS EC2 private key file.
- `-N`: Do not execute remote commands (tunnels traffic only).
- `-L 5000:127.0.0.1:5000`: Forwards workstation port `5000` to EC2 port `5000`.

---

## Testing & Verifying the API

While the SSH tunnel is active, test the backend from your local workstation:

### 1. Health Check & Docker Connectivity
```bash
curl http://localhost:5000/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "docker": {
    "connected": true,
    "socket": "/var/run/docker.sock"
  },
  "sessions": {
    "activeCount": 0,
    "maxGlobalConcurrent": 2,
    "maxPerStudent": 1,
    "durationMinutes": 30
  },
  "image": "virtuallab-linux:1.0"
}
```

### 2. Launch Lab Container
```bash
curl -X POST http://localhost:5000/api/labs/launch \
  -H "Content-Type: application/json" \
  -H "x-user-id: usr-student-divyansh" \
  -H "x-user-name: Divyansh Sharma" \
  -H "x-user-role: student" \
  -d '{"labId": "lab-linux-perm"}'
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Container provisioned successfully on AWS EC2.",
  "session": {
    "id": "sess_usrstudentdi_1711234567890_a1b2c3d4",
    "studentId": "usr-student-divyansh",
    "containerName": "vl-lab-usrstudentdi-a1b2c3d4",
    "durationMinutes": 30,
    "timeRemainingSeconds": 1800,
    "ticket": "9f8e7d...",
    "wsEndpoint": "/ws/terminal/sess_usrstudentdi_1711234567890_a1b2c3d4"
  }
}
```

### 3. Check Lab Status
```bash
curl http://localhost:5000/api/labs/<SESSION_ID>/status \
  -H "x-user-id: usr-student-divyansh"
```

### 4. Stop and Clean Up Container
```bash
curl -X DELETE http://localhost:5000/api/labs/<SESSION_ID> \
  -H "x-user-id: usr-student-divyansh"
```

---

## Frontend Integration

1. On your Windows laptop, start the frontend:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173`.
3. Sign in or switch to any Student account (e.g. Divyansh Sharma).
4. Click **Launch Lab** on any lab card or in the navigation bar.
5. The workspace opens, calls `/api/labs/launch`, receives the one-time authentication ticket, connects `@xterm/xterm` over `ws://localhost:5000/ws/terminal/:id?ticket=...`, and attaches directly to an interactive `bash` shell inside the AWS container!

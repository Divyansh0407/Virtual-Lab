# VirtualLab: Cloud-Isolated Academic Computing Platform

An academic cloud-based interactive Linux laboratory platform for computer science and engineering coursework. Combines an ultra-clean Framer/Meeko-inspired responsive UI with a real-time AWS EC2 Docker container backend and bidirectional WebSocket interactive terminals.

---

## 🚀 Key Features

- **Real AWS EC2 Docker Backend**:
  - Dynamically provisions hardened disposable containers (`virtuallab-linux:1.0`) on an AWS EC2 Ubuntu 24.04 LTS instance upon student request.
  - Interactive bash terminal powered by `@xterm/xterm`, `@xterm/addon-fit`, and Dockerode hijacked TTY streams.
  - Full support for Linux commands, arrow key history, Ctrl+C, nano, vim, and dynamic terminal window resizing.
- **Strict Security & Resource Isolation**:
  - Drops all Linux capabilities (`CapDrop: ['ALL']`).
  - Enforces `no-new-privileges: true` and non-privileged execution.
  - Detached network mode (`NetworkMode: 'none'`) preventing ingress/egress.
  - Hard resource quotas: 128 MB RAM, 0.25 vCPU, 64 PIDs limit, ephemeral tmpfs (`/tmp:32m`, `/run:16m`).
  - No host directories or Docker socket mounts.
  - Session boundaries: Max 1 active lab per student, max 2 concurrent labs globally, 30-minute auto-expiry reaper.
- **Secure Network Architecture**:
  - Backend binds strictly to `127.0.0.1:5000` on EC2.
  - Student laptops connect securely via SSH port forwarding (`ssh -L 5000:127.0.0.1:5000`) without exposing Docker or HTTP ports to the public Internet.
  - One-time short-lived tickets for WebSocket stream authentication.
- **Academic Prototype Disclaimer**:
  - This platform is an educational academic prototype. While containers enforce non-root execution and drop all capabilities, standard Docker shares the host Linux kernel and does not replace microVM-level isolation (e.g. AWS Firecracker) against untrusted kernel exploits.

---

## 📁 Repository Structure

```
Virtual-Lab/
├── backend/                       # Node.js + Express + Dockerode + ws EC2 Service
│   ├── src/
│   │   ├── config.js              # Environment and resource quota configurations
│   │   ├── docker.js              # Dockerode client and connectivity verification
│   │   ├── sessionManager.js      # Session lifecycle, mutex launch lock, auto-reaper
│   │   ├── server.js              # Express app + HTTP server + WebSocket upgrade
│   │   ├── middleware/            # Auth and error handling middleware
│   │   ├── routes/                # Health and lab lifecycle endpoints
│   │   └── websocket/             # Interactive Docker exec TTY stream handler
│   ├── .env.example               # Backend environment template
│   ├── package.json               # Backend dependencies
│   └── README.md                  # Complete EC2 deployment & testing guide
├── src/                           # React 18 + TypeScript Frontend
│   ├── components/                # Workspace, RealTerminal, Dashboard, Navigation
│   ├── context/AppContext.tsx     # Application state & backend API integration
│   ├── services/api.ts            # Typed REST & WebSocket client
│   └── types/index.ts             # TypeScript domain schemas
├── package.json                   # Frontend dependencies
├── vite.config.ts                 # Vite bundler configuration
└── README.md
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js `>= 18.0.0` (Node 20 LTS recommended)
- Git and SSH client
- AWS EC2 instance running Ubuntu 24.04 LTS with Docker Engine and image `virtuallab-linux:1.0`

### 2. AWS EC2 Backend Deployment
Follow the detailed guide in [backend/README.md](file:///c:/Virtual-Lab/backend/README.md):
```bash
# 1. On your AWS EC2 instance:
cd /home/ubuntu/virtuallab-backend
npm install
npm start
```

### 3. SSH Port Forwarding (Workstation)
In a separate terminal on your workstation:
```bash
ssh -i "path/to/your-key.pem" -N -L 5000:127.0.0.1:5000 ubuntu@<EC2_PUBLIC_IP>
```

### 4. Run Frontend Locally
```bash
# In the repository root:
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🔑 Demo Academic Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Divyansh Sharma | `divyansh.sharma@university.edu` | `divyansh@123` |
| **Student** | Harshvardhan Gupta | `harshvardhan.gupta@university.edu` | `harsh@123` |
| **Faculty** | Garvit Dohare | `garvit.dohare@university.edu` | `garvit@123` |
| **Admin** | Akshita | `akshita@admin.university.edu` | `akshita@123` |

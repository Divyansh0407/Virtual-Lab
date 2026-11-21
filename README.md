# VirtualLab: Cloud-Isolated Academic Computing Platform

An enterprise-grade, cloud-isolated virtual laboratory system for computer science and engineering coursework. Designed with an ultra-clean Framer/Ondrel-inspired UI, responsive mobile-first architecture, role-based workflows (Student, Faculty, Admin), and container orchestration telemetry.

---

## 🚀 Key Features

- **Authenticated Role Workflows**:
  - **Student**: Interactive lab catalog, disposable container terminal emulator, live code editor, automated deterministic verification checks, and snapshot artifact submission.
  - **Faculty**: Grading studio with deterministic automated scores, AI advisory rubric evaluations, interactive rubric score sliders, and official grade publishing.
  - **Administrator**: Dedicated Linux host VM monitoring, rootless Docker cluster telemetry (CPU, RAM, container capacity), approved image registry, and immutable audit logging.
- **Micro-Interactions & Motion Design**:
  - Tactile spring button presses (`.btn-tactile`), smooth elevation lifts (`.hover-lift`), pulsing telemetry indicators, animated marquee, interactive topology blueprint, and fluid tab transitions.
- **Production Architecture**:
  - Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **Vite**.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Divyansh0407/Virtual-Lab.git

# Navigate into the project directory
cd Virtual-Lab

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will run locally at `http://localhost:5173/`.

### Building for Production
```bash
npm run build
```

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Divyansh Sharma | `divyansh.sharma@university.edu` | `divyansh@123` |
| **Student** | Harshvardhan Gupta | `harshvardhan.gupta@university.edu` | `harsh@123` |
| **Faculty** | Garvit Dohare | `garvit.dohare@university.edu` | `garvit@123` |
| **Admin** | Akshita | `akshita@admin.university.edu` | `akshita@123` |

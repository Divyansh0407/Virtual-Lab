import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory if present
try {
  const dotenv = await import('dotenv');
  dotenv.default?.config({ path: path.resolve(__dirname, '../.env') });
} catch (e) {
  // Fallback when running in environments without dotenv
}

const parseOrigins = (raw) => {
  if (!raw) return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '127.0.0.1',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Docker Connection
  dockerSocket: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
  labDockerImage: process.env.LAB_DOCKER_IMAGE || 'virtuallab-linux:1.0',

  // Allowed Origins
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS),

  // Session & Global Constraints
  maxGlobalConcurrentLabs: parseInt(process.env.MAX_GLOBAL_CONCURRENT_LABS || '2', 10),
  maxStudentConcurrentLabs: parseInt(process.env.MAX_STUDENT_CONCURRENT_LABS || '1', 10),
  sessionDurationMinutes: parseInt(process.env.SESSION_DURATION_MINUTES || '30', 10),
  sessionDurationMs: parseInt(process.env.SESSION_DURATION_MINUTES || '30', 10) * 60 * 1000,
  ticketTtlMs: parseInt(process.env.TICKET_TTL_SECONDS || '60', 10) * 1000,

  // Container Hard Limits
  memoryLimitBytes: parseInt(process.env.CONTAINER_MEMORY_LIMIT_MB || '128', 10) * 1024 * 1024,
  nanoCpus: Math.round(parseFloat(process.env.CONTAINER_CPU_LIMIT || '0.25') * 1e9),
  pidsLimit: parseInt(process.env.CONTAINER_PIDS_LIMIT || '64', 10),

  // Rate Limiting
  wsRateLimitMessagesPerSec: parseInt(process.env.WS_RATE_LIMIT_MESSAGES_PER_SEC || '100', 10)
};

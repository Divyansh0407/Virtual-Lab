import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { labsRouter } from './routes/labs.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupTerminalWebSocket } from './websocket/terminal.js';
import { sessionManager } from './sessionManager.js';
import { dynamoDBService } from './services/dynamoDBService.js';
import { checkDockerConnectivity } from './docker.js';

const app = express();

// Configure CORS for local & frontend communication
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, postman, server-to-server) or matched origins
    if (!origin || config.allowedOrigins.some(allowed => 
      origin === allowed || allowed === '*' || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
    )) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role', 'x-user-name'],
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Mount API routes
app.use('/api', healthRouter);
app.use('/api/labs', labsRouter);

// Global Error Handler
app.use(errorHandler);

// Create HTTP server & attach WebSocket server
const server = http.createServer(app);
setupTerminalWebSocket(server);

// Start server
async function startServer() {
  console.log('================================================================');
  console.log('  VirtualLab Academic Cloud Backend & Container Gateway');
  console.log('  Major Project Prototype · AWS EC2 Deployment Architecture');
  console.log('================================================================');

  // 1. Check Docker daemon availability
  const dockerCheck = await checkDockerConnectivity();
  if (dockerCheck.ok) {
    console.log(`[Docker] Connected to Docker Engine v${dockerCheck.version.version} (API: ${dockerCheck.version.apiVersion}, OS: ${dockerCheck.version.os})`);
  } else {
    console.warn(`[Docker Warning] ${dockerCheck.error}`);
    console.warn('[Docker Warning] Endpoints requiring Docker will return 503 until Docker socket is accessible.');
  }

  // 2. Check DynamoDB connectivity (IAM Role: VirtualLabEC2Role)
  if (config.commandLoggingEnabled) {
    const dynamoCheck = await dynamoDBService.checkConnectivity();
    if (dynamoCheck.connected) {
      console.log(`[DynamoDB] Connected to table '${config.dynamoDbTableName}' in region '${config.awsRegion}' (Status: ${dynamoCheck.status})`);
    } else {
      console.warn(`[DynamoDB Notice] Table check: ${dynamoCheck.error || dynamoCheck.status}`);
      console.warn('[DynamoDB Notice] Commands will be queued asynchronously and retried.');
    }
  }

  // 3. Reconcile live managed Docker containers & clean up stale/duplicate ones
  if (dockerCheck.ok) {
    await sessionManager.reconcileWithDocker();
  }

  // 4. Start automated container expiration reaper
  sessionManager.startReaper();

  // 5. Bind server to host and port (defaults to 127.0.0.1:5000 for SSH tunneling)
  server.listen(config.port, config.host, () => {
    console.log(`[Server] VirtualLab backend running at http://${config.host}:${config.port}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
    console.log(`[Server] Lab Image: ${config.labDockerImage}`);
    console.log(`[Server] DynamoDB Logging: ${config.commandLoggingEnabled ? 'Enabled (' + config.dynamoDbTableName + ')' : 'Disabled'}`);
    console.log(`[Server] Max Global Labs: ${config.maxGlobalConcurrentLabs} | Max Per Student: ${config.maxStudentConcurrentLabs}`);
    console.log(`[Server] Session Duration: ${config.sessionDurationMinutes} minutes`);
    console.log(`[Server] Allowed Origins: ${config.allowedOrigins.join(', ')}`);
    console.log('----------------------------------------------------------------');
  });
}

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Terminating all active containers...`);
  sessionManager.stopReaper();

  // Terminate all sessions
  for (const sessionId of Array.from(sessionManager.sessions.keys())) {
    try {
      await sessionManager.stopSession(sessionId, 'Server shutting down');
    } catch (e) {
      console.warn(`[Shutdown] Error stopping session ${sessionId}: ${e.message}`);
    }
  }

  // Flush any pending DynamoDB log records
  try {
    await dynamoDBService.flushQueue(2000);
  } catch (e) {
    console.warn(`[Shutdown] DynamoDB flush notice: ${e.message}`);
  }

  server.close(() => {
    console.log('[Shutdown] Server closed cleanly.');
    process.exit(0);
  });

  // Force exit after 10s if hanging
  setTimeout(() => {
    console.error('[Shutdown] Force exit after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch(err => {
  console.error('[Server Fatal] Failed to bootstrap backend:', err);
  process.exit(1);
});

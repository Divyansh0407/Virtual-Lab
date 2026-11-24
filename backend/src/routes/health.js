import express from 'express';
import { checkDockerConnectivity } from '../docker.js';
import { sessionManager } from '../sessionManager.js';
import { dynamoDBService } from '../services/dynamoDBService.js';
import { config } from '../config.js';

export const healthRouter = express.Router();

healthRouter.get('/health', async (req, res) => {
  const dockerStatus = await checkDockerConnectivity();
  const activeCount = sessionManager.getActiveCount();
  const dynamoHealth = dynamoDBService.getHealthStatus();

  if (!dockerStatus.ok) {
    return res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      service: 'VirtualLab EC2 Container Orchestrator',
      docker: {
        connected: false,
        socket: config.dockerSocket,
        error: dockerStatus.error
      },
      dynamoDB: {
        enabled: dynamoHealth.enabled,
        connected: dynamoHealth.connected,
        tableName: dynamoHealth.tableName,
        region: dynamoHealth.region,
        queue: {
          pendingEvents: dynamoHealth.queue.pendingEvents,
          totalLogged: dynamoHealth.queue.totalLogged,
          totalFailed: dynamoHealth.queue.totalFailed
        },
        error: dynamoHealth.error
      },
      message: 'Docker daemon is currently unreachable. Check /var/run/docker.sock permissions and EC2 docker daemon status.'
    });
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'VirtualLab EC2 Container Orchestrator',
    docker: {
      connected: true,
      socket: config.dockerSocket,
      version: dockerStatus.version
    },
    sessions: {
      activeCount,
      maxGlobalConcurrent: config.maxGlobalConcurrentLabs,
      maxPerStudent: config.maxStudentConcurrentLabs,
      durationMinutes: config.sessionDurationMinutes
    },
    dynamoDB: {
      enabled: dynamoHealth.enabled,
      connected: dynamoHealth.connected,
      tableName: dynamoHealth.tableName,
      region: dynamoHealth.region,
      queue: {
        pendingEvents: dynamoHealth.queue.pendingEvents,
        totalLogged: dynamoHealth.queue.totalLogged,
        totalFailed: dynamoHealth.queue.totalFailed
      },
      error: dynamoHealth.error
    },
    image: config.labDockerImage,
    prototypeNotice: 'Restricted academic college prototype. Containers run with dropped capabilities and isolated network.'
  });
});

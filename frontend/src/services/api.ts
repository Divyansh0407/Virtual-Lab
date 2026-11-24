/**
 * VirtualLab Backend REST API & WebSocket Client
 * Connects frontend UI to AWS EC2 Docker Backend Gateway.
 */

// Default to localhost:5000 (accessible via SSH port-forwarding: ssh -L 5000:localhost:5000)
const env = (import.meta as any).env || {};

export const BACKEND_HTTP_URL = 
  env.VITE_BACKEND_URL || 'http://localhost:5000';

export const BACKEND_WS_URL = 
  env.VITE_WS_URL || BACKEND_HTTP_URL.replace(/^http/, 'ws');

export interface BackendHealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  docker: {
    connected: boolean;
    socket: string;
    version?: {
      version: string;
      apiVersion: string;
      os: string;
      arch: string;
    };
    error?: string;
  };
  sessions?: {
    activeCount: number;
    maxGlobalConcurrent: number;
    maxPerStudent: number;
    durationMinutes: number;
  };
  image?: string;
  prototypeNotice?: string;
  message?: string;
}

export interface LaunchLabResponse {
  success: boolean;
  message: string;
  session: {
    id: string;
    studentId: string;
    studentName: string;
    labId: string;
    containerId: string;
    containerName: string;
    state: 'running' | 'queued' | 'starting' | 'stopped';
    startedAt: string;
    expiresAt: string;
    durationMinutes: number;
    timeRemainingSeconds: number;
    ticket: string;
    wsEndpoint: string;
  };
}

export interface LabStatusResponse {
  success: boolean;
  session: {
    id: string;
    containerId: string;
    containerName: string;
    state: string;
    startedAt: string;
    expiresAt: string;
    durationMinutes: number;
    timeRemainingSeconds: number;
    ticket: string;
    wsEndpoint: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  activeSessionId?: string;
}

class LabApiClient {
  private getHeaders(userId?: string, userRole?: string, userName?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (userId) headers['x-user-id'] = userId;
    if (userRole) headers['x-user-role'] = userRole;
    if (userName) headers['x-user-name'] = userName;
    return headers;
  }

  async checkHealth(): Promise<BackendHealthResponse> {
    const res = await fetch(`${BACKEND_HTTP_URL}/api/health`);
    const data = await res.json();
    return data;
  }

  async launchLab(
    labId: string,
    studentId: string,
    studentName: string,
    userRole: string = 'student'
  ): Promise<LaunchLabResponse> {
    const res = await fetch(`${BACKEND_HTTP_URL}/api/labs/launch`, {
      method: 'POST',
      headers: this.getHeaders(studentId, userRole, studentName),
      body: JSON.stringify({ labId, studentId, studentName })
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || `Failed to launch lab (Status ${res.status})`);
      (err as any).code = data.error?.code || 'LAUNCH_FAILED';
      (err as any).statusCode = res.status;
      (err as any).activeSessionId = data.error?.activeSessionId;
      throw err;
    }

    return data;
  }

  async getLabStatus(
    sessionId: string,
    studentId: string,
    userRole: string = 'student'
  ): Promise<LabStatusResponse> {
    const res = await fetch(`${BACKEND_HTTP_URL}/api/labs/${sessionId}/status`, {
      method: 'GET',
      headers: this.getHeaders(studentId, userRole)
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || `Failed to get lab status (Status ${res.status})`);
      (err as any).code = data.error?.code || 'STATUS_FAILED';
      throw err;
    }

    return data;
  }

  async stopLab(
    sessionId: string,
    studentId: string,
    userRole: string = 'student'
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BACKEND_HTTP_URL}/api/labs/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(studentId, userRole)
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || `Failed to stop lab (Status ${res.status})`);
      (err as any).code = data.error?.code || 'STOP_FAILED';
      throw err;
    }

    return data;
  }

  getTerminalWsUrl(sessionId: string, ticket: string): string {
    return `${BACKEND_WS_URL}/ws/terminal/${sessionId}?ticket=${ticket}`;
  }
}

export const labApi = new LabApiClient();

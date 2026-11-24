import { config } from './config.js';

let Docker;
try {
  const mod = await import('dockerode');
  Docker = mod.default || mod;
} catch (e) {
  // Graceful fallback for test runners / environments without dockerode installed locally
  Docker = class FallbackDocker {
    constructor() {}
    async ping() { throw new Error('Dockerode package is not installed'); }
    async version() { throw new Error('Dockerode package is not installed'); }
    async createContainer() { throw new Error('Dockerode package is not installed'); }
    getContainer() { throw new Error('Dockerode package is not installed'); }
    async listContainers() { return []; }
  };
}

const getDockerInstance = () => {
  const socket = config.dockerSocket;
  if (socket.startsWith('http://') || socket.startsWith('tcp://')) {
    const url = new URL(socket);
    return new Docker({ host: url.hostname, port: url.port });
  }
  return new Docker({ socketPath: socket });
};

export const docker = getDockerInstance();

/**
 * Validates connectivity with the host Docker Engine.
 * @returns {Promise<{ ok: boolean, version?: object, error?: string }>}
 */
export async function checkDockerConnectivity() {
  try {
    await docker.ping();
    const version = await docker.version();
    return {
      ok: true,
      version: {
        version: version.Version,
        apiVersion: version.ApiVersion,
        os: version.Os,
        arch: version.Arch
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to connect to Docker daemon at ${config.dockerSocket}: ${error.message}`
    };
  }
}

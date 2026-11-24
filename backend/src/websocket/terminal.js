import { WebSocketServer, WebSocket } from 'ws';
import { docker } from '../docker.js';
import { sessionManager } from '../sessionManager.js';
import { dynamoDBService } from '../services/dynamoDBService.js';
import { config } from '../config.js';

const HISTORY_FILE = '/tmp/.vl_history';
const RC_FILE = '/tmp/.vl_bashrc';

/**
 * Decoupled helper to initialize shell history capture hook and companion tail watcher once per container session.
 * Operates independently of individual WebSocket client connections and never terminates interactive bash.
 */
async function ensureSessionHistoryCollector(session, container) {
  if (session.historyCollectorStarted) return;
  session.historyCollectorStarted = true;

  const initScript = `touch ${HISTORY_FILE} && cat << 'EOF' > ${RC_FILE}
if [ -f /home/student/.bashrc ]; then
  . /home/student/.bashrc
fi
export HISTFILE=${HISTORY_FILE}
export HISTSIZE=10000
export HISTFILESIZE=10000
export HISTCONTROL=ignoredups
shopt -s histappend
export PROMPT_COMMAND="history -a"
EOF
chmod 600 ${HISTORY_FILE} ${RC_FILE}
`;

  try {
    const initExec = await container.exec({
      Cmd: ['sh', '-c', initScript],
      AttachStdout: true,
      AttachStderr: true,
      User: 'student'
    });
    const initStream = await initExec.start({ hijack: true });
    initStream.resume(); // Drain and complete
  } catch (initErr) {
    console.warn(`[CommandHistory] Notice initializing shell history hook for '${session.id}': ${initErr.message}`);
  }

  try {
    const tailExec = await container.exec({
      Cmd: ['tail', '-n', '0', '-F', HISTORY_FILE],
      AttachStdout: true,
      AttachStderr: false,
      Tty: false,
      User: 'student'
    });
    const tailStream = await tailExec.start({ hijack: true, stdin: false });
    session.tailStream = tailStream;

    let historyBuffer = '';
    tailStream.on('data', (chunk) => {
      try {
        historyBuffer += chunk.toString('utf8');
        const lines = historyBuffer.split('\n');
        historyBuffer = lines.pop(); // Retain incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            console.log(`[CommandHistory] Session '${session.id}' (${session.studentName}): ${trimmed}`);
            dynamoDBService.logEvent({
              sessionId: session.id,
              studentId: session.studentId,
              studentName: session.studentName,
              labId: session.labId,
              containerId: session.containerId,
              command: trimmed,
              eventType: 'COMMAND_HISTORY'
            });
          }
        }
      } catch (err) {
        console.warn(`[CommandHistory] Notice processing history buffer for '${session.id}': ${err.message}`);
      }
    });

    tailStream.on('error', (err) => {
      console.warn(`[CommandHistory] Tail stream notice for '${session.id}': ${err.message}`);
    });

    tailStream.on('end', () => {
      console.log(`[CommandHistory] Tail stream ended for session '${session.id}'`);
      session.tailStream = null;
    });
  } catch (tailErr) {
    console.warn(`[CommandHistory] Notice starting history watcher for '${session.id}': ${tailErr.message}`);
  }
}

export function setupTerminalWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade to WebSocket
  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      const pathname = url.pathname; // e.g. /ws/terminal/sess_123

      const match = pathname.match(/^\/ws\/terminal\/([^/]+)$/);
      if (!match) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      const sessionId = match[1];
      const ticket = url.searchParams.get('ticket');

      // 1. Origin verification
      const origin = request.headers.origin;
      if (origin && config.allowedOrigins.length > 0) {
        const isAllowed = config.allowedOrigins.some(allowed => 
          origin === allowed || allowed === '*' || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
        );
        if (!isAllowed) {
          console.warn(`[WebSocket] Rejected origin: ${origin}`);
          socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
          socket.destroy();
          return;
        }
      }

      // 2. Ticket & Session verification
      const ticketInfo = sessionManager.validateTicket(sessionId, ticket);
      const session = sessionManager.getSession(sessionId);

      if (!session || !ticketInfo) {
        console.warn(`[WebSocket] Unauthorized terminal connection rejected for '${sessionId}' (hasValidSession: ${Boolean(session)}, hasValidTicket: ${Boolean(ticketInfo)})`);
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // 3. Complete WebSocket upgrade
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, session);
      });
    } catch (err) {
      console.error(`[WebSocket] Upgrade error: ${err.message}`);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  });

  // Handle connected WebSocket client
  wss.on('connection', async (ws, request, session) => {
    console.log(`[WebSocket] Terminal client connected to session '${session.id}' (${session.containerName})`);

    // Register active socket with session
    session.wsClients.add(ws);

    let stream = null;
    let execInstance = null;
    let isCleanedUp = false;

    // Rate limiting tracking
    let messageCount = 0;
    let lastReset = Date.now();

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      session.wsClients.delete(ws);

      if (stream) {
        try {
          stream.removeAllListeners();
          stream.end();
          stream.destroy();
        } catch (e) {
          // Ignore stream teardown errors
        }
        stream = null;
      }
    };

    try {
      const container = docker.getContainer(session.containerId);

      // 1. Ensure history hook and companion tail watcher are running (independent of interactive bash)
      ensureSessionHistoryCollector(session, container).catch((e) => {
        console.warn(`[CommandHistory] Collector initialization notice: ${e.message}`);
      });

      // 2. Create interactive Bash exec using the logging rcfile
      execInstance = await container.exec({
        Cmd: ['/bin/bash', '--rcfile', RC_FILE],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Env: [
          'TERM=xterm-256color',
          'COLORTERM=truecolor',
          'LANG=C.UTF-8',
          'LC_ALL=C.UTF-8',
          'HOME=/home/student',
          'USER=student',
          'SHELL=/bin/bash',
          `HISTFILE=${HISTORY_FILE}`,
          'PROMPT_COMMAND=history -a'
        ],
        WorkingDir: '/home/student',
        User: 'student'
      });

      // Start the hijacked raw TTY stream
      stream = await execInstance.start({
        hijack: true,
        stdin: true,
        Tty: true
      });

      // Forward output from Docker container -> WebSocket
      stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk);
        }
      });

      stream.on('end', () => {
        console.log(`[WebSocket] Exec stream ended for session '${session.id}'`);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('\r\n\x1b[33m[VirtualLab: Container process ended]\x1b[0m\r\n');
          ws.close(1000, 'Process ended');
        }
        cleanup();
      });

      stream.on('error', (err) => {
        console.error(`[WebSocket] Stream error for session '${session.id}': ${err.message}`);
        cleanup();
      });

      // Forward input from WebSocket -> Docker container stdin
      ws.on('message', (message) => {
        // Rate limiting check
        const now = Date.now();
        if (now - lastReset > 1000) {
          messageCount = 0;
          lastReset = now;
        }
        messageCount++;
        if (messageCount > config.wsRateLimitMessagesPerSec) {
          console.warn(`[WebSocket] Rate limit exceeded by client in session '${session.id}'`);
          return;
        }

        if (!stream || isCleanedUp) return;

        // Check for control messages (e.g. terminal resize: { type: 'resize', cols: 80, rows: 24 })
        try {
          const text = message.toString();
          if (text.startsWith('{') && text.endsWith('}')) {
            const data = JSON.parse(text);
            if (data.type === 'resize' && data.cols && data.rows) {
              const cols = parseInt(data.cols, 10);
              const rows = parseInt(data.rows, 10);
              if (cols > 0 && rows > 0 && execInstance) {
                execInstance.resize({ w: cols, h: rows }).catch(err => {
                  console.warn(`[WebSocket] Resize error: ${err.message}`);
                });
                return;
              }
            }
          }
        } catch (e) {
          // Not a JSON control message; pass directly to terminal stdin
        }

        // Write raw keystrokes/data to Docker bash stdin
        try {
          stream.write(message);
        } catch (writeErr) {
          console.warn(`[WebSocket] Write to container failed: ${writeErr.message}`);
        }
      });

      ws.on('close', (code, reason) => {
        console.log(`[WebSocket] Client disconnected from session '${session.id}' (code: ${code})`);
        cleanup();
      });

      ws.on('error', (err) => {
        console.error(`[WebSocket] Socket error for session '${session.id}': ${err.message}`);
        cleanup();
      });

    } catch (err) {
      console.error(`[WebSocket] Failed to initialize exec stream for session '${session.id}': ${err.message}`);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`\r\n\x1b[31m[VirtualLab Error: Failed to attach interactive shell: ${err.message}]\x1b[0m\r\n`);
        ws.close(1011, 'Exec stream initialization failed');
      }
      cleanup();
    }
  });

  return wss;
}

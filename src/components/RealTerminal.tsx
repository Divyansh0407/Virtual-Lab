import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { labApi } from '../services/api';
import { RefreshCw, Wifi, WifiOff, Terminal as TerminalIcon, Maximize2 } from 'lucide-react';

interface RealTerminalProps {
  sessionId: string;
  ticket: string;
  containerRef: string;
  onSessionError?: (error: string) => void;
  onTerminalSnapshot?: (snapshot: string) => void;
  quickCommandRef?: React.MutableRefObject<((cmd: string) => void) | null>;
  onReconnect?: () => Promise<void> | void;
}

export const RealTerminal: React.FC<RealTerminalProps> = ({
  sessionId,
  ticket,
  containerRef,
  onSessionError,
  onTerminalSnapshot,
  quickCommandRef,
  onReconnect
}) => {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);

  useEffect(() => {
    if (!terminalContainerRef.current) return;

    let isCancelled = false;
    let ws: WebSocket | null = null;
    let connectTimeout: ReturnType<typeof setTimeout> | null = null;
    let snapInterval: ReturnType<typeof setInterval> | null = null;

    // Reset container DOM to prevent duplicate canvas elements during remount
    if (terminalContainerRef.current) {
      terminalContainerRef.current.innerHTML = '';
    }

    // 1. Initialize xterm instance with dark VSCode/GitHub theme matching VirtualLab
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 13,
      lineHeight: 1.25,
      fontFamily: '"JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#2b59ff',
        cursorAccent: '#0d1117',
        selectionBackground: 'rgba(43, 89, 255, 0.35)',
        black: '#0d1117',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc'
      },
      convertEol: true,
      scrollback: 2000
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    term.open(terminalContainerRef.current);

    // Initial fit
    try {
      fitAddon.fit();
    } catch (e) {
      // Container might not be visible immediately
    }

    // Periodic terminal buffer snapshot mechanism
    if (onTerminalSnapshot) {
      const getBufferText = () => {
        let text = '';
        const buffer = term.buffer.active;
        for (let i = 0; i < buffer.length; i++) {
          const line = buffer.getLine(i);
          if (line) text += line.translateToString(true) + '\n';
        }
        return text.trim();
      };
      snapInterval = setInterval(() => {
        if (!isCancelled) {
          onTerminalSnapshot(getBufferText());
        }
      }, 5000);
    }

    // 2. Open WebSocket connection to AWS EC2 backend gateway
    if (!sessionId || !ticket || !sessionId.startsWith('sess_')) {
      console.warn('[RealTerminal] Awaiting valid backend sessionId and ticket before connecting.');
      setConnectionStatus('connecting');
      return () => {
        isCancelled = true;
        if (snapInterval) clearInterval(snapInterval);
        term.dispose();
        terminalInstanceRef.current = null;
        fitAddonRef.current = null;
      };
    }

    setConnectionStatus('connecting');
    setErrorMessage(null);

    // Schedule socket connection with 50ms debounce
    // This allows React 18 Strict Mode immediate unmount to cancel without creating duplicate sockets
    connectTimeout = setTimeout(() => {
      if (isCancelled) return;

      const wsUrl = labApi.getTerminalWsUrl(sessionId, ticket);
      const activeWs = new WebSocket(wsUrl);
      activeWs.binaryType = 'arraybuffer';
      ws = activeWs;
      socketRef.current = activeWs;

      // Attach quick command executor function
      if (quickCommandRef) {
        quickCommandRef.current = (cmd: string) => {
          if (activeWs.readyState === WebSocket.OPEN) {
            activeWs.send(cmd + '\n');
            term.focus();
          }
        };
      }

      activeWs.onopen = () => {
        if (isCancelled) {
          try { activeWs.close(1000, 'Unmounted'); } catch (e) {}
          return;
        }
        setConnectionStatus('connected');
        setErrorMessage(null);
        term.focus();

        // Send initial dimensions to Dockerode exec
        try {
          fitAddon.fit();
          activeWs.send(JSON.stringify({
            type: 'resize',
            cols: term.cols,
            rows: term.rows
          }));
        } catch (e) {}
      };

      activeWs.onmessage = (event) => {
        if (isCancelled) return;
        if (typeof event.data === 'string') {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'session_closed') {
              term.write(`\r\n\x1b[33m[Session Closed: ${parsed.reason}]\x1b[0m\r\n`);
              return;
            }
          } catch {
            // Normal terminal string
          }
          term.write(event.data);
        } else if (event.data instanceof ArrayBuffer) {
          term.write(new Uint8Array(event.data));
        }
      };

      activeWs.onerror = () => {
        if (isCancelled) return;
        setConnectionStatus('error');
        const err = 'WebSocket connection failed. Verify EC2 backend port forward (localhost:5000).';
        setErrorMessage(err);
        if (onSessionError) onSessionError(err);
        term.write(`\r\n\x1b[31m[VirtualLab: Connection error. Is backend tunnel active on port 5000?]\x1b[0m\r\n`);
      };

      activeWs.onclose = (event) => {
        if (isCancelled) return;
        setConnectionStatus('disconnected');
        if (event.code !== 1000) {
          term.write(`\r\n\x1b[33m[VirtualLab: Shell disconnected (Code ${event.code})]\x1b[0m\r\n`);
        }
      };
    }, 50);

    // 3. User Keystrokes -> WebSocket
    const dataListener = term.onData((data) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(data);
      }
    });

    // 4. Terminal Resize -> Dockerode resize
    const resizeListener = term.onResize(({ cols, rows }) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    });

    // Handle container resize observer
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Suppress layout race
      }
    });
    resizeObserver.observe(terminalContainerRef.current);

    return () => {
      isCancelled = true;
      if (connectTimeout) clearTimeout(connectTimeout);
      if (snapInterval) clearInterval(snapInterval);
      if (quickCommandRef) {
        quickCommandRef.current = null;
      }
      resizeObserver.disconnect();
      dataListener.dispose();
      resizeListener.dispose();

      const closingWs = ws;
      if (closingWs) {
        closingWs.onopen = null;
        closingWs.onmessage = null;
        closingWs.onerror = null;
        closingWs.onclose = null;

        if (closingWs.readyState === WebSocket.CONNECTING) {
          closingWs.onopen = () => {
            try { closingWs.close(1000, 'Unmounted'); } catch (e) {}
          };
        } else if (closingWs.readyState === WebSocket.OPEN) {
          try { closingWs.close(1000, 'Unmounted'); } catch (e) {}
        }
      }

      term.dispose();
      socketRef.current = null;
      terminalInstanceRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, ticket, reconnectAttempt]);

  const handleManualReconnect = async () => {
    if (socketRef.current) {
      try { socketRef.current.close(1000, 'Manual reconnect'); } catch (e) {}
    }
    setErrorMessage(null);
    setConnectionStatus('connecting');

    if (onReconnect) {
      try {
        await onReconnect();
      } catch (e) {
        console.warn('Manual reconnect request notice:', e);
      }
    }
    setReconnectAttempt(n => n + 1);
  };

  const handleFit = () => {
    try {
      fitAddonRef.current?.fit();
      if (terminalInstanceRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'resize',
          cols: terminalInstanceRef.current.cols,
          rows: terminalInstanceRef.current.rows
        }));
      }
    } catch (e) {
      // Ignore fit error
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] relative select-text">
      {/* Terminal Connection Bar */}
      <div className="bg-[#161b22] px-4 py-2 border-b border-gray-800 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="h-3.5 w-px bg-gray-700 mx-1"></div>

          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-gray-300">
            <TerminalIcon className="w-3.5 h-3.5 text-[#2b59ff]" />
            <span>student@{containerRef}:/home/student</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Real Connection Status Indicator */}
          <div className="flex items-center space-x-1.5">
            {connectionStatus === 'connected' ? (
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Attached (AWS EC2 PTY)</span>
              </span>
            ) : connectionStatus === 'connecting' ? (
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-[11px] font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                <span>Connecting...</span>
              </span>
            ) : (
              <button
                onClick={handleManualReconnect}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700/60 text-red-300 hover:text-white text-[11px] font-semibold transition-colors"
                title="Click to reconnect WebSocket"
              >
                <WifiOff className="w-3 h-3 text-red-400" />
                <span>Disconnected · Retry</span>
              </button>
            )}
          </div>

          <button
            onClick={handleFit}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Auto-Fit Terminal Geometry"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={terminalContainerRef}
        className="flex-1 w-full p-2 overflow-hidden"
        style={{ minHeight: '380px' }}
      />

      {/* Error Banner if connection fails */}
      {errorMessage && (
        <div className="bg-red-950/90 border-t border-red-800 p-2.5 px-4 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleManualReconnect}
            className="px-2.5 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-semibold text-[11px] ml-4 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}
    </div>
  );
};

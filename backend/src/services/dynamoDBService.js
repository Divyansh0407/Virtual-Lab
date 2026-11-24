import crypto from 'crypto';
import { config } from '../config.js';

let DynamoDBClient;
let DescribeTableCommand;
let DynamoDBDocumentClient;
let PutCommand;
let QueryCommand;

// Dynamic import with safe fallback for environments without AWS SDK installed
try {
  const clientMod = await import('@aws-sdk/client-dynamodb');
  const libMod = await import('@aws-sdk/lib-dynamodb');
  DynamoDBClient = clientMod.DynamoDBClient;
  DescribeTableCommand = clientMod.DescribeTableCommand;
  DynamoDBDocumentClient = libMod.DynamoDBDocumentClient;
  PutCommand = libMod.PutCommand;
  QueryCommand = libMod.QueryCommand;
} catch (err) {
  // Graceful fallback for test environments or offline verification
  console.warn('[DynamoDBService] AWS SDK v3 modules not loaded locally. DynamoDB client using fallback mock mode.');
}

// Credential and secret redaction patterns
const SENSITIVE_PATTERNS = [
  // AWS Access Keys
  { pattern: /\b(AKIA[0-9A-Z]{16})\b/g, replacement: '[REDACTED_AWS_KEY]' },
  // Private Key blocks
  { pattern: /-----BEGIN [A-Z ]+ PRIVATE KEY-----[^-]+-----END [A-Z ]+ PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  // Authorization tokens
  { pattern: /\b(Bearer\s+)[a-zA-Z0-9_\-\.]{15,}\b/gi, replacement: '$1[REDACTED_TOKEN]' },
  // Common password flags and variables: e.g. -p secret, --password=secret, password="foo", PASSWD=bar
  { pattern: /(--password[=\s]+|--passwd[=\s]+|-p\s+)(['"]?)([^\s'"]+)\2/gi, replacement: '$1$2[REDACTED_PASS]$2' },
  { pattern: /\b(password|passwd|secret|token|api_key|apikey|bearer|auth)[=\s:]+(['"]?)(?!\[REDACTED)([^\s'"]+)\2/gi, replacement: '$1=$2[REDACTED]$2' }
];

export class DynamoDBService {
  constructor() {
    this.client = null;
    this.docClient = null;
    this.initialized = false;
    this.connected = false;
    this.lastError = null;

    // Asynchronous Bounded Logging Queue
    this.queue = [];
    this.isProcessing = false;
    this.totalLogged = 0;
    this.totalFailed = 0;
    this.maxQueueSize = config.maxLogQueueSize || 1000;
    this.maxRetries = config.logMaxRetries || 3;
    this.eventSeq = 0;

    // Rate limiting tracking per session: sessionId -> { count: number, lastReset: number }
    this.sessionRates = new Map();

    this.initClient();
  }

  /**
   * Initializes AWS SDK v3 DynamoDB Document Client using the default credential provider chain.
   * On AWS EC2, credentials are automatically resolved from the EC2 Instance Metadata Service
   * via the attached IAM Role 'VirtualLabEC2Role'.
   */
  initClient() {
    if (!config.commandLoggingEnabled) {
      console.log('[DynamoDBService] Command logging is disabled via configuration.');
      return;
    }

    if (DynamoDBClient && DynamoDBDocumentClient) {
      try {
        this.client = new DynamoDBClient({
          region: config.awsRegion
        });

        this.docClient = DynamoDBDocumentClient.from(this.client, {
          marshallOptions: {
            removeUndefinedValues: true,
            convertEmptyValues: true
          }
        });

        this.initialized = true;
        console.log(`[DynamoDBService] DynamoDB client initialized for region '${config.awsRegion}' on table '${config.dynamoDbTableName}'.`);
      } catch (err) {
        this.lastError = err.message;
        console.error(`[DynamoDBService] Failed to initialize DynamoDB client: ${err.message}`);
      }
    }
  }

  /**
   * Verify connectivity to DynamoDB table using DescribeTable.
   */
  async checkConnectivity() {
    if (!config.commandLoggingEnabled) {
      return {
        enabled: false,
        connected: false,
        status: 'DISABLED',
        tableName: config.dynamoDbTableName,
        message: 'Command logging disabled by configuration'
      };
    }

    if (!this.client || !DescribeTableCommand) {
      return {
        enabled: true,
        connected: false,
        status: 'SDK_NOT_LOADED',
        tableName: config.dynamoDbTableName,
        error: this.lastError || 'AWS SDK v3 client not initialized'
      };
    }

    try {
      const response = await this.client.send(
        new DescribeTableCommand({ TableName: config.dynamoDbTableName })
      );
      this.connected = true;
      this.lastError = null;
      return {
        enabled: true,
        connected: true,
        status: response.Table?.TableStatus || 'ACTIVE',
        tableName: config.dynamoDbTableName,
        itemCount: response.Table?.ItemCount ?? 0,
        region: config.awsRegion
      };
    } catch (err) {
      this.connected = false;
      this.lastError = err.message;
      return {
        enabled: true,
        connected: false,
        status: 'UNREACHABLE',
        tableName: config.dynamoDbTableName,
        region: config.awsRegion,
        error: err.message
      };
    }
  }

  /**
   * Redacts sensitive secrets, passwords, tokens and AWS keys from commands.
   */
  sanitizeCommandText(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    let text = rawText.trim();

    // Enforce max command length (1024 characters)
    if (text.length > 1024) {
      text = text.substring(0, 1024) + '... [truncated]';
    }

    // Apply redactions
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      text = text.replace(pattern, replacement);
    }

    return text;
  }

  /**
   * Enforces command logging rate limit per session (max 20 commands per second).
   */
  isRateLimited(sessionId) {
    const now = Date.now();
    const rate = this.sessionRates.get(sessionId) || { count: 0, lastReset: now };

    if (now - rate.lastReset > 1000) {
      rate.count = 0;
      rate.lastReset = now;
    }

    rate.count++;
    this.sessionRates.set(sessionId, rate);

    return rate.count > 20;
  }

  /**
   * Asynchronously enqueue an event for DynamoDB storage.
   * Completely non-blocking for the student's interactive terminal.
   */
  logEvent({
    sessionId,
    studentId,
    studentName,
    labId,
    containerId,
    command,
    eventType = 'COMMAND_HISTORY',
    exitCode = undefined
  }) {
    if (!config.commandLoggingEnabled) return;
    if (!sessionId) {
      console.warn('[DynamoDBService] Dropping event: missing sessionId');
      return;
    }

    // Rate limit check for COMMAND_HISTORY
    if (eventType === 'COMMAND_HISTORY' && this.isRateLimited(sessionId)) {
      console.warn(`[DynamoDBService] Rate limit exceeded for session ${sessionId}. Command event dropped.`);
      return;
    }

    // Sanitize command text
    const sanitizedCommand = this.sanitizeCommandText(command);
    if (!sanitizedCommand && eventType === 'COMMAND_HISTORY') {
      return; // Skip empty whitespace-only commands
    }

    const now = new Date();
    const isoTimestamp = now.toISOString();
    const seq = (this.eventSeq = (this.eventSeq + 1) % 1000000).toString().padStart(6, '0');
    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex');
    const eventId = `${isoTimestamp}_${seq}_${uniqueId}`;

    const record = {
      sessionId: String(sessionId),
      eventId,
      studentId: String(studentId || 'unknown'),
      studentName: String(studentName || 'Student'),
      labId: String(labId || 'unknown'),
      containerId: String(containerId || '').slice(0, 12),
      command: sanitizedCommand,
      timestamp: isoTimestamp,
      eventType: String(eventType),
      ...(exitCode !== undefined && typeof exitCode === 'number' ? { exitCode } : {})
    };

    // Bounded queue protection
    if (this.queue.length >= this.maxQueueSize) {
      console.warn(`[DynamoDBService] Logging queue full (${this.queue.length} items). Dropping oldest event.`);
      this.queue.shift();
      this.totalFailed++;
    }

    this.queue.push({ record, attempts: 0 });

    // Trigger async processing
    this.processQueue().catch(err => {
      console.warn(`[DynamoDBService] Async worker error: ${err.message}`);
    });
  }

  /**
   * Helper to execute PutItem via AWS SDK PutCommand or mock docClient.
   */
  async sendPutItem(record) {
    if (PutCommand && this.docClient) {
      return await this.docClient.send(
        new PutCommand({
          TableName: config.dynamoDbTableName,
          Item: record
        })
      );
    } else if (this.docClient && typeof this.docClient.send === 'function') {
      return await this.docClient.send({
        constructor: { name: 'PutCommand' },
        input: {
          TableName: config.dynamoDbTableName,
          Item: record
        }
      });
    }
    throw new Error('No DynamoDB client available');
  }

  /**
   * Helper to execute Query via AWS SDK QueryCommand or mock docClient.
   */
  async sendQuery(params) {
    if (QueryCommand && this.docClient) {
      return await this.docClient.send(new QueryCommand(params));
    } else if (this.docClient && typeof this.docClient.send === 'function') {
      return await this.docClient.send({
        constructor: { name: 'QueryCommand' },
        input: params
      });
    }
    return { Items: [], Count: 0 };
  }

  /**
   * Dedicated background worker processing the queue with retries.
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        const { record } = item;

        // If docClient is ready, write to DynamoDB
        if (this.docClient) {
          try {
            await this.sendPutItem(record);

            this.totalLogged++;
            this.connected = true;
            this.lastError = null;
            this.queue.shift(); // Successfully persisted
          } catch (err) {
            item.attempts++;
            this.lastError = err.message;
            this.connected = false;

            if (item.attempts >= this.maxRetries) {
              console.warn(`[DynamoDBService] Permanent failure writing event ${record.eventId} after ${this.maxRetries} retries: ${err.message}`);
              this.totalFailed++;
              this.queue.shift(); // Drop after max retries
            } else {
              console.warn(`[DynamoDBService] Transient error writing event ${record.eventId} (attempt ${item.attempts}): ${err.message}. Retrying...`);
              await new Promise(r => setTimeout(r, 200 * Math.pow(2, item.attempts)));
              break; // Yield to process next loop
            }
          }
        } else {
          // Mock / Fallback mode: simulate write success in test environments
          this.totalLogged++;
          this.queue.shift();
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 500);
      }
    }
  }

  /**
   * Retrieve session-wise command history using QueryCommand with pagination.
   */
  async getSessionHistory(sessionId, { limit = 100, nextToken = null } = {}) {
    if (!sessionId) {
      throw new Error('sessionId is required to query command history');
    }

    if (!this.docClient) {
      return {
        items: [],
        count: 0,
        nextToken: null,
        message: 'DynamoDB service client is in offline fallback mode.'
      };
    }

    const params = {
      TableName: config.dynamoDbTableName,
      KeyConditionExpression: 'sessionId = :sid',
      ExpressionAttributeValues: {
        ':sid': String(sessionId)
      },
      ScanIndexForward: true, // Chronological order
      Limit: Math.min(Math.max(1, limit), 200)
    };

    if (nextToken) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf8'));
      } catch (e) {
        console.warn(`[DynamoDBService] Invalid pagination nextToken: ${e.message}`);
      }
    }

    const result = await this.sendQuery(params);

    let encodedNextToken = null;
    if (result.LastEvaluatedKey) {
      encodedNextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return {
      items: result.Items || [],
      count: result.Count || 0,
      nextToken: encodedNextToken
    };
  }

  /**
   * Flushes any pending events before session container destruction or server shutdown.
   */
  async flushQueue(timeoutMs = 3000) {
    const start = Date.now();
    while (this.queue.length > 0 && Date.now() - start < timeoutMs) {
      await this.processQueue();
      if (this.queue.length > 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  /**
   * Health status summary for /api/health
   */
  getHealthStatus() {
    return {
      enabled: config.commandLoggingEnabled,
      connected: this.connected,
      tableName: config.dynamoDbTableName,
      region: config.awsRegion,
      queue: {
        pendingEvents: this.queue.length,
        totalLogged: this.totalLogged,
        totalFailed: this.totalFailed
      },
      error: this.lastError
    };
  }
}

// Global singleton instance
const GLOBAL_DYNAMO_KEY = Symbol.for('virtuallab.dynamoDBService.singleton');
if (!globalThis[GLOBAL_DYNAMO_KEY]) {
  globalThis[GLOBAL_DYNAMO_KEY] = new DynamoDBService();
}

export const dynamoDBService = globalThis[GLOBAL_DYNAMO_KEY];

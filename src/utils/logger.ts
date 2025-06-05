import winston from 'winston';
import path from 'path';

// Define sensitive patterns to mask in logs
const SENSITIVE_PATTERNS = [
  /(api[_-]?key|token|password|secret|auth)[_-]?[=:]\s*['"]?[^'"\s]+['"]?/gi,
  /(https?:\/\/[^:]+):([^@]+)@/g,
  /(jwt|bearer)\s+[a-zA-Z0-9\-_=]+\.?[a-zA-Z0-9\-_=]+\.?[a-zA-Z0-9\-_=]*/gi
];

// Sanitize sensitive information from log messages
function sanitizeLogMessage(message: unknown): string {
  const messageStr = String(message);
  return SENSITIVE_PATTERNS.reduce((msg, pattern) => {
    return msg.replace(pattern, (match) => {
      if (match.includes('@')) {
        // For URLs with credentials, keep the host but mask credentials
        return match.replace(/(https?:\/\/[^:]+):([^@]+)@/, '$1:***@');
      }
      return match.replace(/[^=:]*[=:]\s*['"]?[^'"\s]+['"]?/, '***');
    });
  }, messageStr);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    const sanitizedMessage = sanitizeLogMessage(message);
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `${timestamp} [${level}]: ${sanitizedMessage} ${meta}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'qa-ai-agent' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(sanitizeLogMessage(message.trim()));
  }
}; 
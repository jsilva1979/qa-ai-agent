import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info', // Log level based on environment
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack trace for errors
    format.splat(), // Handle string interpolation
    format.json() // Log in JSON format
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), // Add colors for console output
        format.simple() // Simple format for console
      )
    }),
    // You can add more transports here, e.g., to log to a file
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger; 
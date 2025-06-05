import { DataSource } from 'typeorm';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { Interaction } from '../models/Interaction';
import { Knowledge } from '../models/Knowledge';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500, // Close a connection after it has been used this many times
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Log connection events
pool.on('connect', () => {
  logger.info('Connected to database');
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle client', { error: err.message });
});

pool.on('acquire', () => {
  logger.debug('Client acquired from pool');
});

pool.on('remove', () => {
  logger.debug('Client removed from pool');
});

// Test database connection
export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    logger.info('Database connection test successful');
    client.release();
  } catch (error) {
    logger.error('Database connection test failed', { error: (error as Error).message });
    throw error;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', { error: (error as Error).message });
    throw error;
  }
}

// Types for our database tables
export interface DocumentEmbedding {
  id: string;
  source_type: string;
  source_id: string;
  content: string;
  embedding: number[];
  created_at: Date;
}

export interface QASession {
  id: string;
  jira_issue_key: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed';
  created_at: Date;
  completed_at: Date | null;
}

export interface QAResponse {
  id: string;
  session_id: string;
  context_used: string;
  response: string;
  action_taken: string;
  created_at: Date;
}

// Log environment variables (remove in production)
// console.log('Database Configuration:', {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     username: process.env.DB_USER,
//     database: process.env.DB_NAME,
//     // Don't log the password for security reasons
// });

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'qa_ai_agent',
    synchronize: false,
    logging: ["error"],
    entities: [Interaction, Knowledge],
    migrations: [],
    subscribers: [],
}); 
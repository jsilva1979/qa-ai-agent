import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { DocumentEmbedding } from '../models/DocumentEmbedding';

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    this.client = createClient({
      url: redisUrl,
      socket: {
        tls: redisUrl.startsWith('rediss://'),
        rejectUnauthorized: true
      },
      password: process.env.REDIS_PASSWORD
    });

    this.client.on('error', (err: Error) => {
      logger.error('Redis Client Error', { error: err.message });
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting');
    });

    this.client.on('end', () => {
      logger.info('Redis Client Connection Ended');
      this.isConnected = false;
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    
    // Validate key and value
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid Redis key');
    }
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid Redis value');
    }

    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    await this.client.del(key);
  }

  // Add method to check connection status
  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Placeholder method for similarity search
  async findSimilarDocuments(embedding: number[], limit: number = 5): Promise<DocumentEmbedding[]> {
    // TODO: Implement actual Redis similarity search logic
    console.log('Placeholder findSimilarDocuments called', { embedding, limit });
    return []; // Return empty array for now
  }
} 
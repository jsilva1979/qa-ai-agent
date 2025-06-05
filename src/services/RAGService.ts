import { pool } from '../config/database';
import { DocumentEmbedding } from '../models/DocumentEmbedding';
import { QASession } from '../models/QASession';
import { QAResponse } from '../models/QAResponse';
import { QAResponseFeedback } from '../models/QAResponseFeedback';
import { RedisService } from './RedisService';

export class RAGService {
  private redis: RedisService;

  constructor() {
    this.redis = new RedisService();
  }

  async storeDocument(document: DocumentEmbedding): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO document_embeddings (content, embedding, metadata, source_type) VALUES ($1, $2, $3, $4)',
        [document.content, document.embedding, document.metadata, document.source_type]
      );
    } finally {
      client.release();
    }
  }

  async findSimilarDocuments(query: number[], limit: number = 5): Promise<DocumentEmbedding[]> {
    return this.redis.findSimilarDocuments(query, limit);
  }

  async createQASession(userId: string): Promise<QASession> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO qa_sessions (user_id) VALUES ($1) RETURNING *',
        [userId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async storeQAResponse(sessionId: string, response: QAResponse): Promise<QAResponse> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO qa_responses (session_id, question, answer, context, response) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [sessionId, response.question, response.answer, response.context, response.response]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async submitFeedback(responseId: string, feedback: QAResponseFeedback): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO qa_response_feedback (response_id, rating, comment, user_id) VALUES ($1, $2, $3, $4)',
        [responseId, feedback.rating, feedback.comment, feedback.userId]
      );
    } finally {
      client.release();
    }
  }

  async completeQASession(sessionId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE qa_sessions SET completed_at = NOW() WHERE id = $1',
        [sessionId]
      );
    } finally {
      client.release();
    }
  }
} 
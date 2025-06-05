export interface DocumentEmbedding {
  id?: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  source_type?: string;
  source_id?: string;
  created_at?: Date;
  similarity?: number;
} 
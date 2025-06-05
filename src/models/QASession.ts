export interface QASession {
  id?: string;
  user_id: string;
  created_at?: Date;
  completed_at?: Date;
  status?: 'active' | 'completed';
} 
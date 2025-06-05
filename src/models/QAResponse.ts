export interface QAResponse {
  id?: string;
  session_id: string;
  question: string;
  answer: string;
  context: string;
  response: string;
  created_at?: Date;
} 
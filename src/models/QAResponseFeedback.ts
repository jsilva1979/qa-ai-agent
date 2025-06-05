export interface QAResponseFeedback {
  rating: 'positive' | 'negative';
  comment: string;
  userId: string;
  created_at?: Date;
} 
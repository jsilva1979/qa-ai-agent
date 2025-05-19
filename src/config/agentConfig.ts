/**
 * Configurações e interfaces para o agente de análise de logs
 */

// Configurações do modelo Gemini
export const GEMINI_CONFIG = {
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
    topP: 0.8,
    topK: 40
  }
};

// Níveis de severidade para erros
export type SeverityLevel = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';

// Interface para análise de erro
export interface ErrorAnalysis {
  errorType: string;
  confidence: number;
  suggestedFix: string;
  impact: {
    severity: SeverityLevel;
    affectedAreas: string[];
    userImpact: string;
  };
  similarIssues: {
    description: string;
    solution: string;
    date: string;
  }[];
}

// Interface para priorização de erros
export interface ErrorPriority {
  log: string;
  priority: number;
  reason: string;
}

// Interface para análise de impacto em produção
export interface ProductionImpact {
  affectedUsers: number;
  businessImpact: string;
  riskLevel: SeverityLevel;
  mitigationSteps: string[];
}

// Interface para previsão de problemas similares
export interface PredictedIssue {
  description: string;
  probability: number;
  preventionSteps: string[];
}

// Interface para análise de performance
export interface PerformanceAnalysis {
  bottlenecks: string[];
  optimizationSuggestions: string[];
  resourceUsage: {
    cpu: string;
    memory: string;
    network: string;
  };
}

// Configurações de cache
export const CACHE_CONFIG = {
  enabled: true,
  ttl: 3600, // 1 hora em segundos
  maxSize: 100 // número máximo de itens em cache
};

// Configurações de logging
export const LOG_CONFIG = {
  level: 'info',
  format: 'json',
  timestamp: true
}; 
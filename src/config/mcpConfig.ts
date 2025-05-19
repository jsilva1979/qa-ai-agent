export interface MCPContext {
  role: string;
  task: string;
  constraints: string[];
  examples?: string[];
  metadata: {
    timestamp: string;
    version: string;
    model: string;
  };
}

export interface MCPResponse {
  content: string;
  metadata: {
    confidence: number;
    processingTime: number;
    tokensUsed: number;
  };
  context: MCPContext;
}

export const MCP_CONFIG = {
  version: "1.0.0",
  model: "gemini-1.5-flash",
  maxTokens: 1024,
  temperature: 0.7,
  contextTemplate: {
    role: "Você é um especialista em QA e análise de logs",
    task: "Analisar logs de erro e fornecer explicações técnicas",
    constraints: [
      "Manter respostas concisas e técnicas",
      "Seguir o formato padronizado de resposta",
      "Incluir metadados relevantes",
      "Priorizar informações críticas"
    ],
    metadata: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      model: "gemini-1.5-flash"
    }
  }
}; 
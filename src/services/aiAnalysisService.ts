import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { CacheManager } from "../utils/cacheManager";
import {
  GEMINI_CONFIG,
  ErrorAnalysis,
  ErrorPriority,
  ProductionImpact,
  PredictedIssue,
  PerformanceAnalysis,
  CACHE_CONFIG
} from "../config/agentConfig";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("❌ API KEY do Gemini não encontrada no .env (GEMINI_API_KEY)");
}

const client = new GoogleGenerativeAI(API_KEY);
const cacheManager = new CacheManager();

export class AIAnalysisService {
  private model = client.getGenerativeModel({ 
    model: GEMINI_CONFIG.model,
    generationConfig: GEMINI_CONFIG.generationConfig
  });

  /**
   * Analisa um erro e sugere correções automáticas
   */
  async suggestErrorFix(logContent: string): Promise<ErrorAnalysis> {
    const cacheKey = `error_fix_${this.hashContent(logContent)}`;
    
    if (CACHE_CONFIG.enabled) {
      const cached = await cacheManager.get(cacheKey);
      if (cached) return cached as ErrorAnalysis;
    }

    const prompt = `
Analise o seguinte erro e forneça uma resposta em formato JSON.
IMPORTANTE: 
1. A resposta DEVE ser um JSON válido, sem texto adicional antes ou depois.
2. TODAS as strings do JSON DEVEM estar em PORTUGUÊS DO BRASIL.

Log para análise:
${logContent}

Retorne APENAS o JSON com a seguinte estrutura:
{
  "errorType": "string (em português)",
  "confidence": number,
  "suggestedFix": "string (em português)",
  "impact": {
    "severity": "BAIXO|MÉDIO|ALTO|CRÍTICO",
    "affectedAreas": ["string (em português)"],
    "userImpact": "string (em português)"
  },
  "similarIssues": [
    {
      "description": "string (em português)",
      "solution": "string (em português)",
      "date": "string"
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Log da resposta para debug
      console.log('Resposta da IA:', response);
      
      // Tenta extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Resposta não contém JSON válido: ${response}`);
      }
      
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validação básica da estrutura
      if (!parsed.errorType || !parsed.confidence || !parsed.suggestedFix || !parsed.impact) {
        throw new Error('JSON não contém todos os campos necessários');
      }
      
      const analysis = parsed as ErrorAnalysis;
      
      if (CACHE_CONFIG.enabled) {
        await cacheManager.set(cacheKey, analysis, CACHE_CONFIG.ttl);
      }
      
      return analysis;
    } catch (error: any) {
      console.error('Erro ao processar resposta:', error);
      throw new Error(`Falha ao processar resposta da IA: ${error.message}`);
    }
  }

  /**
   * Prioriza erros com base em seu impacto e frequência
   */
  async prioritizeErrors(logs: string[]): Promise<ErrorPriority[]> {
    const cacheKey = `error_priority_${this.hashContent(logs.join(''))}`;
    
    if (CACHE_CONFIG.enabled) {
      const cached = await cacheManager.get(cacheKey);
      if (cached) return cached as ErrorPriority[];
    }

    const prompt = `
Analise os seguintes logs e priorize-os.
IMPORTANTE: 
1. A resposta DEVE ser um JSON válido, sem texto adicional antes ou depois.
2. TODAS as strings do JSON DEVEM estar em PORTUGUÊS DO BRASIL.

Logs para análise:
${logs.join('\n---\n')}

Retorne APENAS o JSON com a seguinte estrutura:
[
  {
    "log": "string (em português)",
    "priority": number,
    "reason": "string (em português)"
  }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Log da resposta para debug
      console.log('Resposta da IA:', response);
      
      // Tenta extrair JSON da resposta
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error(`Resposta não contém JSON válido: ${response}`);
      }
      
      const jsonStr = jsonMatch[0];
      const priorities = JSON.parse(jsonStr) as ErrorPriority[];
      
      if (CACHE_CONFIG.enabled) {
        await cacheManager.set(cacheKey, priorities, CACHE_CONFIG.ttl);
      }
      
      return priorities;
    } catch (error: any) {
      console.error('Erro ao processar resposta:', error);
      throw new Error(`Falha ao processar resposta da IA: ${error.message}`);
    }
  }

  /**
   * Analisa o impacto de um erro em produção
   */
  async analyzeProductionImpact(logContent: string): Promise<ProductionImpact> {
    const cacheKey = `production_impact_${this.hashContent(logContent)}`;
    
    if (CACHE_CONFIG.enabled) {
      const cached = await cacheManager.get(cacheKey);
      if (cached) return cached as ProductionImpact;
    }

    const prompt = `
Analise o impacto do seguinte erro em produção.
IMPORTANTE: 
1. A resposta DEVE ser um JSON válido, sem texto adicional antes ou depois.
2. TODAS as strings do JSON DEVEM estar em PORTUGUÊS DO BRASIL.

Log para análise:
${logContent}

Retorne APENAS o JSON com a seguinte estrutura:
{
  "affectedUsers": number,
  "businessImpact": "string (em português)",
  "riskLevel": "BAIXO|MÉDIO|ALTO",
  "mitigationSteps": ["string (em português)"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Log da resposta para debug
      console.log('Resposta da IA:', response);
      
      // Tenta extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Resposta não contém JSON válido: ${response}`);
      }
      
      const jsonStr = jsonMatch[0];
      const impact = JSON.parse(jsonStr) as ProductionImpact;
      
      if (CACHE_CONFIG.enabled) {
        await cacheManager.set(cacheKey, impact, CACHE_CONFIG.ttl);
      }
      
      return impact;
    } catch (error: any) {
      console.error('Erro ao processar resposta:', error);
      throw new Error(`Falha ao processar resposta da IA: ${error.message}`);
    }
  }

  /**
   * Prevê problemas similares que podem ocorrer
   */
  async predictSimilarIssues(logContent: string): Promise<{ predictedIssues: PredictedIssue[] }> {
    const cacheKey = `similar_issues_${this.hashContent(logContent)}`;
    
    if (CACHE_CONFIG.enabled) {
      const cached = await cacheManager.get(cacheKey);
      if (cached) return cached as { predictedIssues: PredictedIssue[] };
    }

    const prompt = `
Com base no seguinte erro, preveja problemas similares.
IMPORTANTE: 
1. A resposta DEVE ser um JSON válido, sem texto adicional antes ou depois.
2. TODAS as strings do JSON DEVEM estar em PORTUGUÊS DO BRASIL.

Log para análise:
${logContent}

Retorne APENAS o JSON com a seguinte estrutura:
{
  "predictedIssues": [
    {
      "description": "string (em português)",
      "probability": number,
      "preventionSteps": ["string (em português)"]
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Log da resposta para debug
      console.log('Resposta da IA:', response);
      
      // Tenta extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Resposta não contém JSON válido: ${response}`);
      }
      
      const jsonStr = jsonMatch[0];
      const prediction = JSON.parse(jsonStr) as { predictedIssues: PredictedIssue[] };
      
      if (CACHE_CONFIG.enabled) {
        await cacheManager.set(cacheKey, prediction, CACHE_CONFIG.ttl);
      }
      
      return prediction;
    } catch (error: any) {
      console.error('Erro ao processar resposta:', error);
      throw new Error(`Falha ao processar resposta da IA: ${error.message}`);
    }
  }

  /**
   * Gera um hash simples para o conteúdo
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
} 
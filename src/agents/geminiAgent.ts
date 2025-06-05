import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { CacheManager } from "../utils/cacheManager";
import { AGENT_INSTRUCTIONS } from "../config/agentInstructions";
import { AgentResponse, TokenUsage } from "../config/agentConfig";
import path from 'path';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Log para debug das variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configurado' : '❌ Não configurado');
console.log('Diretório atual:', process.cwd());
console.log('Caminho do .env:', path.join(process.cwd(), '.env'));

const API_KEY = process.env.GEMINI_API_KEY;
console.log('🔑 API Key configurada:', API_KEY ? '✅ Sim' : '❌ Não');

if (!API_KEY) {
  throw new Error("❌ API KEY do Gemini não encontrada no .env (GEMINI_API_KEY)");
}

const client = new GoogleGenerativeAI(API_KEY);
const MAX_INPUT_LENGTH = 8000;
const cacheManager = new CacheManager();

/**
 * Gera uma explicação para um log de erro usando a IA Gemini.
 * @param logContent Conteúdo bruto do log.
 * @returns Resposta com conteúdo e metadados de uso.
 */
export async function gerarExplicacaoErro(logContent: string): Promise<AgentResponse> {
  const startTime = Date.now();
  try {
    // Verifica cache
    const cachedResponse = await cacheManager.get<AgentResponse>(logContent);
    if (cachedResponse && cachedResponse.content) {
      console.log('📦 Usando resposta em cache');
      // Garante que a resposta do cache tenha todas as propriedades necessárias
      const response: AgentResponse = {
        content: cachedResponse.content,
        tokenUsage: cachedResponse.tokenUsage || {
          promptTokens: Math.ceil(cachedResponse.content.length / 4),
          completionTokens: Math.ceil(cachedResponse.content.length / 4),
          totalTokens: Math.ceil(cachedResponse.content.length / 2),
          timestamp: new Date().toISOString(),
          model: "gemini-1.5-flash"
        },
        processingTime: Date.now() - startTime
      };
      return response;
    }

    console.log('🤖 Gerando nova resposta com Gemini...');
    const sanitizedInput = logContent.length > MAX_INPUT_LENGTH
      ? logContent.substring(0, MAX_INPUT_LENGTH)
      : logContent;

    const model = client.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 40
      }
    });

    const prompt = `
${AGENT_INSTRUCTIONS.role}

Por favor, analise o seguinte log de erro seguindo estas diretrizes:
${AGENT_INSTRUCTIONS.analysisGuidelines.map(g => `- ${g}`).join('\n')}

Formate sua resposta nas seguintes seções:
${AGENT_INSTRUCTIONS.responseFormat.sections.map(s => `## ${s}`).join('\n')}

Log para análise:
${sanitizedInput}
`;

    console.log('📝 Enviando prompt para o Gemini...');
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) {
      throw new Error("Resposta da IA vazia.");
    }

    // Calcula uso de tokens (estimativa aproximada)
    const estimatedTokens = Math.ceil(text.length / 4); // Estimativa aproximada: 1 token ~ 4 caracteres
    const tokenUsage: TokenUsage = {
      promptTokens: estimatedTokens,
      completionTokens: estimatedTokens,
      totalTokens: estimatedTokens * 2,
      timestamp: new Date().toISOString(),
      model: "gemini-1.5-flash"
    };

    const response: AgentResponse = {
      content: text,
      tokenUsage,
      processingTime: Date.now() - startTime
    };

    console.log('💾 Salvando resposta no cache...');
    // Salva no cache
    await cacheManager.set(logContent, response);

    return response;
  } catch (error: any) {
    console.error("❌ Erro detalhado:", error);
    if (error.details && error.details.error_message) {
      throw new Error(`Erro de Gemini: ${error.details.error_message}`);
    } else if (error.response) {
      throw new Error(`Erro de resposta Gemini: ${error.response.status}`);
    } else {
      throw new Error("Erro ao gerar explicação com IA. Verifique sua conexão ou chave da API.");
    }
  }
}

// Exemplo de uso
async function executar() {
  try {
    const logErro = (`
    Algum erro aqui:
    Erro de conexão com o banco de dados.
    Detalhes: ERRO 1001
    Dados passados para a consulta: {nome: "João", idade: 30}
    ...mais detalhes...`);

    const response = await gerarExplicacaoErro(logErro);
    console.log("Resposta:", response.content);
    console.log("\n📊 Métricas de uso:");
    console.log(`- Tokens do prompt: ${response.tokenUsage.promptTokens}`);
    console.log(`- Tokens da resposta: ${response.tokenUsage.completionTokens}`);
    console.log(`- Total de tokens: ${response.tokenUsage.totalTokens}`);
    console.log(`- Tempo de processamento: ${response.processingTime}ms`);
  } catch (error) {
    console.error("Erro ao executar:", error);
  }
}

executar();
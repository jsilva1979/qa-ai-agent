import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { CacheManager } from "../utils/cacheManager";
import { AGENT_INSTRUCTIONS } from "../config/agentInstructions";
import { MCP_CONFIG, MCPContext, MCPResponse } from "../config/mcpConfig";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("❌ API KEY do Gemini não encontrada no .env (GEMINI_API_KEY)");
}

const client = new GoogleGenerativeAI(API_KEY);
const MAX_INPUT_LENGTH = 8000;
const cacheManager = new CacheManager();

/**
 * Gera uma explicação para um log de erro usando a IA Gemini.
 * @param logContent Conteúdo bruto do log.
 * @returns Explicação clara e didática para analistas de QA.
 */
export async function gerarExplicacaoErro(logContent: string): Promise<string> {
  try {
    // Verifica cache
    const cachedResponse = await cacheManager.get<string>(logContent);
    if (cachedResponse) {
      console.log('📦 Usando resposta em cache');
      return cachedResponse;
    }

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

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) {
      throw new Error("Resposta da IA vazia.");
    }

    // Salva no cache
    await cacheManager.set(logContent, text);

    return text;
  } catch (error: any) {
    console.error("Erro detalhado:", error);
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
    console.log("Resposta:", response);
  } catch (error) {
    console.error("Erro ao executar:", error);
  }
}

executar();
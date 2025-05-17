import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("❌ API KEY do Gemini não encontrada no .env (GEMINI_API_KEY)");
}

const client = new GoogleGenerativeAI(API_KEY);
const MAX_INPUT_LENGTH = 8000; // Limite seguro para input do Gemini

/**
 * Gera uma explicação para um log de erro usando a IA Gemini.
 * @param logContent Conteúdo bruto do log.
 * @returns Explicação clara e didática para analistas de QA.
 */
export async function gerarExplicacaoErro(logContent: string): Promise<string> {
  try {
    const sanitizedInput = logContent.length > MAX_INPUT_LENGTH
      ? logContent.substring(0, MAX_INPUT_LENGTH)
      : logContent;

		const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
		const result = await model.generateContent({
		  contents: [
			{
			  role: "user",
			  parts: [
				{ text: `Explique o seguinte erro de forma clara e didática para um analista de QA:\n\n${sanitizedInput}` }
			  ]
			}
		  ],
		  generationConfig: {
			temperature: 0.7,
			maxOutputTokens: 512
		  }
		});
	
		const text = result.response.text().trim();

    if (!text) {
      throw new Error("Resposta da IA vazia.");
    }

    return text;
  } catch (error: any) {
    console.error("❌ Erro ao gerar explicação com Gemini:", error.message);
		
		if (error.details && error.details.error_message) {
			console.error("Erro detalhado do Gemini:", error.details.error_message);
			// Lançar um erro mais específico, útil para debugging
      throw new Error(`Erro de Gemini: ${error.details.error_message} Detalhes: ${JSON.stringify(error.details, null, 2)}`); 
		} else if (error.response) {
			console.error("Erro de resposta Gemini:", error.response.status);
			throw new Error(`Erro de resposta Gemini: ${error.response.status} ${error.message}`); 
		} else {

			throw new Error("Erro ao gerar explicação com IA. Verifique sua conexão ou chave da API. Detalhes do erro: " + JSON.stringify(error, null, 2));
		}
  }
}

//Exemplo de uso (incluindo tratamento de erros):
async function executar() {
	try {
		const logErro = `
		Algum erro aqui:
		Erro de conexão com o banco de dados.
		Detalhes: ERRO 1001
		Dados passados para a consulta: {nome: "João", idade: 30}
		...mais detalhes...`;

		const explicacaoErro = await gerarExplicacaoErro(logErro);

		console.log(explicacaoErro);
	} catch (error) {
		console.error("Erro ao executar:", error);
	}
}

executar();
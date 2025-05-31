import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { gerarExplicacaoErro } from '../agents/geminiAgent';
import { TestLogger } from '../utils/testLogger';
import { SlackClient } from '../clients/slackClient';

async function main() {
  try {
    const logger = new TestLogger('manual_test');
    const slackClient = new SlackClient();
    const logPath = path.resolve('test-data', 'sample_log.txt');
    
    if (!fs.existsSync(logPath)) {
      throw new Error(`Arquivo de log não encontrado: ${logPath}`);
    }

    const logTexto = fs.readFileSync(logPath, 'utf-8');
    
    // Novo prompt detalhado para o agente Gemini
    const prompt = [
      "Você é um assistente de qualidade de software que interpreta logs de erro e gera uma análise clara para envio ao Slack. Sua resposta deve ser objetiva, técnica e formatada usando Markdown simples compatível com Slack. Siga estas instruções:",
      "",
      "1. Use *apenas `*` para negrito ou títulos*, sem excesso de asteriscos.",
      "2. Use emojis no início de seções para facilitar a leitura:  ",
      "   - 🔍 para *Contexto*  ",
      "   - 🤔 para *Causa Provável*  ",
      "   - ⚠️ para *Impacto*  ",
      "   - ✅ para *Recomendações*",
      "3. Utilize ` para destacar termos técnicos como IDs, serviços e datas.",
      "4. Evite usar `***`, `**` no meio de frases ou para destacar palavras comuns. Apenas use negrito para títulos ou pontos muito relevantes.",
      "5. Estruture a resposta em 4 seções:",
      "",
      "---",
      "",
      "🔍 *Contexto*  ",
      "Explique brevemente o que aconteceu, com base no log.",
      "",
      "🤔 *Causa Provável*  ",
      "Liste as causas mais prováveis. Use bullet points (`*` ) se necessário.",
      "",
      "⚠️ *Impacto*  ",
      "Descreva como isso pode afetar o usuário final ou o sistema.",
      "",
      "✅ *Recomendações*  ",
      "Liste ações técnicas para resolver ou evitar o problema. Use uma lista numerada (`1.`).",
      "",
      "---",
      "",
      "Analise o seguinte log de erro em português e gere a explicação seguindo as instruções acima:",
      "",
      logTexto
    ].join('\n');
    
    const explicacao = await gerarExplicacaoErro(prompt);

    if (!explicacao || !explicacao.content) {
      throw new Error('Não foi possível gerar uma explicação válida');
    }

    // Exibe a resposta formatada
    console.log('\n📄 Explicação do erro:\n');
    console.log(explicacao.content);
    
    // Prepara mensagem para o Slack com métricas
    const slackMessage = `${explicacao.content}\n\n---\n📊 *Métricas de Uso*\n` +
      `• Tokens do prompt: ${explicacao.tokenUsage?.promptTokens || 'N/A'}\n` +
      `• Tokens da resposta: ${explicacao.tokenUsage?.completionTokens || 'N/A'}\n` +
      `• Total de tokens: ${explicacao.tokenUsage?.totalTokens || 'N/A'}\n` +
      `• Tempo de processamento: ${explicacao.processingTime || 0}ms\n` +
      `• Modelo: ${explicacao.tokenUsage?.model || 'N/A'}\n` +
      `• Timestamp: ${explicacao.tokenUsage?.timestamp ? new Date(explicacao.tokenUsage.timestamp).toLocaleString() : 'N/A'}`;
    
    // Envia para o Slack via webhook
    console.log('\n📤 Enviando análise para o Slack via webhook...');
    
    const enviado = await slackClient.sendErrorAnalysis(slackMessage);
    if (enviado) {
      console.log(`\n✅ Análise enviada com sucesso para o Slack!\n`);
    } else {
      console.log('\n❌ Falha ao enviar análise para o Slack\n');
    }
    
    // Salva a explicação usando o TestLogger
    const logFileName = path.basename(logPath, path.extname(logPath));
    logger.info(`Análise do arquivo ${logFileName}:`);
    logger.info(slackMessage);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('\n❌ Erro:', errorMessage);
    
    // Log do erro de forma mais organizada
    const logger = new TestLogger('manual_test');
    logger.error(`Erro na análise: ${errorMessage}`);
  }
}

main();

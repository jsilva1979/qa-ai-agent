import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { gerarExplicacaoErro } from '../agents/geminiAgent';
import { commentOnJira, attachFileToJira } from './jiraClient';
import { LogCompressor } from '../utils/logCompressor';
import { TestLogger } from '../utils/testLogger';
import { MCPResponse } from '../config/mcpConfig';
import { AppDataSource } from '../config/database';
import { Interaction } from '../models/Interaction';

const logCompressor = new LogCompressor();
const testLogger = new TestLogger('evidenceAnalyzer');

function perguntarUsuario(pergunta: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${pergunta} (s/n): `, (resposta) => {
      rl.close();
      resolve(resposta.trim().toLowerCase() === 's');
    });
  });
}

export async function generateExplanationFromLog(logContent: string): Promise<MCPResponse> {
  const prompt = `Explique o seguinte erro de forma clara e didática para um analista de QA:\n\n${logContent}`;
  const response = await gerarExplicacaoErro(prompt);

  if (!response || !response.content) {
    throw new Error('❌ Não foi possível gerar explicação com a IA.');
  }

  console.log('🔎 Explicação gerada pela IA (prévia):\n', response.content);
  return {
    content: response.content,
    metadata: {
      confidence: 0,
      processingTime: 0,
      tokensUsed: 0
    },
    context: {
      role: '',
      task: '',
      constraints: [],
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        model: 'default'
      }
    }
  };
}

export async function runAgent(logPath: string, ticketKey: string) {
  try {
    const fullLogPath = path.resolve(logPath);

    if (!fs.existsSync(fullLogPath)) {
      throw new Error(`❌ O arquivo ${fullLogPath} não existe.`);
    }

    if (!ticketKey || ticketKey.trim() === "") {
      throw new Error('❌ ticketKey inválido ou não informado.');
    }

    // Lê e comprime o log
    const log = fs.readFileSync(fullLogPath, 'utf-8');
    const compressedLogPath = fullLogPath + '.gz';
    await logCompressor.compressAndSaveLog(log, compressedLogPath);
    console.log('📥 Log lido e comprimido com sucesso.');

    const response = await generateExplanationFromLog(log);

    console.log('\n🧠 Explicação gerada pela IA:\n');
    console.log(response.content);
    console.log('\n📊 Metadados da análise:');
    console.log(`- Tempo de processamento: ${response.metadata.processingTime}ms`);
    console.log(`- Confiança: ${(response.metadata.confidence * 100).toFixed(1)}%`);
    console.log(`- Tokens utilizados: ${response.metadata.tokensUsed}`);

    // Salva a explicação usando o TestLogger
    const logFileName = path.basename(fullLogPath, path.extname(fullLogPath));
    testLogger.logTestResult(logFileName, response.content);

    // Salvar interação no banco de dados
    const interaction = new Interaction();
    interaction.userQuery = log;
    interaction.aiResponse = response.content;
    interaction.context = ticketKey;
    interaction.metadata = JSON.stringify(response.metadata);
    await AppDataSource.manager.save(interaction);
    console.log('💾 Interação salva no banco de dados!');

    const desejaComentar = await perguntarUsuario('\n💬 Deseja comentar essa explicação no ticket do Jira?');
    if (desejaComentar) {
      await commentOnJira(ticketKey, response.content);
      console.log(`✅ Comentário enviado para o ticket ${ticketKey}`);
    } else {
      console.log('🚫 Comentário no Jira ignorado.');
    }

    const desejaAnexar = await perguntarUsuario('📎 Deseja anexar o arquivo de log como evidência no Jira?');
    if (desejaAnexar) {
      // Anexa o arquivo comprimido
      await attachFileToJira(ticketKey, compressedLogPath);
      console.log(`✅ Arquivo comprimido anexado ao ticket ${ticketKey}`);
      
      // Remove o arquivo comprimido após o upload
      fs.unlinkSync(compressedLogPath);
    } else {
      console.log('🚫 Anexo de evidência ignorado.');
      // Remove o arquivo comprimido se não for anexado
      fs.unlinkSync(compressedLogPath);
    }

  } catch (error) {
    console.error('❌ Erro ao rodar o agente:\n', (error instanceof Error ? error.stack : error));
    // Log do erro também usando o TestLogger
    const logFileName = path.basename(logPath, path.extname(logPath));
    testLogger.logTestResult(logFileName, `❌ Erro ao analisar o log: ${error instanceof Error ? error.message : error}`);
  }
}

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { gerarExplicacaoErro } from '../agents/geminiAgent'; // importar função refatorada
import { commentOnJira, attachFileToJira } from './jiraClient';

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

export async function generateExplanationFromLog(logContent: string): Promise<string> {
  // Esta função agora chama diretamente o geminiAgent
  const prompt = `Explique o seguinte erro de forma clara e didática para um analista de QA:\n\n${logContent}`;
  const explicacao = await gerarExplicacaoErro(prompt);

  if (!explicacao) {
    throw new Error('❌ Não foi possível gerar explicação com a IA.');
  }

  return explicacao;
}

export async function runAgent(logPath: string, ticketKey: string) {
  try {
    const log = fs.readFileSync(path.resolve(logPath), 'utf-8');
    console.log('📥 Log lido com sucesso.');

    const explicacao = await generateExplanationFromLog(log);

    console.log('\n🧠 Explicação gerada pela IA:\n');
    console.log(explicacao);

    const desejaComentar = await perguntarUsuario('\n💬 Deseja comentar essa explicação no ticket do Jira?');
    if (desejaComentar) {
      await commentOnJira(ticketKey, explicacao);
      console.log(`✅ Comentário enviado para o ticket ${ticketKey}`);
    } else {
      console.log('🚫 Comentário no Jira ignorado.');
    }

    const desejaAnexar = await perguntarUsuario('📎 Deseja anexar o arquivo de log como evidência no Jira?');
    if (desejaAnexar) {
      await attachFileToJira(ticketKey, path.resolve(logPath));
      console.log(`✅ Arquivo anexado ao ticket ${ticketKey}`);
    } else {
      console.log('🚫 Anexo de evidência ignorado.');
    }

  } catch (error) {
    console.error('❌ Erro ao rodar o agente:', error);
  }
}

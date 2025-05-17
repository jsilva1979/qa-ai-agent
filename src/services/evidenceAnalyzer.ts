import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { gerarExplicacaoErro } from '../agents/geminiAgent';
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
  const prompt = `Explique o seguinte erro de forma clara e didática para um analista de QA:\n\n${logContent}`;
  const explicacao = await gerarExplicacaoErro(prompt);

  if (!explicacao) {
    throw new Error('❌ Não foi possível gerar explicação com a IA.');
  }

  console.log('🔎 Explicação gerada pela IA (prévia):\n', explicacao);
  return explicacao;
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

    const log = fs.readFileSync(fullLogPath, 'utf-8');
    console.log('📥 Log lido com sucesso.');

    const explicacao = await generateExplanationFromLog(log);

    console.log('\n🧠 Explicação gerada pela IA:\n');
    console.log(explicacao);

    const explicacaoPath = fullLogPath.replace(/\.[^.]+$/, '.explicacao.md');
    fs.writeFileSync(explicacaoPath, explicacao, 'utf-8');
    console.log(`📝 Explicação salva em: ${explicacaoPath}`);

    const desejaComentar = await perguntarUsuario('\n💬 Deseja comentar essa explicação no ticket do Jira?');
    if (desejaComentar) {
      await commentOnJira(ticketKey, explicacao);
      console.log(`✅ Comentário enviado para o ticket ${ticketKey}`);
    } else {
      console.log('🚫 Comentário no Jira ignorado.');
    }

    const desejaAnexar = await perguntarUsuario('📎 Deseja anexar o arquivo de log como evidência no Jira?');
    if (desejaAnexar) {
      await attachFileToJira(ticketKey, fullLogPath);
      console.log(`✅ Arquivo anexado ao ticket ${ticketKey}`);
    } else {
      console.log('🚫 Anexo de evidência ignorado.');
    }

  } catch (error) {
    console.error('❌ Erro ao rodar o agente:\n', (error instanceof Error ? error.stack : error));
  }
}

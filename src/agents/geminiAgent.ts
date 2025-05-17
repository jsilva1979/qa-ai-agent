import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import { commentOnJira } from '../services/jiraClient';

dotenv.config();

const LOG_PATH = path.resolve('test-data/sample_log.txt');
const LOCAL_LOG_PATH = path.resolve('test-data/gemini_actions.log');

/**
 * Função que gera a explicação do erro a partir do log (simulando IA).
 * Recebe o conteúdo do log e retorna uma string explicativa.
 * Se quiser conectar a IA real, faça a chamada aqui.
 */
export async function gerarExplicacaoErro(logContent: string): Promise<string> {
  // Aqui você pode substituir pela sua integração com IA, por enquanto só simulo.
  // Exemplo: chamar um serviço que gera a explicação.
  // Vou simular um retorno simples para exemplificar:

  // Simulação simples (substitua pela chamada real):
  return `Explicação para o erro:\n\n${logContent.substring(0, 300)}... [texto gerado pela IA]`;
}

async function main() {
  try {
    // Lê o arquivo de log
    const logContent = fs.readFileSync(LOG_PATH, 'utf-8');

    console.log('\n📄 Analisando logs com IA...\n');

    // Chama a função que gera a explicação, passando o conteúdo do log
    const explanation = await gerarExplicacaoErro(logContent);

    console.log('📍 Explicação gerada:\n');
    console.log(explanation);

    // Pergunta para o usuário o que fazer
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer com essa explicação?',
        choices: [
          { name: 'Corrigir e reenviar logs', value: 'fix' },
          { name: 'Gerar resumo técnico e enviar para o Jira', value: 'jira' },
          { name: 'Salvar localmente e encerrar', value: 'local' },
        ],
      },
    ]);

    if (action === 'jira') {
      const { issueKey } = await inquirer.prompt([
        {
          type: 'input',
          name: 'issueKey',
          message: 'Informe o código do ticket Jira (ex: TQ-1):',
          validate: (input) => input.trim() !== '' || 'Informe um código válido',
        },
      ]);

      await commentOnJira(issueKey, explanation);
      console.log('\n📬 Comentário enviado ao Jira com sucesso!');
    }

    if (action === 'local') {
      fs.appendFileSync(
        LOCAL_LOG_PATH,
        `\n[${new Date().toISOString()}]\n${explanation}\n`
      );
      console.log('\n🗃️ Log salvo localmente em `gemini_actions.log`.');
    }

    if (action === 'fix') {
      console.log('\n🔧 Correção simulada. Integre aqui comandos ou pipelines para corrigir.');
    }

    console.log('\n✅ Agente finalizado.\n');
  } catch (err: any) {
    console.error('❌ Erro no agente:', err.message);
  }
}

if (require.main === module) {
  main();
}

import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { gerarExplicacaoErro } from '../agents/geminiAgent';
import { TestLogger } from '../utils/testLogger';

async function main() {
  try {
    const logger = new TestLogger();
    const logPath = path.resolve('test-data', 'sample_log.txt');
    
    if (!fs.existsSync(logPath)) {
      throw new Error(`Arquivo de log não encontrado: ${logPath}`);
    }

    const logTexto = fs.readFileSync(logPath, 'utf-8');
    const prompt = `Explique o erro abaixo em português:\n\n${logTexto}`;
    
    const explicacao = await gerarExplicacaoErro(prompt);

    if (!explicacao) {
      throw new Error('Não foi possível gerar uma explicação válida');
    }

    // Exibe a resposta formatada
    console.log('\n📄 Explicação do erro:\n');
    console.log(explicacao);
    
    // Salva a explicação usando o TestLogger
    const logFileName = path.basename(logPath, path.extname(logPath));
    logger.logTestResult(logFileName, explicacao);
    
    console.log('\n✅ Análise concluída com sucesso!\n');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('\n❌ Erro:', errorMessage);
    
    // Log do erro de forma mais organizada
    const logger = new TestLogger();
    logger.logTestResult('manual_test', `❌ Erro na análise: ${errorMessage}`);
  }
}

main();

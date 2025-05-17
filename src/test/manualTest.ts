import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { gerarExplicacaoErro } from '../agents/geminiAgent';

async function main() {
  const logPath = path.resolve('test-data', 'sample_log.txt');
  const logTexto = fs.readFileSync(logPath, 'utf-8');

  const prompt = `Explique o erro abaixo em português:\n\n${logTexto}`;
  const explicacao = await gerarExplicacaoErro(prompt);

  console.log('\n📄 Explicação do erro:\n');
  console.log(explicacao);
}

main();

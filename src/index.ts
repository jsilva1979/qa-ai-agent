import { runAgent } from './services/evidenceAnalyzer';
import { AppDataSource } from './config/database';

async function main() {
  await AppDataSource.initialize();
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Uso: yarn dev <logFile1> [logFile2 ...] <ticketJira>');
    process.exit(1);
  }

  const ticketKey = args[args.length - 1]; // último é ticket Jira
  const logFiles = args.slice(0, -1); // o resto são arquivos de log

  for (const logFile of logFiles) {
    console.log(`\n🔄 Processando arquivo de log: ${logFile}`);
    await runAgent(logFile, ticketKey);
  }

  await AppDataSource.destroy();
  console.log('\n✅ Todos os logs foram processados.');
}

main();

import { pool } from '../config/database';

async function seedPrompts() {
  try {
    console.log('Starting prompt seeding...');

    // Insert initial prompt versions
    await pool.query(`
      INSERT INTO prompt_versions (name, description, template, is_active)
      VALUES 
        ('Prompt Técnico v1', 'Primeira versão para análise de logs com foco técnico', 
         'Dado o seguinte contexto:\n{contexto}\nE o log abaixo:\n{log}\nGere uma análise técnica clara.', true),
         
        ('Prompt Explicativo v2', 'Versão mais descritiva para não técnicos', 
         'Você é um analista de QA explicando um erro. Contexto:\n{contexto}\nLog:\n{log}\nEscreva de forma simples e objetiva.', false)
      ON CONFLICT (name) DO NOTHING; -- Avoid inserting the same prompt name multiple times
    `);

    console.log('Prompt seeding completed successfully!');
  } catch (error) {
    console.error('Error during prompt seeding:', error);
    throw error;
  }
}

// Run the seeding script
seedPrompts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed prompts:', error);
    process.exit(1);
  }); 
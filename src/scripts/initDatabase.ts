import { pool } from '../config/database';

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Drop existing tables in reverse order of dependencies
    await client.query(`DROP TABLE IF EXISTS qa_feedback CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS qa_responses CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS qa_sessions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS prompt_versions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS document_embeddings CASCADE;`);

    // Create document_embeddings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_type TEXT NOT NULL,
        source_id TEXT,
        content TEXT NOT NULL,
        embedding FLOAT8[],
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create prompt_versions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS prompt_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        template TEXT NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create qa_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS qa_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        jira_issue_key TEXT,
        user_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);

    // Create qa_responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS qa_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES qa_sessions(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        context TEXT,
        response TEXT NOT NULL,
        action_taken TEXT,
        prompt_version_id UUID REFERENCES prompt_versions(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create qa_feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS qa_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        response_id UUID REFERENCES qa_responses(id) ON DELETE CASCADE,
        user_id TEXT,
        rating TEXT CHECK (rating IN ('positive', 'negative')),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create qa_response_feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS qa_response_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        response_id UUID REFERENCES qa_responses(id) ON DELETE CASCADE,
        user_id TEXT,
        rating TEXT CHECK (rating IN ('positive', 'negative')),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 
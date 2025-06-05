import { AppDataSource, pool } from './src/config/database';

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  await pool.end();
}); 
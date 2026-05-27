require('dotenv').config();
const pool = require('./src/database/connection');

async function run() {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `);

    console.log('Coluna is_admin criada/verificada com sucesso!');
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
}

run();
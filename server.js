require('dotenv').config()

const app = require('./src/app');

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
const pool = require('./src/database/connection');

async function setupDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        referral_code VARCHAR(255),
        referred_by INTEGER,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabela users verificada/criada');
  } catch (error) {
    console.log('Erro ao preparar banco:', error);
  }
}

setupDatabase();
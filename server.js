require('dotenv').config()

const app = require('./src/app');

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
const pool = require('./src/database/connection');

async function createAdminColumn() {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false
    `);

    console.log('Coluna is_admin verificada/criada');
  } catch (error) {
    console.log('Erro ao criar coluna:', error);
  }
}

createAdminColumn();

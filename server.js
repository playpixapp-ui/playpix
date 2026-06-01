require('dotenv').config()

const app = require('./src/app')
const pool = require('./src/database/connection')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

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
        coins INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak_day INTEGER DEFAULT 1,
        last_claim_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS streak_day INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS last_claim_date DATE;
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        pix_key VARCHAR(255),
        amount INTEGER,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
  ALTER TABLE withdrawals
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pix_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
`)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type VARCHAR(50),
        amount INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
  CREATE TABLE IF NOT EXISTS game_cooldowns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    game_name VARCHAR(50) NOT NULL,
    cooldown_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, game_name)
  );
`)

    console.log('Banco PostgreSQL conectado')
    console.log('Tabela users verificada/criada')

  } catch (error) {

    console.log('Erro ao preparar banco:', error)

  }

}

setupDatabase()
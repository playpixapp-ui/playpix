const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, referralCode } = req.body;

const referralCodeGenerated =
  name.toUpperCase().replace(/\s/g, '') +
  Math.floor(Math.random() * 1000);

const referralCodeTyped = referralCode
  ? referralCode.toUpperCase().trim()
  : null;

const hashedPassword = await bcrypt.hash(password, 10);

let referredBy = null;

    if (referralCodeTyped) {
  const inviter = await pool.query(
    'SELECT * FROM users WHERE referral_code = $1',
    [referralCodeTyped]
  );

  if (inviter.rows.length > 0) {
    referredBy = inviter.rows[0].id;
  }
}

const result = await pool.query(
  `INSERT INTO users 
  (name, email, password, referral_code, referred_by, is_admin)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *`,
  [name, email, hashedPassword, referralCodeGenerated, referredBy, email === 'playpix.app@gmail.com']
);

if (referredBy) {
 await pool.query(
  `
  UPDATE users
  SET
    coins = coins + 100,
    xp = xp + 50
  WHERE id = $1
  `,
  [referredBy]
);
}
        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            user: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro ao cadastrar usuário'
        });
    }
});

router.post('/withdraw', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')

    const { pixKey, pixType } = req.body

    const DAILY_WITHDRAW_COINS = 6000 // R$ 1,50
    const today = new Date().toISOString().split('T')[0]

    if (!pixKey || !pixKey.trim()) {
      return res.status(400).json({ error: 'Chave PIX obrigatória' })
    }

    const userResult = await pool.query(
      `
      SELECT 
        id, 
        email, 
        coins, 
        last_claim_date,
        last_daily_withdraw_date
      FROM users 
      WHERE id = $1
      `,
      [decoded.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const user = userResult.rows[0]

    const lastClaimDate = user.last_claim_date
      ? user.last_claim_date.toISOString().split('T')[0]
      : null

    const lastWithdrawDate = user.last_daily_withdraw_date
      ? user.last_daily_withdraw_date.toISOString().split('T')[0]
      : null

    if (lastClaimDate !== today) {
      return res.status(400).json({
        error: 'Faça o login diário de hoje para liberar o saque'
      })
    }

    if (lastWithdrawDate === today) {
      return res.status(400).json({
        error: 'Você já realizou o saque diário de hoje'
      })
    }

    if (Number(user.coins || 0) < DAILY_WITHDRAW_COINS) {
      return res.status(400).json({
        error: 'Saldo insuficiente para sacar R$ 1,50'
      })
    }

    await pool.query('BEGIN')

    const withdrawResult = await pool.query(
      `
      INSERT INTO withdrawals
      (user_id, email, amount, pix_key, pix_type, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
      `,
      [
        user.id,
        user.email,
        DAILY_WITHDRAW_COINS,
        pixKey.trim(),
        pixType || 'pix',
        'pending'
      ]
    )

    await pool.query(
      `
      UPDATE users
      SET 
        coins = coins - $1,
        last_daily_withdraw_date = CURRENT_DATE
      WHERE id = $2
      `,
      [DAILY_WITHDRAW_COINS, user.id]
    )

    await pool.query('COMMIT')

    return res.json({
      message: 'Saque diário de R$ 1,50 solicitado com sucesso',
      withdraw: withdrawResult.rows[0]
    })

  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {})
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao solicitar saque'
    })
  }
})
router.get('/withdrawals', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')

    const result = await pool.query(
      `
      SELECT 
        id,
        user_id,
        email,
        amount,
        pix_key,
        pix_type,
        status,
        created_at
      FROM withdrawals
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [decoded.id]
    )

    return res.json({
      withdrawals: result.rows
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao carregar histórico de saques'
    })
  }
})
module.exports = router;
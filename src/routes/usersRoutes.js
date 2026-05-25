const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../database/connection');

const router = express.Router();

router.get('/users', (req, res) => {
    const users = [
        {
            id: 1,
            name: 'Lennon',
            coins: 1500
        }
    ];

    return res.json(users);
});

router.get('/profile', authMiddleware, (req, res) => {
    return res.json({
        message: 'Área privada autorizada',
        user: req.user
    });
});

router.get('/wallet', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT id, name, email, coins, is_admin, referral_code FROM users WHERE id = $1',
            [userId]
        );

        return res.json({
            wallet: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro ao buscar carteira'
        });
    }
});

router.post('/earn-coins', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            'UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING id, name, email, coins',
            [amount, userId]
        );

        await pool.query(
    'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
    [userId, 'earn', amount, 'Ganhou moedas']
        );

        return res.json({
            message: 'Moedas adicionadas com sucesso',
            wallet: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro ao adicionar moedas'
        });
    }
});

router.get('/transactions', authMiddleware, async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        return res.json({
            transactions: result.rows
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: 'Erro ao buscar transações'
        });

    }

});

router.post('/withdraw', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { pix_key, amount } = req.body;

        const wallet = await pool.query(
            'SELECT coins FROM users WHERE id = $1',
            [userId]
        );

        const currentCoins = wallet.rows[0].coins;

        if (currentCoins < amount) {
            return res.status(400).json({
                error: 'Saldo insuficiente'
            });
        }

        await pool.query(
            'UPDATE users SET coins = coins - $1 WHERE id = $2',
            [amount, userId]
        );

        const result = await pool.query(
            'INSERT INTO withdrawals (user_id, pix_key, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, pix_key, amount, 'pending']
        );

        return res.status(201).json({
            message: 'Saque solicitado com sucesso',
            withdrawal: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro ao solicitar saque'
        });
    }
});

router.get('/admin/withdrawals', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM withdrawals ORDER BY created_at DESC'
        );

        return res.json({
            withdrawals: result.rows
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro ao buscar saques'
        });
    }
});
router.get('/withdrawals', authMiddleware, async (req, res) => {

    try {

        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        return res.json({
            withdrawals: result.rows
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: 'Erro ao buscar histórico'
        });

    }

});

router.post('/admin/approve-withdrawal/:id', authMiddleware, async (req, res) => {

    try {

        const withdrawalId = req.params.id;

        const result = await pool.query(
            'UPDATE withdrawals SET status = $1 WHERE id = $2 RETURNING *',
            ['approved', withdrawalId]
        );

        return res.json({
            message: 'Saque aprovado com sucesso',
            withdrawal: result.rows[0]
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: 'Erro ao aprovar saque'
        });

    }

});

router.get('/ranking', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, coins FROM users ORDER BY coins DESC LIMIT 10'
        );

        return res.json({
            ranking: result.rows
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro ao buscar ranking'
        });
    }
});

router.post('/daily-login', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const alreadyCompleted = await pool.query(
      `
      SELECT * FROM missions
      WHERE user_id = $1
      AND type = 'daily_login'
      AND completed_at::date = CURRENT_DATE
      `,
      [userId]
    );

    if (alreadyCompleted.rows.length > 0) {
      return res.status(400).json({
        error: 'Missão diária já resgatada hoje'
      });
    }

    await pool.query(
      `
      INSERT INTO missions (user_id, type, reward)
      VALUES ($1, 'daily_login', 10)
      `,
      [userId]
    );

    await pool.query(
      `
      UPDATE users
      SET coins = coins + 10
      WHERE id = $1
      `,
      [userId]
    );

    return res.json({
      message: 'Missão diária concluída',
      reward: 10
    });

  } catch (error) {
    console.log('ERRO DAILY LOGIN:', error);

    return res.status(500).json({
      error: 'Erro na missão diária'
    });
  }
});
router.get('/referrals', authMiddleware, async (req, res) => {

  try {

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE referred_by = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      referrals: result.rows
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      error: 'Erro ao buscar convidados'
    });

  }

});

router.get('/referrals', authMiddleware, async (req, res) => {

  try {

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE referred_by = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      referrals: result.rows
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      error: 'Erro ao buscar convidados'
    });

  }

});

module.exports = router;
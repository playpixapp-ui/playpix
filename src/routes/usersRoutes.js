const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../database/connection');
const jwt = require('jsonwebtoken');

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



router.get('/wallet', async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'Token não enviado'
      })
    }

    const decoded = jwt.verify(token, 'playpix_secret')

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    )

    return res.json({
      wallet: result.rows[0]
    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({
      error: 'Erro ao carregar wallet'
    })
  }
})

router.post('/earn', async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1]

    const decoded = jwt.verify(token, 'playpix_secret')

    const { amount } = req.body

    await pool.query(
      `
      UPDATE users
      SET coins = coins + $1
      WHERE id = $2
      `,
      [amount, decoded.id]
    )

    return res.json({
      success: true
    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({
      error: 'Erro ao ganhar coins'
    })
  }
})

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

router.get('/ranking', async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT name, coins
      FROM users
      ORDER BY coins DESC
      LIMIT 20
    `)

    return res.json({
      ranking: result.rows
    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({
      error: 'Erro ao carregar ranking'
    })
  }
})

router.post('/daily-login', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const userResult = await pool.query(
      'SELECT streak_day, last_claim_date FROM users WHERE id = $1',
      [userId]
    )

    const user = userResult.rows[0]
    const today = new Date().toISOString().split('T')[0]

    if (user.last_claim_date && user.last_claim_date.toISOString().split('T')[0] === today) {
      return res.status(400).json({
        error: 'Recompensa diária já coletada hoje'
      })
    }

    let streakDay = user.streak_day || 1

    const rewards = {
      1: 100,
      2: 250,
      3: 500,
      4: 800,
      5: 1200,
      6: 2000,
      7: 5000
    }

    const reward = rewards[streakDay]

    const nextStreakDay = streakDay >= 7 ? 1 : streakDay + 1

    const result = await pool.query(
      `
      UPDATE users
      SET coins = coins + $1,
          streak_day = $2,
          last_claim_date = CURRENT_DATE
      WHERE id = $3
      RETURNING id, name, email, coins, xp, level, is_admin, referral_code, streak_day, last_claim_date
      `,
      [reward, nextStreakDay, userId]
    )

    return res.json({
      message: 'Recompensa diária coletada com sucesso',
      reward,
      streak_day: streakDay,
      wallet: result.rows[0]
    })

  } catch (error) {
    console.log('ERRO DAILY LOGIN:', error)

    return res.status(500).json({
      error: 'Erro na recompensa diária'
    })
  }
})

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



router.get('/make-admin', async (req, res) => {
  await pool.query(
    `UPDATE users SET is_admin = true WHERE email = 'lennonreal@email.com.com'`
  )

  res.json({
    message: 'Admin liberado'
  })
})

module.exports = router;
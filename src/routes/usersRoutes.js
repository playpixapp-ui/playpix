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

console.log('WALLET:', result.rows[0])
console.log('WATCH:', result.rows[0].watch_ad_cooldown)
console.log('OFFER:', result.rows[0].offer_cooldown)
console.log('MISSION:', result.rows[0].mission_cooldown)

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

    const amount = Number(req.body.amount || 0)
    const xpReward = Number(req.body.xpReward || 15)
    const type = req.body.type || ''

    const userResult = await pool.query(
      'SELECT coins, xp, level FROM users WHERE id = $1',
      [decoded.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const user = userResult.rows[0]
        let newXP = Number(user.xp || 0) + Number(xpReward)
        let newLevel = Number(user.level || 1)

        while (newXP >= 100) {
          newXP -= 100
          newLevel += 1
        }

    const updated = await pool.query(
  `
  UPDATE users
  SET 
    coins = coins + $1,
    xp = $2,
    level = $3,
    ads_watched = ads_watched + $4,
    games_played = games_played + $5,
    daily_collected = CASE
  WHEN $6 = 1 THEN 1
  ELSE daily_collected
END
  WHERE id = $7
  RETURNING *
  `,
  [
    amount,
    newXP,
    newLevel,
    type === 'watch_ads' ? 1 : 0,
    type === 'play_games' ? 1 : 0,
    type === 'daily_collect' ? 1 : 0,
    decoded.id
  ]
)

    return res.json({
      success: true,
      wallet: updated.rows[0]
    })

  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao ganhar coins'
    })
  }
})

router.post('/cooldown', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')

    const { type, cooldownEnd } = req.body

    const allowed = {
      watch_ad: 'watch_ad_cooldown',
      offer: 'offer_cooldown',
      mission: 'mission_cooldown'
    }

    const column = allowed[type]

    console.log('TIPO:', type)
    console.log('COOLDOWN:', cooldownEnd)
    console.log('COLUNA:', column)

    if (!column) {
      return res.status(400).json({ error: 'Tipo de cooldown inválido' })
    }

    const updated = await pool.query(
      `
      UPDATE users
      SET ${column} = $1
      WHERE id = $2
      RETURNING *
      `,
      [Number(cooldownEnd), decoded.id]
    )

    return res.json({
      success: true,
      wallet: updated.rows[0]
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao salvar cooldown'
    })
  }
})

router.post('/recover-xp', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')

    const userResult = await pool.query(
      `
      SELECT id, xp, level
      FROM users
      WHERE id = $1
      `,
      [decoded.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const user = userResult.rows[0]

    if (Number(user.xp || 0) < 100) {
      return res.status(400).json({
        error: 'XP insuficiente para subir de level'
      })
    }

    const newLevel = Number(user.level || 1) + 1

    const updated = await pool.query(
      `
      UPDATE users
      SET xp = 0,
          level = $1,
          coins = coins + 45
      WHERE id = $2
      RETURNING id, name, email, coins, xp, level, referral_code, is_admin
      `,
      [newLevel, decoded.id]
    )

    return res.json({
      success: true,
      wallet: updated.rows[0]
    })

  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao recuperar XP'
    })
  }
})

router.post('/missions/claim', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')

    const { type } = req.body

    const missions = {
            watch_ads: { coins: 200, xp: 20 },
            play_games: { coins: 150, xp: 15 },
            daily_reward: { coins: 100, xp: 10 },
            invite_friend: { coins: 1000, xp: 50 }
          }

          const mission = missions[type]

              const userResult = await pool.query(
            `
            SELECT coins, xp, level
            FROM users
            WHERE id = $1
            `,
            [decoded.id]
          )

          const user = userResult.rows[0]

          let newXP = Number(user.xp || 0) + mission.xp
          let newLevel = Number(user.level || 1)

          while (newXP >= 100) {
            newXP -= 100
            newLevel += 1
          }

          await pool.query(
            `
            UPDATE users
            SET coins = coins + $1,
                xp = $2,
                level = $3
            WHERE id = $4
            `,
            [mission.coins, newXP, newLevel, decoded.id]
          )

              return res.json({
            success: true,
            reward: mission.coins,
            xp: mission.xp,
            wallet: {
            coins: Number(user.coins || 0) + mission.coins,
            xp: newXP,
            level: newLevel
          }
          })
          
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Erro ao receber missão' })
  }

          const missions = {
          watch_ads: { coins: 200, xp: 20 },
          play_games: { coins: 150, xp: 15 },
          daily_reward: { coins: 100, xp: 10 },
          invite_friend: { coins: 1000, xp: 50 }
        }

      if (!mission) {
  return res.status(400).json({ error: 'Missão inválida' })
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

router.get('/game-cooldown/:gameName', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')
    const { gameName } = req.params

    const result = await pool.query(
      `
      SELECT cooldown_until
      FROM game_cooldowns
      WHERE user_id = $1 AND game_name = $2
      `,
      [decoded.id, gameName]
    )

    if (result.rows.length === 0) {
      return res.json({
        locked: false,
        cooldownUntil: null
      })
    }

    const cooldownUntil = new Date(result.rows[0].cooldown_until)
    const now = new Date()

    return res.json({
      locked: cooldownUntil > now,
      cooldownUntil
    })

  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao verificar cooldown'
    })
  }
})

router.post('/game-cooldown', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não enviado' })
    }

    const decoded = jwt.verify(token, 'playpix_secret')
    const { gameName, minutes } = req.body

    if (!gameName || !minutes) {
      return res.status(400).json({
        error: 'gameName e minutes são obrigatórios'
      })
    }

    const cooldownUntil = new Date(Date.now() + Number(minutes) * 60 * 1000)

    const result = await pool.query(
      `
      INSERT INTO game_cooldowns (user_id, game_name, cooldown_until, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, game_name)
      DO UPDATE SET
        cooldown_until = EXCLUDED.cooldown_until,
        updated_at = NOW()
      RETURNING cooldown_until
      `,
      [decoded.id, gameName, cooldownUntil]
    )

    return res.json({
      success: true,
      gameName,
      cooldownUntil: result.rows[0].cooldown_until
    })

  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro ao salvar cooldown'
    })
  }
})

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

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      })
    }

    const user = userResult.rows[0]
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    if (
      user.last_claim_date &&
      user.last_claim_date.toISOString().split('T')[0] === todayString
    ) {
      return res.status(400).json({
        error: 'Recompensa diária já coletada hoje'
      })
    }

    let currentStreak = user.streak_day || 0

    if (user.last_claim_date) {
      const lastClaimDate = new Date(user.last_claim_date)
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      const lastClaimString = lastClaimDate.toISOString().split('T')[0]
      const yesterdayString = yesterday.toISOString().split('T')[0]

      if (lastClaimString === yesterdayString) {
        currentStreak += 1
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }

    const rewards = {
                  1: 25,
                  2: 50,
                  3: 75,
                  4: 125,
                  5: 200,
                  6: 250,
                  7: 500
                }

    const reward = rewards[currentStreak] || 500

    const xpReward = 15

const levelResult = await pool.query(
  `
  SELECT xp, level
  FROM users
  WHERE id = $1
  `,
  [userId]
)

let newXP = Number(levelResult.rows[0].xp || 0) + xpReward
let newLevel = Number(levelResult.rows[0].level || 1)

while (newXP >= 100) {
  newXP -= 100
  newLevel += 1
}

    const result = await pool.query(
          `
          UPDATE users
          SET coins = coins + $1,
              xp = $2,
              level = $3,
              streak_day = $4,
              last_claim_date = CURRENT_DATE
          WHERE id = $5
          RETURNING id, name, email, coins, xp, level, is_admin, referral_code, streak_day, last_claim_date
          `,
          [
            reward,
            newXP,
            newLevel,
            currentStreak,
            userId
          ]
)

    return res.json({
      message: 'Recompensa diária coletada com sucesso',
      reward,
      xp: 15,
      streak_day: currentStreak,
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
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

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);

if (result.rows.length === 0) {
    return res.status(404).json({
        error: 'Usuário não encontrado'
    });
}

const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Senha inválida'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
             email: user.email
            },
            'playpix_secret',
            {
                expiresIn: '1d'
            }
        );

        return res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
              name: user.name,
             email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            error: 'Erro no login'
        });
    }
});

module.exports = router;
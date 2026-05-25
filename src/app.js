const express = require('express');
const cors = require('cors');

const pool = require('./database/connection');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

pool.connect()
    .then(() => {
        console.log('Banco PostgreSQL conectado');
    })
    .catch((err) => {
        console.log(err);
    });

app.use(cors());
app.use(express.json());

app.use(usersRoutes);
app.use(authRoutes);

app.get('/', (req, res) => {
    res.json({
        app: 'PlayPIX',
        status: 'online'
    });
});

module.exports = app;
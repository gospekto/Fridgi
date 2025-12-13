require('dotenv').config();
const express = require('express');
const config = require('./config');
const apiRouter = require('./routes/api');
const cors = require('cors');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:8081', 'http://ping-serwis.pl'], 
  credentials: true,
}));

app.use('/', apiRouter);

app.listen(config.port, '127.0.0.1', async () => {
    console.log('serwer słucha...' + config.port);

    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true }).then(() => {
        console.log('Tabele zaktualizowane zgodnie z modelami');
      });
      console.log('Połączono z MySQL');
    } catch (error) {
      console.error(error);
    }
});
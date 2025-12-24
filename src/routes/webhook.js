const express = require('express');
const bot = require('../bot/bot');

const router = express.Router();

router.post('/', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

module.exports = router;
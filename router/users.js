const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../utils/db');

router.post('/', (req, res) => {
  const { username, name, email, role } = req.body;
  if (!username || !name || !email || !role) return res.status(400).json({ error: 'username, name, email, role diperlukan' });
  if (!['buyer','seller'].includes(role)) return res.status(400).json({ error: 'role harus buyer atau seller' });

  const users = readJson('users.json');
  if (users.some(u => u.username === username)) return res.status(409).json({ error: 'username sudah ada' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'email sudah ada' });

  const user = { username, name, email, role };
  users.push(user);
  writeJson('users.json', users);
  res.status(201).json(user);
});

router.get('/', (req, res) => {
  res.json(readJson('users.json'));
});

router.get('/:username', (req, res) => {
  const users = readJson('users.json');
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: 'user tidak ditemukan' });
  res.json(user);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../utils/db');

function requester(req) { return req.header('x-username'); }

// Lihat keranjang
router.get('/:username', (req, res) => {
  const userParam = req.params.username;
  const reqUser = requester(req);
  if (!reqUser) return res.status(401).json({ error: 'x-username header diperlukan' });
  if (reqUser !== userParam) return res.status(403).json({ error: 'hanya bisa melihat keranjang sendiri' });

  const users = readJson('users.json');
  const user = users.find(u => u.username === userParam);
  if (!user) return res.status(404).json({ error: 'user tidak ditemukan' });
  if (user.role !== 'buyer') return res.status(403).json({ error: 'hanya buyer yang memiliki keranjang' });

  const carts = readJson('carts.json');
  let cart = carts.find(c => c.username === userParam);
  if (!cart) {
    cart = { username: userParam, items: [] };
    carts.push(cart);
    writeJson('carts.json', carts);
  }
  res.json(cart);
});

// Tambah produk ke keranjang
router.post('/:username/add', (req, res) => {
  const userParam = req.params.username;
  const reqUser = requester(req);
  if (!reqUser) return res.status(401).json({ error: 'x-username header diperlukan' });
  if (reqUser !== userParam) return res.status(403).json({ error: 'hanya bisa mengubah keranjang sendiri' });

  const users = readJson('users.json');
  const user = users.find(u => u.username === userParam);
  if (!user) return res.status(404).json({ error: 'user tidak ditemukan' });
  if (user.role !== 'buyer') return res.status(403).json({ error: 'hanya buyer yang memiliki keranjang' });

  const { product_name, quantity } = req.body;
  if (!product_name || quantity === undefined) return res.status(400).json({ error: 'product_name dan quantity diperlukan' });

  const products = readJson('products.json');
  const product = products.find(p => p.product_name === product_name);
  if (!product) return res.status(404).json({ error: 'produk tidak ditemukan' });

  const carts = readJson('carts.json');
  let cart = carts.find(c => c.username === userParam);
  if (!cart) { cart = { username: userParam, items: [] }; carts.push(cart); }

  const item = cart.items.find(i => i.product_name === product_name);
  if (item) item.quantity += Number(quantity);
  else cart.items.push({ product_name, quantity: Number(quantity) });

  writeJson('carts.json', carts);
  res.json(cart);
});

// Hapus produk dari keranjang
router.post('/:username/remove', (req, res) => {
  const userParam = req.params.username;
  const reqUser = requester(req);
  if (!reqUser) return res.status(401).json({ error: 'x-username header diperlukan' });
  if (reqUser !== userParam) return res.status(403).json({ error: 'hanya bisa mengubah keranjang sendiri' });

  const users = readJson('users.json');
  const user = users.find(u => u.username === userParam);
  if (!user) return res.status(404).json({ error: 'user tidak ditemukan' });
  if (user.role !== 'buyer') return res.status(403).json({ error: 'hanya buyer yang memiliki keranjang' });

  const { product_name } = req.body;
  if (!product_name) return res.status(400).json({ error: 'product_name diperlukan' });

  const carts = readJson('carts.json');
  const cart = carts.find(c => c.username === userParam);
  if (!cart) return res.status(404).json({ error: 'keranjang tidak ditemukan' });

  const idx = cart.items.findIndex(i => i.product_name === product_name);
  if (idx === -1) return res.status(404).json({ error: 'produk tidak ada di keranjang' });
  cart.items.splice(idx, 1);

  writeJson('carts.json', carts);
  res.json(cart);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { readJson, writeJson } = require('../utils/db');

function requester(req) { return req.header('x-username'); }

// Create product (seller only)
router.post('/', (req, res) => {
  const reqUser = requester(req);
  if (!reqUser) return res.status(401).json({ error: 'x-username header diperlukan' });

  const users = readJson('users.json');
  const user = users.find(u => u.username === reqUser);
  if (!user) return res.status(401).json({ error: 'requester tidak ditemukan' });
  if (user.role !== 'seller') return res.status(403).json({ error: 'hanya seller yang boleh tambah produk' });

  const { product_name, product_category, price } = req.body;
  if (!product_name || !product_category || price === undefined) return res.status(400).json({ error: 'product_name, product_category, price diperlukan' });

  const products = readJson('products.json');
  if (products.some(p => p.product_name === product_name)) return res.status(409).json({ error: 'product_name sudah ada' });

  const product = { product_name, product_category, price: Number(price), owner: reqUser };
  products.push(product);
  writeJson('products.json', products);
  res.status(201).json(product);
});

// List products
router.get('/', (req, res) => {
  res.json(readJson('products.json'));
});

// Detail product
router.get('/:product_name', (req, res) => {
  const products = readJson('products.json');
  const p = products.find(x => x.product_name === req.params.product_name);
  if (!p) return res.status(404).json({ error: 'produk tidak ditemukan' });
  res.json(p);
});

// Update product (owner seller only)
router.put('/:product_name', (req, res) => {
  const reqUser = requester(req);
  if (!reqUser) return res.status(401).json({ error: 'x-username header diperlukan' });

  const users = readJson('users.json');
  const user = users.find(u => u.username === reqUser);
  if (!user) return res.status(401).json({ error: 'requester tidak ditemukan' });
  if (user.role !== 'seller') return res.status(403).json({ error: 'hanya seller yang boleh update produk' });

  const products = readJson('products.json');
  const idx = products.findIndex(p => p.product_name === req.params.product_name);
  if (idx === -1) return res.status(404).json({ error: 'produk tidak ditemukan' });
  const prod = products[idx];
  if (prod.owner !== reqUser) return res.status(403).json({ error: 'hanya owner produk yang boleh mengubah' });

  const { product_category, price } = req.body;
  if (product_category !== undefined) prod.product_category = product_category;
  if (price !== undefined) prod.price = Number(price);
  products[idx] = prod;
  writeJson('products.json', products);
  res.json(prod);
});

// Delete product (owner seller only)
router.delete('/:product_name', (req, res) => {
  const reqUser = requester(req);
  if (!reqUser) return res.status(401).json({ error: 'x-username header diperlukan' });

  const users = readJson('users.json');
  const user = users.find(u => u.username === reqUser);
  if (!user) return res.status(401).json({ error: 'requester tidak ditemukan' });
  if (user.role !== 'seller') return res.status(403).json({ error: 'hanya seller yang boleh hapus produk' });

  let products = readJson('products.json');
  const idx = products.findIndex(p => p.product_name === req.params.product_name);
  if (idx === -1) return res.status(404).json({ error: 'produk tidak ditemukan' });
  if (products[idx].owner !== reqUser) return res.status(403).json({ error: 'hanya owner produk yang boleh menghapus' });

  products.splice(idx, 1);
  writeJson('products.json', products);
  res.json({ message: 'produk dihapus' });
});

module.exports = router;
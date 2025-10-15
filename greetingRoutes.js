const express = require('express');
const router = express.Router();

// Implementasi get greeting menggunakan query parameter
// Format: /greeting?name=Teo
router.get('/', (req, res) => {
  const { name } = req.query; // Ambil nilai parameter query "name"
  
  // Jika parameter "name" ada
  if (name) {
    res.send(`Hello, ${name}!`);
  } else {
    res.send('Hello, stranger!'); // Pesan default jika nama tidak ada
  }
});

module.exports = router;
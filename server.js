const express = require('express');
const app = express();
const port = 3000;

// Impor semua rute di bagian atas sekali saja
const aboutUsRoutes = require('./routes/aboutUsRoutes');
const greetingRoutes = require('./routes/greetingRoutes');

app.use(express.json());

// Terapkan rute-rute ke endpoint masing-masing
app.use('/aboutus', aboutUsRoutes);
app.use('/greeting', greetingRoutes);

// Rute dasar untuk halaman utama
app.get('/', (req, res) => {
    res.send('Welcome to the Home Page');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
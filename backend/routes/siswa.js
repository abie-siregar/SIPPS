const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM siswa');
    res.json(result.rows);
});

router.post('/', async (req, res) => {
    const { nama, kelas, nis } = req.body;
    await db.query('INSERT INTO siswa (nama, kelas, nis) VALUES ($1, $2, $3)', [
        nama,
        kelas,
        nis,
    ]);
    res.json({ message: 'Siswa ditambahkan' });
});

module.exports = router;

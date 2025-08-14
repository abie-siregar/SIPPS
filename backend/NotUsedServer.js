// require('dotenv').config(); //Memuat Variabel dari .env

// const express = require('express');
// const { Pool, Client } = require('pg');
// const cors  = require('cors');

// const app = express();
// const port = process.env.PORT || 5000; //port Backend

// //konfigurasu CORS Eksplisit
// const corsOptions = {
//   origin: 'http://localhost:3000', // Hanya izinkan dari origin ini
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Metode HTTP yang diizinkan
//   credentials: true, // Izinkan pengiriman cookies atau authorization headers
//   optionsSuccessStatus: 204 // Untuk preflight requests
// };

// //middleware
// app.use(cors(corsOptions));
// app.use(express.json()); //parsing JSON dari Body Request

// const pool = new Pool ({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_DATABASE,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });

// //cek Koneksi ke Database
// pool.connect((err, Client, release) => {
//     if (err) {
//         return console.error('Error Acquiring Client', err.stack);
//     }
//     console.log('Terhubung ke Database');
//     release(); //melepaskan client ke Pool

// //GET tabel siswa
// app.get('/siswa', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM siswa ORDER BY id ASC');
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching siswa:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// //GET tabel guru
// app.get('/guru', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM guru ORDER BY id ASC');
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching guru:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// //GET tabel tingkat
// app.get('/tingkat', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM tingkat ORDER BY id DESC');
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching tingkat:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// //POST Values Tabel siswa
// app.post('/siswa', async (req, res) => {
//     // Mendapatkan data dari body request, termasuk kolom-kolom baru
//     const { nisn, nama_depan, nama_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, alamat } = req.body;

//     // Validasi dasar
//     if (!nisn || !nama_depan || !jenis_kelamin || !tempat_lahir || !tgl_lahir || !alamat) {
//         return res.status(400).json({ error: 'NISN, Nama Depan, Jenis Kelamin, Tempat Lahir, Tanggal Lahir, dan Alamat harus diisi.' });
//     }

//     try {
//         // Query INSERT disesuaikan untuk kolom-kolom baru
//         const result = await pool.query(
//             'INSERT INTO siswa (nisn, nama_depan, nama_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, alamat) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
//             [nisn, nama_depan, nama_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, alamat]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error('Error adding siswa:', err);
//         if (err.code === '23505') {
//             return res.status(409).json({ error: 'NISN sudah terdaftar.' });
//         }
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// });

//     //Start Server

//     app.listen(port, () => {
//         console.log('Server is Running on port ${port}');
//     });

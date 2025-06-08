require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('API SIPPS Running...');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const siswaRoutes = require('./routes/siswa');
app.use('/api/siswa', siswaRoutes);

const { count } = require("console");
const pool = require("../../config/database");
const fs = require("fs");
const path = require("path");

module.exports = {

    async importJsonFile(req, res) {
        try {
            const filePath = path.join(__dirname, "../data/getPesertaDidik.json");
            const rawData = fs.readFileSync(filePath, "utf-8");
            const dapodikData = JSON.parse(rawData);

            const result = [];

            for (const siswa of dapodikData) {
            const nipd = siswa.nipd;
            const nisn = siswa.nisn;
            const nik = siswa.nik;
            const agama_id = siswa.agama_id ? parseInt(siswa.agama_id) : 1; // default 1
            const nama = siswa.nama;
            const tempat_lahir = siswa.tempat_lahir;
            const tanggal_lahir = siswa.tanggal_lahir;
            const email = siswa.email;
        const query = `
          INSERT INTO siswa (
            nipd, nisn, nik, agama_id, nama, tempat_lahir,
            tanggal_lahir, email
            ) 
            VALUES ($1,$2,$3,$4,$5,$6,$7, $8)
          RETURNING *;
        `;

        const result = await pool.query(query, [
          nipd, nisn, nik, agama_id, nama, tempat_lahir,
          tanggal_lahir,
          email
        ]);

        results.push(result.rows[0]);
      }

            res.status(200).json({
                message: " Data Berhasil di Import", count: result.length, data:result, 
            });
        } catch (error) {
            console.error("Gagal Import Data", error.message);
            res.status(500).json({error: "Gagal Import Data Dapodik"})
        }
    },
}
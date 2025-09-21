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
                
                const siswa_id_dapodik = siswa.peserta_didik_id
                const nipd = siswa.nipd
                const nisn = siswa.nisn
                const nik = siswa.nik
                const nama = siswa.nama
                const tempat_lahir = siswa.tempat_lahir
                const tanggal_lahir = siswa.tanggal_lahir
                const agama_id = siswa.agama_id
                const nomor_telepon_rumah = siswa.nomor_telepon_rumah
                const nomor_telepon_seluler = siswa.nomor_telepon_seluler
                const nama_ayah = siswa.nama_ayah
                const nama_ibu = siswa.nama_ibu
                const nama_wali = siswa.nama_wali
                const email = siswa.email
                const semester_id = siswa.semester_id
                const rombel_id_dapodik = siswa.rombongan_belajar_id


                const insertQuery = `
                INSERT INTO siswa (siswa_id_dapodik, nipd, nisn, nik, nama, tempat_lahir, tanggal_lahir, agama_id, nomor_telepon_rumah, nomor_telepon_seluler, nama_ayah, nama_ibu, nama_wali, email, semester_id, rombel_id_dapodik)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
                RETURNING *;
                `;

                const result = await pool.query(insertQuery,[
                    siswa_id_dapodik, nipd, nisn, nik, nama, tempat_lahir, tanggal_lahir, agama_id, nomor_telepon_rumah, nomor_telepon_seluler, nama_ayah, nama_ibu, nama_wali, email, semester_id, rombel_id_dapodik
                ]);

                result.push(result.rows[0]);
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
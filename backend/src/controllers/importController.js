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
    
                const results = [];
    
                for (const siswa of dapodikData) {
                  
                  const siswa_id_dapodik = siswa.peserta_didik_id;
                  const nipd = siswa.nipd;
                  const nisn = siswa.nisn;
                  const nik = siswa.nik;
                  const agama_id = siswa.agama_id.toString();
                  const nama = siswa.nama;
                  const tempat_lahir = siswa.tempat_lahir;
                  const tanggal_lahir = siswa.tanggal_lahir;
                  const email = siswa.email;
                  const semester_id = siswa.semester_id;
                  // const rombel_id_dapodik = siswa.rombongan_belajar_id;
    
            const query = `
              INSERT INTO siswa (
                siswa_id_dapodik, nipd, nisn, nik, agama_id, nama, tempat_lahir,
                tanggal_lahir, email, semester_id
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING *;
            `;
    
            const result = await pool.query(query, [
              siswa_id_dapodik, nipd, nisn, nik, agama_id, nama, tempat_lahir,
              tanggal_lahir,
              email, semester_id
            ]);
    
            results.push(result.rows[0]);
          }
    
                res.status(200).json({
                    message: " Data Berhasil di Import", count: results.length, data:results, 
                });
            } catch (error) {
                console.error("Gagal Import Data", error.message);
                res.status(500).json({error: "Gagal Import Data Dapodik"})
            }
        },
}
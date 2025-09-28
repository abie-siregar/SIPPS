const pool = require("../../config/database");

module.exports = {

    //menambahkan pelanggaran baru
    async create(req, res) {

        const { tanggal, keterangan,jenis_penilaian, bobot, jenis_pelanggaran,  } = req.body;

        // Validasi input
        if (!tanggal || keterangan ||!jenis_penilaian || typeof bobot !== "number" || !jenis_pelanggaran) {
        return res.status(400).json({
            error:
            "tanggal, keterangan, Jenis penilaian, bobot (angka), dan jenis pelanggaran harus diisi dengan benar.",
        });
        }

        try {
        const result = await pool.query(
            `INSERT INTO 
                pelanggaran_siswa (tanngal, keterangan, jenis_penilaian, bobot, jenis_pelanggaran)
            VALUES 
                ($1, $2, $3, $4, $5)
            RETURNING *`,
            [tanggal, keterangan, jenis_penilaian, bobot, jenis_pelanggaran]
        );

        res.status(201).json({
            message: "Data pelanggaran siswa berhasil ditambahkan",
            data: result.rows[0],
        });
        } catch (error) {
        console.error("Gagal menambahkan data pelanggaran siswa :", error.message);
        res.status(500).json({ error: "Internal Server Error" });
        }
    },

    //mengambil seluruh data pelanggaran_siswa
    async getAll(req, res) {
    try {
      const result = await pool.query(
        `
        SELECT 
            pelsis.*,
            popel.jenis_penilaian, popel.jenis_pelanggaran, popel.bobot, 
            ptk.nama
        FROM
            pelanggaran_siswa pelsis
        LEFT JOIN
            poin_pelanggaran popel ON popel.poin_id = pelsis.poin_id
        LEFT JOIN
            ptk ptk ON ptk.ptk_id_dapodik = pelsis.ptk_id_dapodik
        ORDER BY
            pelsis.pelanggaran_id
        ASC
        `
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
    },

    //mengambil seluruh data pelanggaran_siswa BY ID
    async getById(req, res) {

        const { id } = req.params;

        if (isNaN(id)) {
        return res.status(400).json({ error: "ID harus berupa angka" });
        }

        try {
        const result = await pool.query(
            `
            SELECT 
                pelsis.*,
                popel.jenis_penilaian, popel.jenis_pelanggaran, popel_bobot, 
                ptk.nama,
            FROM
                pelanggaran_siswa pelsis
            LEFT JOIN
                poin_pelanggaran popel ON popel.poin_id = pelsis.poin_id
            LEFT JOIN
                ptk ptk ON ptk.ptk_id_dapodik = pelsis.ptk_id_dapodik
            WHERE 
                pelsis.pelanggaran_id = $1
            ASC
        `
        [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Data pelanggaran tidak ditemukan" });
        }

        res.json(result.rows[0]);
        } catch (error) {
        console.error("Error fetching pelanggaran siswa by ID:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Memperbaharui data pelanggaran_siswa
    async update(req, res) {
        const { id } = req.params;
        const { tanggal, keterangan,jenis_penilaian, bobot, jenis_pelanggaran, status } = req.body;

        if (isNaN(id)) {
        return res.status(400).json({ error: "ID harus berupa angka" });
        }

        if (
        typeof tanggal  !== "date"||
        !keterangan ||
        !jenis_penilaian ||
        typeof bobot !== "number" ||
        !jenis_pelanggaran ||
        !status
        ) {
        
        return res.status(400).json({
            error:
            "Data pelanggaran harus di isi dengan benar!",
        });
        }

        try {
        const result = await pool.query(
            `UPDATE 
                pelanggaran_siswa
            SET 
                tanggal = $1, keterangan = $2, jenis_penilaian = $3, bobot = $4, jenis_pelanggaran = $5, status = $6
            WHERE 
                pelanggaran_id = $7
            RETURNING *`,
            
            [tanggal, keterangan, jenis_penilaian, bobot, jenis_pelanggaran, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Data tidak ditemukan" });
        }

        res.json({
            message: "Data berhasil diupdate",
            data: result.rows[0],
        });
        } catch (error) {
        console.error("Error updating data pelanggaran:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
        }
    },

    //menghapus data pelanggaran_siswa
    async delete(req, res){
        try {
            const {id} = req.params;
            const result = await pool.query(
            `DELETE FROM 
                pelanggaran_siswa 
            WHERE 
                pelanggaran_id = $1`,
            [id]);

        if ( result.rowCount === 0 ){
            return res.status(404).json({message: "Data pelanggaran tidak ditemukan"})
        }
        res.json({
            message: "Data Pelanggaran Berhasil dihapus"
        })
        } catch (error) {
        res.status(500).json({error: error.message});
        }
    }
};
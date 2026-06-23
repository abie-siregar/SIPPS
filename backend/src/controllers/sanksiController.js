const pool = require("../../config/database");

module.exports = {

    async getAll (req, res) {

        try {
            const result = await pool.query (
                `SELECT
                    * 
                 FROM
                 master_sanksi
                 ORDER BY 
                 id_master_sanksi
                 ASC
                `
            );

            res.json(result.rows);
        }
        catch (error) {
            console.error("error Fetching Data", error.message);
            res.status(500).json({error: "Internal Server Error " + error.message})
        }
    },

    async create(req, res) {
        const {nama_sanksi, batas_poin} = req.body;

        if (!nama_sanksi || !batas_poin)
            return res.status(400).json({
        error: "sanksi dan poin harus di isi"});
                
        try{
            const result = await pool.query(
                `INSERT INTO
                master_sanksi (nama_sanksi, batas_poin)
                VALUES ($1, $2)
                returning
                master_sanksi, batas_poin`,
                [nama_sanksi, batas_poin]
            );
            res.status(201).json({
                message: "Data berhasil di tambahkan",
                data: result.rows[0]
            });
        }
        catch (error) {
            console.error(" Gagal Menambahkan data : ", error.message);
            res.status(500).json({error: "Internal Server Error : " + error.message});
        }
    },

    async update(req, res) {
        const {id} = req.params;
        const {nama_sanksi, batas_poin} = req.body;
        try {
            const result = await pool.query(
                `UPDATE
                master_sanksi
                SET
                nama_sanksi = $1, batas_poin = $2
                WHERE
                id_master_sanksi = $3
                RETURNING *`,
                [nama_sanksi, batas_poin, id]
            );
            res.json ({
                message: "Data berhasil di perbaharui",
                data: result.rows[0],
            });
        }
        catch (error){
            console.error ("error updating data: " + error.message);
            res.status(500).json({error: "Internal Server Error " + error.message});
        }
    },

    async delete(req, res) {
        try {
            const {id} = req.params;
            const result = await pool.query(
                `DELETE
                FROM
                master_sanksi
                WHERE 
                id_master_sanksi = $1`,
                [id]
            );
        
            if ( result.rowCount === 0 ){
            return res.status(404).json({message: "Data tidak ditemukan"})
        }
        res.json({
            message: "Data Berhasil dihapus"
        })
        }
        catch (error) {
            res.status(500).json({error : error.message});
        }

    }

};
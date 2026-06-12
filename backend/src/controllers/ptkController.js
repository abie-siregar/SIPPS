const pool = require("../../config/database");

module.exports = {
  //mengambil seluruh data ptk
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT 
          p.id_ptk, p.nama, p.nuptk, p.email,
          jb.nama_jabatan AS jabatan
        FROM 
          ptk p
        LEFT JOIN
          jabatan_ptk jb ON jb.id_jabatan = p.id_jabatan
        ORDER BY 
          p.nama
        ASC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching ptk:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //mengambil seluruh data ptk menggunakan filter
  async getFiltered(req, res) {
    try {
      const {jabatan , nuptk, email, search} = req.query;

      let query = `
        SELECT 
          p.id_ptk, p.nama, p.nuptk, p.email,
          jb.nama_jabatan AS jabatan
        FROM 
          ptk p
        LEFT JOIN
          jabatan_ptk jb ON jb.id_jabatan = p.id_jabatan
        WHERE
          1=1
        `;
      let params = [];
      let index = 1;

      if (jabatan) {
        query += ` AND jb.nama_jabatan ILIKE $${index}`;
        params.push(`%${jabatan}%`);
        index++;
      }

      if (nuptk) {
        query += ` AND p.nuptk = $${index}`;
        params.push(nuptk);
        index++;
      }

      if (email) {
        query += ` AND p.email = $${index}`;
        params.push(email);
        index++;
      }

      if (search) {
        query += ` AND p.nama ILIKE $${index}`;
        params.push(`%${search}%`);
        index++;
      }

      query += " ORDER BY p.nama ASC";

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data PTK tidak ditemukan" });
      }

      res.json({
        success: true,
        total: result.rows.length,
        data: result.rows
      });
    } 
    catch (error) {
      console.error("Gagal mengambil data PTK", error);
      res.status(500).json({error : "Internal Server Error " + error.message });
    }
  },

//mengambil data ptk menggunakan id
  async getById(req, res) {
    const { id } = req.params;

    // if (isNaN(id)) {
    //   return res.status(400).json({ error: "ID harus berupa angka" });
    // }

    try {
      const result = await pool.query(
        `
        SELECT 
          p.id_ptk, p.nama, p.nuptk, p.email,
          jb.nama_jabatan AS jabatan
        FROM 
          ptk p
        LEFT JOIN
          jabatan_ptk jb ON jb.id_jabatan = p.id_jabatan
        WHERE
          p.id_ptk = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data PTK tidak ditemukan" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching PTK by ID:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
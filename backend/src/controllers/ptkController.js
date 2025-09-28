const pool = require("../../config/database");

module.exports = {
  //mengambil seluruh data ptk
  async getAll(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM ptk ORDER BY ptk_id ASC"
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
      const {  nip , nuptk, email, search} = req.query;

      let query = "SELECT * FROM ptk WHERE 1=1";
      let params = [];
      let index = 1;

      if (nip) {
        query += ` AND nip = $${index}`;
        params.push(nip);
        index++;
      }

      if (nuptk) {
        query += ` AND nuptk = $${index}`;
        params.push(nuptk);
        index++;
      }

      if (email) {
        query += ` AND email = $${index}`;
        params.push(email);
        index++;
      }

      if (search) {
        query += ` AND (nama ILIKE $${index}`;
        params.push(`%${search}%`);
        index++;
      }

      query += " ORDER BY ptk_id ASC";

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data PTK tidak ditemukan" });
      }

      res.json(result.rows[0]);
    }
    catch (error) {
      console.error("Gagal mengambil data PTK", error);
      res.status(500).json({error : "Internal Server Error" });
    }
  },

//mengambil seluruh data ptk menggunakan id
  async getById(req, res) {
    const { ptk_id } = req.params;

    if (isNaN(ptk_id)) {
      return res.status(400).json({ error: "ID harus berupa angka" });
    }

    try {
      const result = await pool.query(
        "SELECT * FROM ptk WHERE ptk_id = $1",
        [ptk_id]
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
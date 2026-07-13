const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const sanksi = await pool.query("SELECT * FROM sanksi_siswa WHERE id_siswa = 'fdbb2c93-ab48-4e8d-bb74-25fb6ff14445'");
    console.log("Sanksi Najwa:", sanksi.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

main();

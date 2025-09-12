// const fs = require("fs");
// const path = require("path");
// const pool = require("./config/database");

// async function runMigrations() {
//   const migrationsDir = path.join(__dirname, "migrations");
//   const files = fs.readdirSync(migrationsDir).sort();

//   for (const file of files) {
//     const filePath = path.join(migrationsDir, file);
//     const sql = fs.readFileSync(filePath, "utf8");
//     console.log(`Running migration: ${file}`);
//     await pool.query(sql);
//   }

//   console.log("All migrations executed ✅");
//   pool.end();
// }

// runMigrations().catch((err) => {
//   console.error("Migration failed ❌", err);
//   pool.end();
// });

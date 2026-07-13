const pool = require("../../config/database");

module.exports = {
  // 1. Ambil daftar notifikasi untuk user yang sedang login
  async getMyNotifications(req, res) {
    try {
      const id_user = req.user?.id; // Membaca UUID user dari JWT token / session
      const { limit = 10, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      // Query disesuaikan hanya mengambil kolom yang ada di skema tabelmu
      const queryText = `
        SELECT id_notifikasi, judul, pesan, is_read, created_at 
        FROM notifikasi 
        WHERE id_user = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;

      const resNotif = await pool.query(queryText, [id_user, limit, offset]);

      // Ambil total notifikasi yang belum dibaca (untuk info badge)
      const resUnread = await pool.query(
        `SELECT COUNT(*) FROM notifikasi WHERE id_user = $1 AND is_read = false`,
        [id_user],
      );

      res.json({
        unread_count: parseInt(resUnread.rows[0].count, 10),
        data: resNotif.rows,
      });
    } catch (error) {
      console.error("Error Get Notif:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // 2. Tandai satu notifikasi atau semua notifikasi telah dibaca
  async markAsRead(req, res) {
    try {
      const id_user = req.user?.id;
      const { id_notifikasi } = req.body; // Kirim id_notifikasi jika ingin spesifik, kosongkan jika ingin "read all"

      let queryText = "";
      let queryParams = [];

      if (id_notifikasi) {
        queryText = `UPDATE notifikasi SET is_read = true WHERE id_user = $1 AND id_notifikasi = $2`;
        queryParams = [id_user, id_notifikasi];
      } else {
        queryText = `UPDATE notifikasi SET is_read = true WHERE id_user = $1`;
        queryParams = [id_user];
      }

      await pool.query(queryText, queryParams);
      res.json({ message: "Notifikasi berhasil diperbarui" });
    } catch (error) {
      console.error("Error Read Notif:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // 3. FUNGSI UTILITY INTERNAL (Pemicu Otomatis saat input data pelanggaran/pembinaan)
  // Dipanggil langsung di controller lain, bukan melalui routing API
  async createInternalNotification(id_user, judul, pesan) {
    try {
      if (!id_user) return false;

      const queryText = `
        INSERT INTO notifikasi (id_user, judul, pesan, is_read) 
        VALUES ($1, $2, $3, false)
      `;
      await pool.query(queryText, [id_user, judul, pesan]);
      return true;
    } catch (error) {
      console.error("Gagal membuat notifikasi internal:", error.message);
      return false;
    }
  },
};

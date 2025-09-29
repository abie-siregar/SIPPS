import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ambil Avatar Profile
export const getPicture = (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Nama file dibutuhkan" });

  const filePath = path.join(__dirname, "../uploads/avatars", name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File tidak ditemukan" });
  }

  res.sendFile(filePath);
};

// POST upload avatar
export const uploadPicture = (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File dibutuhkan" });

  res.json({ message: "File berhasil diupload", file: req.file.filename });
};

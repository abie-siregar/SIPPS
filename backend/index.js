require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const pelanggaranRoutes = require("./routes/pelanggaran");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // Hanya izinkan dari origin ini
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Metode HTTP yang diizinkan
  credentials: true, // Izinkan pengiriman cookies atau authorization headers
  optionsSuccessStatus: 204, // Untuk preflight requests
};

app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/pelanggaran", pelanggaranRoutes);

app.get("/", (req, res) => {
  res.send("API SIPPS Running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// const siswaRoutes = require("./routes/siswa");
// app.use("/api/siswa", siswaRoutes);

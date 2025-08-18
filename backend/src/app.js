require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const poinPelanggaranRoutes = require("./routes/poinPelanggaran");
const ptkRoutes = require("../src/controller/ptk/GetPtk");
const siswaRoutes = require("../src/controller/pesertadidik/GetPesertaDidik");
const rombelRoutes = require("./routes/rombel");

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/poin-pelanggaran", poinPelanggaranRoutes);
app.use("/api/rombel", rombelRoutes);
app.use("/api/ptk", ptkRoutes);
app.use("/api/siswa", siswaRoutes);

app.get("/", (req, res) => {
  res.send("API SIPPS Running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

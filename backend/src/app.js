require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const pelanggaranRoutes = require("./routes/pelanggaran");
const ptkRoutes = require("../src/controller/ptk/GetPtk");
const siswaRoutes = require("../src/controller/pesertadidik/GetPesertaDidik");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/pelanggaran", pelanggaranRoutes);
app.use("/api/ptk", ptkRoutes);
app.use("/api/siswa", siswaRoutes);

app.get("/", (req, res) => {
  res.send("API SIPPS Running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

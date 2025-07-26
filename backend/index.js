require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Initialize for Auth
const authRoutes = require("./routes/auth");

// Initialize for Pelanggaran
const pelanggaranRoutes = require("./routes/pelanggaran");

// Initialize for Rombel
const getListRombel = require("./routes/Rombel/GetListRombel");
const getRombel = require("./routes/Rombel/GetRombel");
const updateRombel = require("./routes/Rombel/UpdateRombel");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/pelanggaran", pelanggaranRoutes);

// API for Rombel
app.use("/api/rombel", getListRombel);
app.use("/api/rombel", getRombel);
app.use("/api/rombel", updateRombel);

app.get("/", (req, res) => {
  res.send("API SIPPS Running...");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// const siswaRoutes = require("./routes/siswa");
// app.use("/api/siswa", siswaRoutes);

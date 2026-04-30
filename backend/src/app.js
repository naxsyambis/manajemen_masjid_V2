const express = require("express");
const cors = require("cors");
const path = require("path");
require("./models");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/auth", require("./routes/auth.routes"));
app.use("/superadmin", require("./routes/superadmin.routes"));
app.use("/takmir", require("./routes/takmir.routes"));
app.use("/public", require("./routes/public.routes"));

// ROUTE VERIFIKASI TTD KWITANSI
app.use("/", require("./routes/verifikasiTtdRoutes"));

// ROUTE LAPORAN KEUANGAN QR → PDF
app.use("/", require("./routes/laporanKeuanganRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("Backend hidup 🚀");
});

module.exports = app;
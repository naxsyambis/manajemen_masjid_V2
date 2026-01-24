const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use("/auth", require("./routes/auth.routes"));
app.use("/superadmin", require("./routes/superadmin.routes"));
app.use("/takmir", require("./routes/takmir.routes"));
app.use("/public", require("./routes/public.routes"));

app.use(
    "/files",
    express.static(path.join(__dirname, "src/files"))
);

app.get("/", (req, res) => {
    res.send("Backend hidup 🚀");
});

module.exports = app;

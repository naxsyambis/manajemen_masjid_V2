const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/superadmin", require("./routes/superadmin.routes"));
app.use("/takmir", require("./routes/takmir.routes"));
app.use("/public", require("./routes/public.routes"));

app.get("/", (req, res) => {
    res.send("Backend hidup 🚀");
});

module.exports = app;

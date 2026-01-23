const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");

exports.create = async (req, res) => {
  try {
    const { nama, email, password, masjid_id } = req.body;

    if (!nama || !email || !password || !masjid_id) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nama,
      email,
      password: hash,
      role: "takmir"
    });

    await MasjidTakmir.create({
      user_id: user.user_id,
      masjid_id,
      pembuatakun: req.user.user_id
    });

    res.status(201).json({ message: "Takmir berhasil dibuat" });

  } catch (err) {
    console.error("CREATE TAKMIR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

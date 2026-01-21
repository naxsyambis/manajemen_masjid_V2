const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");

exports.create = async (req, res) => {
    const password = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
        nama: req.body.nama,
        email: req.body.email,
        password,
        role: "takmir"
    });

    await MasjidTakmir.create({
        user_id: user.user_id,
        masjid_id: req.body.masjid_id,
        pembuatakun: req.user.user_id
    });

    res.json({ message: "Takmir berhasil dibuat" });
};

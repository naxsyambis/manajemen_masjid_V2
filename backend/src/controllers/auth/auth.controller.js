const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");
const { secret } = require("../../config/jwt");

exports.login = async (req, res) => {
    const user = await User.findOne({
        where: { email: req.body.email }
    });

    if (!user) {
        return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
        return res.status(401).json({ message: "Password salah" });
    }

    let masjid_id = null;

    // JIKA TAKMIR, AMBIL MASJID
    if (user.role === "takmir") {
        const mapping = await MasjidTakmir.findOne({
            where: { user_id: user.user_id }
        });

        if (!mapping) {
            return res.status(403).json({ message: "Takmir belum punya masjid" });
        }

        masjid_id = mapping.masjid_id;
    }

    const token = jwt.sign(
        {
            user_id: user.user_id,
            role: user.role,
            masjid_id
        },
        secret,
        { expiresIn: "1d" }
    );

    res.json({ token });
};

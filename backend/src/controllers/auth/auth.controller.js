const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");
const { secret } = require("../../config/jwt");

exports.register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        // Validasi sederhana
        if (!nama || !email || !password || !role) {
            return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        if (!["super admin", "takmir"].includes(role)) {
            return res.status(400).json({ message: "Role tidak valid" });
        }

        // Cek email sudah dipakai atau belum
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user
        const newUser = await User.create({
            nama,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: "Register berhasil",
            user: {
                user_id: newUser.user_id,
                nama: newUser.nama,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};


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

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: ['nama', 'email', 'role', 'foto_tanda_tangan']
        });

        // CARI MASJIDNYA JUGA!
        const mapping = await MasjidTakmir.findOne({
            where: { user_id: req.user.user_id }
        });

        res.json({
            ...user.toJSON(),
            masjid_id: mapping ? mapping.masjid_id : null
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal ambil profil" });
    }
};

/* ================= UPDATE TANDA TANGAN TAKMIR ================= */
exports.updateTtd = async (req, res) => {
    try {
        if (req.user.role !== "takmir") {
        return res.status(403).json({ message: "Akses ditolak" });
        }

        const { foto_tanda_tangan } = req.body;

        if (foto_tanda_tangan === undefined) {
        return res.status(400).json({ message: "Data TTD tidak valid" });
        }

        const user = await User.findByPk(req.user.user_id);
        if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
        }

        await user.update({ foto_tanda_tangan });

        return res.status(200).json({
        message: "TTD berhasil disimpan"
        });

    } catch (err) {
        console.error("ERROR UPDATE TTD:", err);
        return res.status(500).json({
        message: "Gagal menyimpan tanda tangan"
        });
    }
    };

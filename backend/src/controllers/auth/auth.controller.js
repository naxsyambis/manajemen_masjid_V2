const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");
const { secret } = require("../../config/jwt");
const { logActivity } = require("../../services/auditLog.service");

exports.register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        if (!nama || !email || !password || !role) {
            return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nama,
            email,
            password: hashedPassword,
            role
        });

        await logActivity({
            req,
            action: "REGISTER",
            nama_tabel: "user_app",
            data_baru: newUser,
            record_id: newUser.user_id
        });

        res.status(201).json({ message: "Register berhasil" });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};


exports.login = async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(401).json({ message: "User tidak ditemukan" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).json({ message: "Password salah" });

    let masjid_id = null;

    if (user.role === "takmir") {
        const mapping = await MasjidTakmir.findOne({ where: { user_id: user.user_id } });
        if (!mapping) return res.status(403).json({ message: "Takmir belum punya masjid" });
        masjid_id = mapping.masjid_id;
    }

    const token = jwt.sign(
        { user_id: user.user_id, role: user.role, masjid_id },
        secret,
        { expiresIn: "1d" }
    );

    await logActivity({
        req,
        action: "LOGIN",
        nama_tabel: "user_app",
        data_baru: { email: user.email, role: user.role },
        record_id: user.user_id
    });

    res.json({ token });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: ['nama', 'email', 'role', 'foto_tanda_tangan']
        });

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


exports.updateTtd = async (req, res) => {
    const user = await User.findByPk(req.user.user_id);
    const oldData = user.toJSON();

    await user.update({ foto_tanda_tangan: req.body.foto_tanda_tangan });

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "user_app",
        data_lama: oldData,
        data_baru: user,
        record_id: user.user_id
    });

    res.json({ message: "TTD berhasil disimpan" });
};

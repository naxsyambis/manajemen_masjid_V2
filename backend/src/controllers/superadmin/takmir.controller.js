const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");
const { logActivity } = require("../../services/auditLog.service");

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

        await logActivity({
            req,
            action: "CREATE",
            nama_tabel: "takmir",
            data_baru: user,
            record_id: user.user_id
        });

        res.status(201).json({ message: "Takmir berhasil dibuat" });
    } catch (err) {
        console.error("CREATE TAKMIR ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getAll = async (req, res) => {
    const data = await MasjidTakmir.findAll();
    res.json(data);
};

exports.getById = async (req, res) => {
    const takmir = await MasjidTakmir.findByPk(req.params.id);
    if (!takmir) return res.status(404).json({ message: "Data takmir tidak ditemukan" });
    res.json(takmir);
};

exports.update = async (req, res) => {
    const takmir = await MasjidTakmir.findByPk(req.params.id);
    if (!takmir) return res.status(404).json({ message: "Data takmir tidak ditemukan" });

    const oldData = takmir.toJSON();

    await takmir.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "takmir",
        data_lama: oldData,
        data_baru: takmir,
        record_id: req.params.id
    });

    res.json({ message: "Data takmir berhasil diperbarui" });
};

exports.delete = async (req, res) => {
    const takmir = await MasjidTakmir.findByPk(req.params.id);
    if (!takmir) return res.status(404).json({ message: "Data takmir tidak ditemukan" });

    const oldData = takmir.toJSON();

    await takmir.destroy();

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "takmir",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Data takmir berhasil dihapus" });
};

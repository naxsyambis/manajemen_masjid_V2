const Kegiatan = require("../../models/Kegiatan");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Kegiatan.create({
        nama_kegiatan: req.body.nama_kegiatan,
        waktu_kegiatan: req.body.waktu_kegiatan,
        lokasi: req.body.lokasi,
        deskripsi: req.body.deskripsi,
        user_id: req.user.user_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "kegiatan",
        data_baru: data,
        record_id: data.kegiatan_id
    });

    res.json(data);
};

exports.update = async (req, res) => {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan) return res.status(404).json({ message: "Kegiatan tidak ditemukan" });

    const oldData = kegiatan.toJSON();
    await kegiatan.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "kegiatan",
        data_lama: oldData,
        data_baru: kegiatan,
        record_id: req.params.id
    });

    res.json({ message: "Kegiatan berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Kegiatan.findByPk(req.params.id);

    await Kegiatan.destroy({ where: { kegiatan_id: req.params.id } });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "kegiatan",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Kegiatan berhasil dihapus" });
};

exports.getAll = async (req, res) => {
    res.json(await Kegiatan.findAll());
};

exports.getById = async (req, res) => {
    const data = await Kegiatan.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
    res.json(data);
};


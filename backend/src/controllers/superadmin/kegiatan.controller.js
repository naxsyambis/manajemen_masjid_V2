const Kegiatan = require("../../models/Kegiatan");

exports.create = async (req, res) => {
    const data = await Kegiatan.create({
        nama_kegiatan: req.body.nama_kegiatan,
        waktu_kegiatan: req.body.waktu_kegiatan,
        lokasi: req.body.lokasi,
        deskripsi: req.body.deskripsi,
        user_id: req.user.user_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    res.json(await Kegiatan.findAll());
};

exports.getById = async (req, res) => {
    const data = await Kegiatan.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const kegiatan = await Kegiatan.findByPk(req.params.id);
    if (!kegiatan) return res.status(404).json({ message: "Kegiatan tidak ditemukan" });

    await kegiatan.update(req.body);
    res.json({ message: "Kegiatan berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Kegiatan.destroy({ where: { kegiatan_id: req.params.id } });
    res.json({ message: "Kegiatan berhasil dihapus" });
};

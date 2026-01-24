const Berita = require("../../models/Berita");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Berita.create({
        judul: req.body.judul,
        isi: req.body.isi,
        gambar: req.body.gambar,
        user_id: req.user.user_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "berita",
        data_baru: data,
        record_id: data.berita_id
    });

    res.json(data);
};

exports.update = async (req, res) => {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

    const oldData = berita.toJSON();
    await berita.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "berita",
        data_lama: oldData,
        data_baru: berita,
        record_id: req.params.id
    });

    res.json({ message: "Berita berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Berita.findByPk(req.params.id);

    await Berita.destroy({ where: { berita_id: req.params.id } });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "berita",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Berita berhasil dihapus" });
};

exports.getAll = async (req, res) => {
    res.json(await Berita.findAll());
};

exports.getById = async (req, res) => {
    const data = await Berita.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });
    res.json(data);
};


const Kategori = require("../../models/Kategori_Keuangan");

exports.create = async (req, res) => {
    const data = await Kategori.create({
        nama_kategori: req.body.nama_kategori,
        jenis: req.body.jenis,
        masjid_id: req.user.masjid_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    const data = await Kategori.findAll({
        where: { masjid_id: req.user.masjid_id }
    });
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await Kategori.findOne({
        where: {
            kategori_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!data) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.json(data);
};

exports.update = async (req, res) => {
    const updated = await Kategori.update(req.body, {
        where: {
            kategori_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.json({ message: "Kategori berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Kategori.destroy({
        where: {
            kategori_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    res.json({ message: "Kategori berhasil dihapus" });
};

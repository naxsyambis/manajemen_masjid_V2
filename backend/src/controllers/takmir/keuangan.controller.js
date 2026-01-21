const Keuangan = require("../../models/Keuangan");

exports.create = async (req, res) => {
    const data = await Keuangan.create({
        jumlah: req.body.jumlah,
        tanggal: req.body.tanggal,
        deskripsi: req.body.deskripsi,
        kategori_id: req.body.kategori_id,
        user_id: req.user.user_id,
        masjid_id: req.user.masjid_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    const data = await Keuangan.findAll({
        where: { masjid_id: req.user.masjid_id }
    });
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await Keuangan.findOne({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!data) {
        return res.status(404).json({ message: "Data keuangan tidak ditemukan" });
    }

    res.json(data);
};

exports.update = async (req, res) => {
    const updated = await Keuangan.update(req.body, {
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Data keuangan tidak ditemukan" });
    }

    res.json({ message: "Keuangan berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Keuangan.destroy({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });
    res.json({ message: "Keuangan berhasil dihapus" });
};

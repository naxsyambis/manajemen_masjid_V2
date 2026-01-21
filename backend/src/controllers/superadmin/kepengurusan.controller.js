const Kepengurusan = require("../../models/Kepengurusan");

exports.create = async (req, res) => {
    const data = await Kepengurusan.create({
        ...req.body,
        masjid_id: req.user.masjid_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    const data = await Kepengurusan.findAll({
        where: { masjid_id: req.user.masjid_id }
    });
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await Kepengurusan.findOne({
        where: {
            pengurus_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!data) {
        return res.status(404).json({ message: "Pengurus tidak ditemukan" });
    }

    res.json(data);
};

exports.update = async (req, res) => {
    const updated = await Kepengurusan.update(req.body, {
        where: {
            pengurus_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Pengurus tidak ditemukan" });
    }

    res.json({ message: "Pengurus berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Kepengurusan.destroy({
        where: {
            pengurus_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    res.json({ message: "Pengurus berhasil dihapus" });
};

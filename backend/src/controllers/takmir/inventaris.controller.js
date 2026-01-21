const Inventaris = require("../../models/Inventaris");

exports.create = async (req, res) => {
    const data = await Inventaris.create({
        ...req.body,
        user_id: req.user.user_id,
        masjid_id: req.user.masjid_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    const data = await Inventaris.findAll({
        where: { masjid_id: req.user.masjid_id }
    });
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await Inventaris.findOne({
        where: {
            inventaris_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!data) {
        return res.status(404).json({ message: "Inventaris tidak ditemukan" });
    }

    res.json(data);
};

exports.update = async (req, res) => {
    const updated = await Inventaris.update(req.body, {
        where: {
            inventaris_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Inventaris tidak ditemukan" });
    }

    res.json({ message: "Inventaris berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Inventaris.destroy({
        where: {
            inventaris_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    res.json({ message: "Inventaris berhasil dihapus" });
};

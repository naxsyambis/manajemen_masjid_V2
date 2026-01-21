const Jamaah = require("../../models/Jamaah");

exports.create = async (req, res) => {
    const data = await Jamaah.create({
        ...req.body,
        masjid_id: req.user.masjid_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    const data = await Jamaah.findAll({
        where: { masjid_id: req.user.masjid_id }
    });
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await Jamaah.findOne({
        where: {
            jamaah_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!data) {
        return res.status(404).json({ message: "Jamaah tidak ditemukan" });
    }

    res.json(data);
};

exports.update = async (req, res) => {
    const updated = await Jamaah.update(req.body, {
        where: {
            jamaah_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Jamaah tidak ditemukan" });
    }

    res.json({ message: "Jamaah berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Jamaah.destroy({
        where: {
            jamaah_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    res.json({ message: "Jamaah berhasil dihapus" });
};

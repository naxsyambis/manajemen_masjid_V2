const Masjid = require("../../models/Masjid");

exports.create = async (req, res) => {
    res.json(await Masjid.create(req.body));
};

exports.getAll = async (req, res) => {
    res.json(await Masjid.findAll());
};

exports.getById = async (req, res) => {
    const masjid = await Masjid.findByPk(req.params.id);
    if (!masjid) return res.status(404).json({ message: "Masjid tidak ditemukan" });
    res.json(masjid);
};

exports.update = async (req, res) => {
    const masjid = await Masjid.findByPk(req.params.id);
    if (!masjid) return res.status(404).json({ message: "Masjid tidak ditemukan" });

    await masjid.update(req.body);
    res.json({ message: "Masjid berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Masjid.destroy({ where: { masjid_id: req.params.id } });
    res.json({ message: "Masjid berhasil dihapus" });
};


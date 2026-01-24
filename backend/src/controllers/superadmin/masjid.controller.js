const Masjid = require("../../models/Masjid");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Masjid.create(req.body);

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "masjid",
        data_baru: data,
        record_id: data.masjid_id
    });

    res.json(data);
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

    const oldData = masjid.toJSON();

    await masjid.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "masjid",
        data_lama: oldData,
        data_baru: masjid,
        record_id: req.params.id
    });

    res.json({ message: "Masjid berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Masjid.findByPk(req.params.id);
    if (!oldData) return res.status(404).json({ message: "Masjid tidak ditemukan" });

    await Masjid.destroy({ where: { masjid_id: req.params.id } });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "masjid",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Masjid berhasil dihapus" });
};

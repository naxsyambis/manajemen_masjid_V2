const Inventaris = require("../../models/Inventaris");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Inventaris.create({
        ...req.body,
        user_id: req.user.user_id,
        masjid_id: req.user.masjid_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "inventaris",
        data_baru: data,
        record_id: data.inventaris_id
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

    if (!data) return res.status(404).json({ message: "Inventaris tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const inventaris = await Inventaris.findOne({
        where: {
            inventaris_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!inventaris) return res.status(404).json({ message: "Inventaris tidak ditemukan" });

    const oldData = inventaris.toJSON();

    await inventaris.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "inventaris",
        data_lama: oldData,
        data_baru: inventaris,
        record_id: req.params.id
    });

    res.json({ message: "Inventaris berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Inventaris.findOne({
        where: {
            inventaris_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!oldData) return res.status(404).json({ message: "Inventaris tidak ditemukan" });

    await Inventaris.destroy({
        where: {
            inventaris_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "inventaris",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Inventaris berhasil dihapus" });
};

const Kepengurusan = require("../../models/Kepengurusan");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Kepengurusan.create({
        ...req.body,
        masjid_id: req.user.masjid_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "kepengurusan",
        data_baru: data,
        record_id: data.pengurus_id
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

    if (!data) return res.status(404).json({ message: "Pengurus tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const kepengurusan = await Kepengurusan.findOne({
        where: {
            pengurus_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!kepengurusan) return res.status(404).json({ message: "Pengurus tidak ditemukan" });

    const oldData = kepengurusan.toJSON();

    await kepengurusan.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "kepengurusan",
        data_lama: oldData,
        data_baru: kepengurusan,
        record_id: req.params.id
    });

    res.json({ message: "Pengurus berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Kepengurusan.findOne({
        where: {
            pengurus_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!oldData) return res.status(404).json({ message: "Pengurus tidak ditemukan" });

    await Kepengurusan.destroy({
        where: {
            pengurus_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "kepengurusan",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Pengurus berhasil dihapus" });
};

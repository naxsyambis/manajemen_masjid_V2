const Jamaah = require("../../models/Jamaah");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Jamaah.create({
        ...req.body,
        masjid_id: req.user.masjid_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "jamaah",
        data_baru: data,
        record_id: data.jamaah_id
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

    if (!data) return res.status(404).json({ message: "Jamaah tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const jamaah = await Jamaah.findOne({
        where: {
            jamaah_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!jamaah) return res.status(404).json({ message: "Jamaah tidak ditemukan" });

    const oldData = jamaah.toJSON();

    await jamaah.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "jamaah",
        data_lama: oldData,
        data_baru: jamaah,
        record_id: req.params.id
    });

    res.json({ message: "Jamaah berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Jamaah.findOne({
        where: {
            jamaah_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!oldData) return res.status(404).json({ message: "Jamaah tidak ditemukan" });

    await Jamaah.destroy({
        where: {
            jamaah_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "jamaah",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Jamaah berhasil dihapus" });
};

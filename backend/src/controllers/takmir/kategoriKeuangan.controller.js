const Kategori = require("../../models/Kategori_Keuangan");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Kategori.create({
        nama_kategori: req.body.nama_kategori,
        jenis: req.body.jenis,
        masjid_id: req.user.masjid_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "kategori_keuangan",
        data_baru: data,
        record_id: data.kategori_id
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

    if (!data) return res.status(404).json({ message: "Kategori tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const kategori = await Kategori.findOne({
        where: {
            kategori_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!kategori) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const oldData = kategori.toJSON();

    await kategori.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "kategori_keuangan",
        data_lama: oldData,
        data_baru: kategori,
        record_id: req.params.id
    });

    res.json({ message: "Kategori berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Kategori.findOne({
        where: {
            kategori_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!oldData) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    await Kategori.destroy({
        where: {
            kategori_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "kategori_keuangan",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Kategori berhasil dihapus" });
};

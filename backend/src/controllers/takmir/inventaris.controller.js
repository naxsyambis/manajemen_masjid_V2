const Inventaris = require("../../models/Inventaris");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    try {
        const namaBarangBaku = req.body.nama_barang ? req.body.nama_barang.toLowerCase().trim() : '';

        const data = await Inventaris.create({
            ...req.body,
            nama_barang: namaBarangBaku, 
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
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan inventaris", error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const data = await Inventaris.findAll({
            where: { masjid_id: req.user.masjid_id },
            order: [['nama_barang', 'ASC']] 
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Inventaris.findOne({
            where: {
                inventaris_id: req.params.id,
                masjid_id: req.user.masjid_id
            }
        });

        if (!data) return res.status(404).json({ message: "Inventaris tidak ditemukan" });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const inventaris = await Inventaris.findOne({
            where: {
                inventaris_id: req.params.id,
                masjid_id: req.user.masjid_id
            }
        });

        if (!inventaris) return res.status(404).json({ message: "Inventaris tidak ditemukan" });

        const oldData = inventaris.toJSON();

        const namaBarangBaku = req.body.nama_barang ? req.body.nama_barang.toLowerCase().trim() : inventaris.nama_barang;

        await inventaris.update({
            ...req.body,
            nama_barang: namaBarangBaku
        });

        await logActivity({
            req,
            action: "UPDATE",
            nama_tabel: "inventaris",
            data_lama: oldData,
            data_baru: inventaris,
            record_id: req.params.id
        });

        res.json({ message: "Inventaris berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate data", error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus data", error: error.message });
    }
};
const { RekeningMasjid } = require('../../models');
const { logActivity } = require('../../services/auditLog.service');

exports.getAllRekening = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        const rekening = await RekeningMasjid.findAll({
            where: masjid_id ? { masjid_id } : {}
        });
        res.status(200).json({ data: rekening });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data rekening", error: error.message });
    }
};

exports.createRekening = async (req, res) => {
    try {
        const { masjid_id, nama_bank, no_rekening, atas_nama } = req.body;
        
        const newRekening = await RekeningMasjid.create({ masjid_id, nama_bank, no_rekening, atas_nama });

        await logActivity(req.user.user_id, 'create', 'rekening_masjid', null, newRekening, newRekening.rekening_id, req.ip);

        res.status(201).json({ message: "Rekening berhasil ditambahkan", data: newRekening });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan rekening", error: error.message });
    }
};

exports.updateRekening = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_bank, no_rekening, atas_nama } = req.body;

        const rekening = await RekeningMasjid.findByPk(id);
        if (!rekening) return res.status(404).json({ message: "Rekening tidak ditemukan" });

        const dataLama = { ...rekening.toJSON() };
        
        rekening.nama_bank = nama_bank || rekening.nama_bank;
        rekening.no_rekening = no_rekening || rekening.no_rekening;
        rekening.atas_nama = atas_nama || rekening.atas_nama;
        await rekening.save();

        await logActivity(req.user.user_id, 'update', 'rekening_masjid', dataLama, rekening, rekening.rekening_id, req.ip);

        res.status(200).json({ message: "Rekening berhasil diupdate", data: rekening });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate rekening", error: error.message });
    }
};

exports.deleteRekening = async (req, res) => {
    try {
        const { id } = req.params;

        const rekening = await RekeningMasjid.findByPk(id);
        if (!rekening) return res.status(404).json({ message: "Rekening tidak ditemukan" });

        const dataLama = { ...rekening.toJSON() };
        await rekening.destroy();

        await logActivity(req.user.user_id, 'delete', 'rekening_masjid', dataLama, null, id, req.ip);

        res.status(200).json({ message: "Rekening berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus rekening", error: error.message });
    }
};
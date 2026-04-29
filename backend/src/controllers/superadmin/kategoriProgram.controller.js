const { KategoriProgram } = require('../../models');
const { logActivity } = require('../../services/auditLog.service');

exports.getAllKategoriProgram = async (req, res) => {
    try {
        const { masjid_id } = req.query; 
        const kategori = await KategoriProgram.findAll({
            where: masjid_id ? { masjid_id } : {}
        });
        res.status(200).json({ data: kategori });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data kategori program", error: error.message });
    }
};

exports.createKategoriProgram = async (req, res) => {
    try {
        const { nama_kategori, masjid_id } = req.body;
        
        const newKategori = await KategoriProgram.create({ nama_kategori, masjid_id });

        await logActivity(req.user.user_id, 'create', 'kategori_program', null, newKategori, newKategori.kategori_id, req.ip);

        res.status(201).json({ message: "Kategori program berhasil ditambahkan", data: newKategori });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan kategori program", error: error.message });
    }
};

exports.updateKategoriProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kategori } = req.body;

        const kategori = await KategoriProgram.findByPk(id);
        if (!kategori) return res.status(404).json({ message: "Kategori tidak ditemukan" });

        const dataLama = { ...kategori.toJSON() };
        kategori.nama_kategori = nama_kategori;
        await kategori.save();

        await logActivity(req.user.user_id, 'update', 'kategori_program', dataLama, kategori, kategori.kategori_id, req.ip);

        res.status(200).json({ message: "Kategori program berhasil diupdate", data: kategori });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate kategori program", error: error.message });
    }
};

exports.deleteKategoriProgram = async (req, res) => {
    try {
        const { id } = req.params;

        const kategori = await KategoriProgram.findByPk(id);
        if (!kategori) return res.status(404).json({ message: "Kategori tidak ditemukan" });

        const dataLama = { ...kategori.toJSON() };
        await kategori.destroy();

        await logActivity(req.user.user_id, 'delete', 'kategori_program', dataLama, null, id, req.ip);

        res.status(200).json({ message: "Kategori program berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus kategori program", error: error.message });
    }
};
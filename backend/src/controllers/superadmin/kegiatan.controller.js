const Kegiatan = require("../../models/Kegiatan");
const { logActivity } = require("../../services/auditLog.service");

exports.createKegiatan = async (req, res) => {
    try {
        const { nama_kegiatan, waktu_kegiatan, lokasi, deskripsi } = req.body;
        const poster = req.file ? req.file.filename : null;

        const newKegiatan = await Kegiatan.create({
            nama_kegiatan,
            waktu_kegiatan,
            lokasi,
            deskripsi,
            poster, 
            user_id: req.user.user_id
        });

        await logActivity({
            req,
            action: 'CREATE',
            nama_tabel: 'kegiatan',
            data_baru: newKegiatan.toJSON(),
            record_id: newKegiatan.kegiatan_id
        });

        res.status(201).json({ message: "Kegiatan berhasil ditambahkan", data: newKegiatan });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan data", error: error.message });
    }
};

exports.updateKegiatan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kegiatan, waktu_kegiatan, lokasi, deskripsi } = req.body;
        const posterBaru = req.file ? req.file.filename : null;

        const kegiatan = await Kegiatan.findByPk(id);
        if (!kegiatan) return res.status(404).json({ message: "Data tidak ditemukan" });

        const dataLama = { ...kegiatan.toJSON() };

        kegiatan.nama_kegiatan = nama_kegiatan || kegiatan.nama_kegiatan;
        kegiatan.waktu_kegiatan = waktu_kegiatan || kegiatan.waktu_kegiatan;
        kegiatan.lokasi = lokasi || kegiatan.lokasi;
        kegiatan.deskripsi = deskripsi || kegiatan.deskripsi;
        if (posterBaru) kegiatan.poster = posterBaru;

        await kegiatan.save();

        await logActivity({
            req,
            action: 'UPDATE',
            nama_tabel: 'kegiatan',
            data_lama: dataLama,
            data_baru: kegiatan.toJSON(),
            record_id: kegiatan.kegiatan_id
        });

        res.status(200).json({ message: "Kegiatan berhasil diupdate", data: kegiatan });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate data", error: error.message });
    }
};

exports.deleteKegiatan = async (req, res) => {
    try {
        const { id } = req.params;
        const kegiatan = await Kegiatan.findByPk(id);
        if (!kegiatan) return res.status(404).json({ message: "Data tidak ditemukan" });

        const dataLama = { ...kegiatan.toJSON() };
        await kegiatan.destroy();

        await logActivity({
            req,
            action: 'DELETE',
            nama_tabel: 'kegiatan',
            data_lama: dataLama,
            record_id: id
        });

        res.status(200).json({ message: "Kegiatan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus data", error: error.message });
    }
};

exports.getAllKegiatan = async (req, res) => {
    try {
        const kegiatan = await Kegiatan.findAll();
        res.status(200).json({ data: kegiatan }); 
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Kegiatan.findByPk(req.params.id);
        if (!data) return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};
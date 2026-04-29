const { StrukturOrganisasi } = require('../../models');
const { logActivity } = require('../../services/auditLog.service');
const fs = require('fs');
const path = require('path');

exports.getAllStruktur = async (req, res) => {
    try {
        const { masjid_id } = req.query; 
        
        const struktur = await StrukturOrganisasi.findAll({
            where: masjid_id ? { masjid_id } : {},
            order: [['struktur_id', 'ASC']] 
        });

        res.status(200).json({
            message: "Berhasil mengambil data struktur organisasi",
            data: struktur
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

exports.createStruktur = async (req, res) => {
    try {
        const { nama, jabatan, masjid_id, periode_mulai, periode_selesai } = req.body;
        const foto = req.file ? req.file.filename : null;

        if (!nama || !jabatan || !masjid_id) {
            return res.status(400).json({ message: "Nama, jabatan, dan ID Masjid wajib diisi!" });
        }

        const newStruktur = await StrukturOrganisasi.create({
            nama,
            jabatan,
            masjid_id,
            periode_mulai: periode_mulai || null,
            periode_selesai: periode_selesai || null,
            foto
        });

        await logActivity(
            req.user.user_id, 
            'create', 
            'struktur_organisasi', 
            null, 
            newStruktur, 
            newStruktur.struktur_id, 
            req.ip
        );

        res.status(201).json({
            message: "Struktur organisasi berhasil ditambahkan",
            data: newStruktur
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan data", error: error.message });
    }
};

exports.updateStruktur = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, jabatan, periode_mulai, periode_selesai } = req.body;
        const fotoBaru = req.file ? req.file.filename : null;

        const struktur = await StrukturOrganisasi.findByPk(id);
        if (!struktur) {
            return res.status(404).json({ message: "Data struktur tidak ditemukan" });
        }

        const dataLama = { ...struktur.toJSON() };

        if (fotoBaru && struktur.foto) {
            const oldPhotoPath = path.join(__dirname, '../../../uploads/kepengurusan', struktur.foto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        struktur.nama = nama || struktur.nama;
        struktur.jabatan = jabatan || struktur.jabatan;
        if (periode_mulai) struktur.periode_mulai = periode_mulai;
        if (periode_selesai) struktur.periode_selesai = periode_selesai;
        if (fotoBaru) struktur.foto = fotoBaru;

        await struktur.save();

        await logActivity(
            req.user.user_id, 
            'update', 
            'struktur_organisasi', 
            dataLama, 
            struktur, 
            struktur.struktur_id, 
            req.ip
        );

        res.status(200).json({
            message: "Struktur organisasi berhasil diupdate",
            data: struktur
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate data", error: error.message });
    }
};

exports.deleteStruktur = async (req, res) => {
    try {
        const { id } = req.params;

        const struktur = await StrukturOrganisasi.findByPk(id);
        if (!struktur) {
            return res.status(404).json({ message: "Data struktur tidak ditemukan" });
        }

        const dataLama = { ...struktur.toJSON() };

        if (struktur.foto) {
            const photoPath = path.join(__dirname, '../../../uploads/kepengurusan', struktur.foto);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await struktur.destroy();

        await logActivity(
            req.user.user_id, 
            'delete', 
            'struktur_organisasi', 
            dataLama, 
            null, 
            id, 
            req.ip
        );

        res.status(200).json({ message: "Struktur organisasi berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus data", error: error.message });
    }
};
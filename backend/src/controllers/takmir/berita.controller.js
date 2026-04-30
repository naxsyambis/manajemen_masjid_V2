const Berita = require("../../models/Berita");
const BeritaGambar = require("../../models/BeritaGambar");
const { logActivity } = require("../../services/auditLog.service");
const fs = require("fs");
const path = require("path");

exports.getAllBerita = async (req, res) => {
    try {
        const berita = await Berita.findAll({ order: [['tanggal', 'DESC']] });
        res.status(200).json({ data: berita });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

exports.getById = async (req, res) => {
  try {
    const data = await Berita.findByPk(req.params.id, {
      include: [
        {
          model: BeritaGambar,
          as: "gambar_list",
          attributes: ["gambar_id", "path_gambar"]
        }
      ]
    });

    if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBerita = async (req, res) => {
    try {
        const { judul, isi, masjid_id, youtube_url } = req.body;

        let gambarUtama = null;
        if (req.files && req.files.length > 0) {
            gambarUtama = req.files[0].filename; 
        }

        const newBerita = await Berita.create({
            judul,
            isi,
            masjid_id,
            youtube_url: youtube_url || null, 
            gambar: gambarUtama, 
            user_id: req.user.user_id,
        });

        if (req.files && req.files.length > 0) {
            const gambarData = req.files.map((file) => ({
                berita_id: newBerita.berita_id,
                path_gambar: file.filename,
            }));
            await BeritaGambar.bulkCreate(gambarData);
        }

        await logActivity(req.user.user_id, 'create', 'berita_masjid', null, newBerita, newBerita.berita_id, req.ip);
        res.status(201).json({ message: "Berita berhasil ditambahkan", data: newBerita });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan berita", error: error.message });
    }
};

exports.updateBerita = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, isi, youtube_url } = req.body;

        const berita = await Berita.findByPk(id);
        if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

        const dataLama = { ...berita.toJSON() };

        berita.judul = judul || berita.judul;
        berita.isi = isi || berita.isi;
        berita.youtube_url = youtube_url !== undefined ? youtube_url : berita.youtube_url;
        
        if (req.files && req.files.length > 0) {
            berita.gambar = req.files[0].filename;
        }

        await berita.save();

        if (req.files && req.files.length > 0) {
            const gambarData = req.files.map((file) => ({
                berita_id: berita.berita_id,
                path_gambar: file.filename,
            }));
            await BeritaGambar.bulkCreate(gambarData);
        }

        await logActivity(req.user.user_id, 'update', 'berita_masjid', dataLama, berita, berita.berita_id, req.ip);
        res.status(200).json({ message: "Berita berhasil diupdate", data: berita });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate berita", error: error.message });
    }
};

exports.deleteBerita = async (req, res) => {
    try {
        const { id } = req.params;
        const berita = await Berita.findByPk(id);
        if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

        const dataLama = { ...berita.toJSON() };
        await berita.destroy();

        await logActivity(req.user.user_id, 'delete', 'berita_masjid', dataLama, null, id, req.ip);
        res.status(200).json({ message: "Berita berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus berita", error: error.message });
    }
};
const Berita = require("../../models/Berita");
const BeritaGambar = require("../../models/BeritaGambar");
const { logActivity } = require("../../services/auditLog.service");
const fs = require("fs");
const path = require("path");

exports.create = async (req, res) => {
  try {
    let gambarUtama = null;
    
    if (req.files && req.files.length > 0) {
      gambarUtama = req.files[0].filename; 
    }

    const data = await Berita.create({
      judul: req.body.judul,
      isi: req.body.isi,
      tanggal: new Date(),
      gambar: gambarUtama, 
      youtube_url: req.body.youtube_url || null, 
      user_id: req.user.user_id,
      masjid_id: req.body.masjid_id,
      status: "dipublikasi",
      published_at: new Date()
    });

    if (req.files && req.files.length > 0) {
      const gambarData = req.files.map(file => ({
        berita_id: data.berita_id,
        path_gambar: file.filename 
      }));
      await BeritaGambar.bulkCreate(gambarData);
    }

    await logActivity({
      req,
      action: "CREATE",
      nama_tabel: "berita_masjid",
      data_baru: data.toJSON(),
      record_id: data.berita_id
    });

    res.json(data);
  } catch (error) {
    console.error("CREATE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal tambah berita" });
  }
};

exports.update = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

    const oldData = berita.toJSON();
    let gambarPath = berita.gambar;

    if (req.body.deletedImages) {
      const deletedIds = JSON.parse(req.body.deletedImages);

      if (deletedIds.length > 0) {
        const imagesToDelete = await BeritaGambar.findAll({
          where: { gambar_id: deletedIds }
        });

        for (const img of imagesToDelete) {
          const filePath = path.join(__dirname, "../../../uploads/berita", img.path_gambar);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        await BeritaGambar.destroy({
          where: { gambar_id: deletedIds }
        });
      }
    }

    if (req.files && req.files.length > 0) {
      const gambarData = req.files.map(file => ({
        berita_id: berita.berita_id,
        path_gambar: file.filename
      }));
      await BeritaGambar.bulkCreate(gambarData);
    }

    const remainingImages = await BeritaGambar.findAll({
      where: { berita_id: berita.berita_id },
      order: [["gambar_id", "ASC"]]
    });

    gambarPath = remainingImages.length ? remainingImages[0].path_gambar : null;

    await berita.update({
      judul: req.body.judul,
      isi: req.body.isi,
      youtube_url: req.body.youtube_url || null, 
      gambar: gambarPath
    });

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "berita_masjid",
      data_lama: oldData,
      data_baru: berita.toJSON(),
      record_id: berita.berita_id
    });

    res.json({ message: "Berita berhasil diupdate", data: berita });

  } catch (error) {
    console.error("UPDATE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal update berita" });
  }
};

exports.delete = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

    if (berita.gambar) {
      const filePath = path.join(__dirname, "../../../uploads/berita", berita.gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const gallery = await BeritaGambar.findAll({
      where: { berita_id: req.params.id }
    });

    for (const img of gallery) {
      const filePath = path.join(__dirname, "../../../uploads/berita", img.path_gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Berita.destroy({ where: { berita_id: req.params.id } });

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "berita_masjid",
      data_lama: berita.toJSON(),
      record_id: req.params.id
    });

    res.json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    console.error("DELETE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal hapus berita" });
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
      ],
      order: [[{ model: BeritaGambar, as: "gambar_list" }, "gambar_id", "ASC"]]
    });

    if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });

    res.json(data);
  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Berita.findAll({
      include: [
        {
          model: BeritaGambar,
          as: "gambar_list",
          attributes: ["gambar_id", "path_gambar"]
        }
      ],
      order: [["tanggal", "DESC"]]
    });

    res.json(data);
  } catch (error) {
    console.error("GET ALL BERITA ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

    const oldData = berita.toJSON();
    let publishedAt = berita.published_at;

    if (req.body.status === "dipublikasi") {
      publishedAt = new Date();
    }

    await berita.update({
      status: req.body.status,
      approved_by: req.user.user_id,
      approved_at: new Date(),
      published_at: publishedAt
    });

    await logActivity({
      req,
      action: "APPROVAL",
      nama_tabel: "berita_masjid",
      data_lama: oldData,
      data_baru: berita.toJSON(),
      record_id: berita.berita_id
    });

    res.json({ message: "Status berita berhasil diupdate" });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Gagal update status" });
  }
};